'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  animate,
  m,
  useInView,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';
import { hash } from '@/lib/utils';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { useAmbientMotion } from '@/lib/motion-tier';

/** How far the soft halo ring reaches either side of the border, in px. */
const HALO = 6;

// A static ring mask: border-box minus content-box. Only the gradient inside it rotates, so
// each frame is a GPU transform; nothing repaints.
const RING_MASK = {
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
} as const;

// The comet: a long fading tail, a hot head in the accent and a lighter core at the very tip
// (clockwise, so the head is the arc's high-angle end).
const COMET =
  'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.12) 10deg, hsl(var(--primary) / 0.45) 32deg, hsl(var(--primary) / 0.85) 50deg, hsl(var(--primary)) 60deg, var(--beam-core) 67deg, var(--beam-core) 69.5deg, transparent 71deg, transparent 360deg)';
// A fainter, shorter arc going the other way (anticlockwise, so its head is the low-angle end).
const COUNTER =
  'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.6) 1.5deg, hsl(var(--primary) / 0.28) 14deg, transparent 40deg, transparent 360deg)';
// The halo follows the comet: a wide, low-alpha glow centred under the head. Gradient falloff
// along the arc, two overlapping rings for the falloff across it (no blur filter).
const HALO_GRADIENT =
  'conic-gradient(from 0deg, transparent 0deg, hsl(var(--glow) / 0.12) 24deg, hsl(var(--glow) / 0.5) 58deg, hsl(var(--glow) / 0.6) 68deg, hsl(var(--glow) / 0.2) 80deg, transparent 96deg, transparent 360deg)';

// The ring's core colour per theme. On light backgrounds a lighter core would wash out against
// white, so light keeps the full-strength amber; the dark-family themes get a near-white hot tip.
const THEME_VARS =
  '[--beam-core:hsl(var(--primary))] dark:[--beam-core:color-mix(in_oklab,hsl(var(--primary)),white_62%)] [--beam-halo:0.8] dark:[--beam-halo:0.75]';

/**
 * A comet of light travelling around its parent's border, with a fainter counter-arc and a soft
 * halo that follows the head.
 *
 * Place it inside a `relative` element with rounded corners (it inherits the radius). Every arc
 * is a static mask over a conic gradient that only rotates. The rotations are `transform`
 * animations that Motion hands to the browser (WAAPI), so they run on the GPU at the display's
 * full refresh rate and keep turning even while the main thread is busy. Every instance starts
 * at a different angle so cards on screen together don't move in step. The beam only runs while
 * on screen, speeds up and brightens while the parent is hovered, and is hidden with reduced
 * motion or on the `lite` motion tier.
 *
 * `duration` is seconds per lap; `width` is the ring thickness in px; `hoverSpeed` multiplies
 * the lap speed under the mouse. `active={false}` pauses and hides it (e.g. on a carousel slide
 * that isn't the current one).
 */
export function BorderBeam({
  duration = 7,
  width = 1.5,
  hoverSpeed = 1.6,
  active = true,
}: {
  duration?: number;
  width?: number;
  hoverSpeed?: number;
  active?: boolean;
}) {
  const ambient = useAmbientMotion();
  // Touch screens get the crisp ring only: each halo is another masked layer around a large
  // rotating gradient, which phone GPUs drop frames compositing. False for the server render
  // and hydration, so those always get the light version.
  const fine = useFinePointer();
  const root = useRef<HTMLDivElement>(null);
  // [halo wide, halo narrow, counter-arc, comet]; the halos are absent on touch screens.
  const spinners = useRef<(HTMLDivElement | null)[]>([]);
  const inView = useInView(root, { margin: '50px' });
  // A stable start angle per instance (useId matches on the server and the client).
  const start = hash(useId()) % 360;
  // Hover brightens the halo through an opacity layer (never by repainting the gradient).
  const glow = useSpring(0, { stiffness: 220, damping: 30 });
  const haloOpacity = useTransform(glow, [0, 1], [0.55, 1]);
  const laps = useRef<AnimationPlaybackControls[]>([]);
  // False for the server render and hydration; set after mount when ambient motion is off.
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(!ambient), [ambient]);

  // Size each gradient square to its box's diagonal so it always covers the ring without
  // allocating a huge layer. Measured only on resize, never per frame.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const side = `${Math.ceil(Math.hypot(w + HALO * 2, h + HALO * 2)) + 8}px`;
      // Sparse when the halo squares aren't rendered (touch screens): skip the gaps.
      for (const sq of spinners.current) {
        if (!sq) continue;
        sq.style.width = side;
        sq.style.height = side;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
    // Re-run when the halo squares mount (fine pointer is only known after hydration).
  }, [ambient, fine]);

  // One endless linear lap per arc, all started together so they stay in step, created once and
  // paused/resumed with visibility. The counter-arc turns the other way from the opposite side.
  useEffect(() => {
    if (!ambient) return;
    const created: AnimationPlaybackControls[] = [];
    spinners.current.forEach((el, i) => {
      if (!el) return;
      const from = i === 2 ? 180 - start : start;
      const to = i === 2 ? from - 360 : from + 360;
      created.push(
        animate(
          el,
          { transform: [`rotate(${from}deg)`, `rotate(${to}deg)`] },
          { duration, ease: 'linear', repeat: Infinity },
        ),
      );
    });
    laps.current = created;
    return () => {
      created.forEach((c) => c.stop());
      laps.current = [];
    };
  }, [ambient, fine, duration, start]);

  useEffect(() => {
    for (const c of laps.current) {
      if (inView && active) c.play();
      else c.pause();
    }
  }, [inView, active, ambient, fine, duration]);

  // Ease the lap speed up and the halo brighter while the card is hovered (mouse only). Only the
  // playback rate changes, so the GPU animation keeps running.
  useEffect(() => {
    const parent = root.current?.parentElement;
    if (!parent || !ambient) return;
    let speed = 1;
    let tween: AnimationPlaybackControls | null = null;
    const to = (target: number) => {
      tween?.stop();
      tween = animate(speed, target, {
        duration: 0.5,
        onUpdate: (v) => {
          speed = v;
          for (const c of laps.current) c.speed = v;
        },
      });
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      to(hoverSpeed);
      glow.set(1);
    };
    const leave = () => {
      to(1);
      glow.set(0);
    };
    parent.addEventListener('pointerenter', enter);
    parent.addEventListener('pointerleave', leave);
    return () => {
      tween?.stop();
      parent.removeEventListener('pointerenter', enter);
      parent.removeEventListener('pointerleave', leave);
    };
  }, [hoverSpeed, ambient, glow]);

  const spinner = (i: number) => (el: HTMLDivElement | null) => {
    spinners.current[i] = el;
  };
  const square = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';
  // Resting angle in the markup (same on the server and the client); the laps start from it.
  const at = (deg: number) => ({ transform: `rotate(${deg}deg)` });

  // Always rendered, with the same markup on the server and the client: whether ambient motion
  // is allowed is only known on the client, so branching on it here would break hydration. The
  // beam is hidden by the `hidden` state instead, which only switches after mount.
  return (
    <div
      ref={root}
      aria-hidden
      // On touch screens an inactive beam is removed from rendering, not just faded to 0, so its
      // masked layers cost nothing (desktop keeps the fade between cards).
      hidden={hidden || (!fine && !active)}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ${THEME_VARS}`}
      style={{ opacity: active ? 1 : 0 }}
    >
      {/* Halo: two overlapping soft rings straddling the border (wide and faint, narrow and
          brighter), so the glow falls off away from the edge. A clipping parent just hides the
          outer half. Mouse/trackpad only. */}
      {fine && (
        <m.div
          className="absolute rounded-[inherit]"
          style={{ inset: -HALO, opacity: haloOpacity }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-[inherit]"
            style={{ ...RING_MASK, padding: HALO * 2, opacity: 'calc(var(--beam-halo) * 0.55)' }}
          >
            <div
              ref={spinner(0)}
              className={square}
              style={{ ...at(start), background: HALO_GRADIENT }}
            />
          </div>
          <div
            className="absolute overflow-hidden"
            style={{
              ...RING_MASK,
              inset: HALO / 2,
              padding: HALO,
              borderRadius: 'inherit',
              opacity: 'var(--beam-halo)',
            }}
          >
            <div
              ref={spinner(1)}
              className={square}
              style={{ ...at(start), background: HALO_GRADIENT }}
            />
          </div>
        </m.div>
      )}

      {/* The crisp ring: comet plus counter-arc. */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{ ...RING_MASK, padding: width }}
      >
        <div
          ref={spinner(2)}
          className={square}
          style={{ ...at(180 - start), background: COUNTER }}
        />
        <div
          ref={spinner(3)}
          className={square}
          style={{ ...at(start), background: COMET }}
        />
      </div>
    </div>
  );
}
