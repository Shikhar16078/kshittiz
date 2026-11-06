'use client';

import { useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * How much ambient motion this device gets, decided at runtime rather than by device type:
 *
 * - `full`: everything (the default for every device).
 * - `lite`: continuous ambient loops (beams, marquee drift, glows, sweeps, pings) are switched
 *   off; reveals, hovers and taps stay. Chosen when the browser hints at a constrained device
 *   (Data Saver, very little memory or CPU), or when the frame probe sees the page actually
 *   struggling (an old or overheating phone, Low Power Mode).
 *
 * Reduced motion is separate (the OS setting, via Motion's `useReducedMotion`) and stricter.
 * The tier only ever steps down within a session (no flip-flopping) and is remembered for the
 * session, so the next page load starts where this one ended. It's mirrored on <html> as
 * `data-motion` so CSS can read it too.
 */
type MotionTier = 'full' | 'lite';

const STORAGE_KEY = 'motion-tier';

let tier: MotionTier = 'full';
const listeners = new Set<() => void>();

function setTier(next: MotionTier) {
  if (tier === next || tier === 'lite') return; // downgrade only
  tier = next;
  document.documentElement.dataset.motion = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: the tier just isn't remembered.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current tier; `full` for the server render and hydration. */
function useMotionTier(): MotionTier {
  return useSyncExternalStore(
    subscribe,
    () => tier,
    () => 'full',
  );
}

/**
 * True when continuous ambient motion may run: the tier is `full` and reduced motion is off.
 * Gate every endless loop on this (plus being on screen).
 */
export function useAmbientMotion() {
  const reduce = useReducedMotion();
  return useMotionTier() === 'full' && !reduce;
}

type NavigatorHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/** Browser hints that the device is constrained (Chromium exposes more of these than Safari). */
function constrainedByHints() {
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return true;
  return false;
}

// Probe: watch real frame times for a second. A median frame over ~28 ms (under ~36 fps
// sustained, e.g. Low Power Mode's 30 fps cap) or more than 25% of frames over 50 ms (constant
// visible hitches) means the page is too much for this device right now. One busy moment (a nav
// jump starting a section's reveals) can hitch on any machine, so a slow probe is re-checked
// straight after, and only two slow probes in a row step the tier down.
const PROBE_MS = 1000;
const RECHECK_AFTER = 1500;
const SLOW_MEDIAN = 28;
const HITCH = 50;
const HITCH_SHARE = 0.25;
// When to probe: after the load burst has settled, then a few more times while the visitor
// scrolls through the heavier sections. Each probe is one short rAF loop.
const PROBE_AT = [3000, 10000, 20000, 32000];

function probe(): Promise<boolean> {
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let last = performance.now();
    const end = last + PROBE_MS;
    const tick = (now: number) => {
      deltas.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else {
        deltas.sort((a, b) => a - b);
        const median = deltas[deltas.length >> 1] ?? 0;
        const hitches = deltas.filter((d) => d > HITCH).length / Math.max(deltas.length, 1);
        resolve(median > SLOW_MEDIAN || hitches > HITCH_SHARE);
      }
    };
    requestAnimationFrame(tick);
  });
}

let started = false;

/** Picks the starting tier and schedules the frame probes. Call once, after hydration. */
export function startMotionTier() {
  if (started) return;
  started = true;

  let saved: string | null = null;
  try {
    saved = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  if (saved === 'lite' || constrainedByHints()) {
    setTier('lite');
    return;
  }

  // Background tabs throttle rAF, which would look like a slow device: only probe when visible.
  const visible = () => document.visibilityState === 'visible';
  const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
  for (const at of PROBE_AT) {
    window.setTimeout(async () => {
      if (tier !== 'full' || !visible()) return;
      if (!(await probe()) || !visible()) return;
      await wait(RECHECK_AFTER);
      if (tier === 'full' && visible() && (await probe()) && visible()) setTier('lite');
    }, at);
  }
}
