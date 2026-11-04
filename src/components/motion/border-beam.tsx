'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';
import { hash } from '@/lib/utils';

/** How far the soft halo ring reaches either side of the border, in px. */
const HALO = 6;

// A static ring mask: border-box minus content-box. Only the gradient inside it rotates, so
// each frame is a compositor transform; nothing repaints.
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
 * is a static mask over a conic gradient that only rotates, all driven by one motion value, so a
 * frame costs a few compositor transforms. Every instance starts at a different angle so cards
 * on screen together don't move in step. The beam only runs while on screen, speeds up and
 * brightens while the parent is hovered, and is hidden with reduced motion.
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
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const spinners = useRef<HTMLDivElement[]>([]);
  const inView = useInView(root, { margin: '50px' });
  // A stable start angle per instance (useId matches on the server and the client).
  const start = hash(useId()) % 360;
  const angle = useMotionValue(start);
  // The counter-arc runs the other way, starting opposite the comet.
  const counter = useTransform(angle, (v) => 180 - v);
  // Hover brightens the halo through an opacity layer (never by repainting the gradient).
  const glow = useSpring(0, { stiffness: 220, damping: 30 });
  const haloOpacity = useTransform(glow, [0, 1], [0.55, 1]);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  // False for the server render and hydration; set after mount when motion is reduced.
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(!!reduce), [reduce]);

  // Size each gradient square to its box's diagonal so it always covers the ring without
  // allocating a huge layer. Measured only on resize, never per frame.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const side = `${Math.ceil(Math.hypot(w + HALO * 2, h + HALO * 2)) + 8}px`;
      for (const sq of spinners.current) {
        sq.style.width = side;
        sq.style.height = side;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduce]);

  // One endless linear lap, created once and paused/resumed with visibility.
  useEffect(() => {
    if (reduce) return;
    const from = angle.get();
    controls.current = animate(angle, [from, from + 360], {
      duration,
      ease: 'linear',
      repeat: Infinity,
    });
    return () => controls.current?.stop();
  }, [duration, reduce, angle]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (inView && active) c.play();
    else c.pause();
  }, [inView, active, reduce, duration]);

  // Ease the lap speed up and the halo brighter while the card is hovered (mouse only).
  useEffect(() => {
    const parent = root.current?.parentElement;
    if (!parent || reduce) return;
    let tween: AnimationPlaybackControls | null = null;
    const to = (speed: number) => {
      const c = controls.current;
      if (!c) return;
      tween?.stop();
      tween = animate(c.speed, speed, {
        duration: 0.5,
        onUpdate: (v) => {
          c.speed = v;
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
  }, [hoverSpeed, reduce, glow]);

  const spinner = (i: number) => (el: HTMLDivElement | null) => {
    if (el) spinners.current[i] = el;
  };
  const square = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';

  // Always rendered, with the same markup on the server and the client: reduced motion is only
  // known on the client, so branching on it here would break hydration. The beam is hidden by
  // the `hidden` state instead, which only switches after mount.
  return (
    <div
      ref={root}
      aria-hidden
      hidden={hidden}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ${THEME_VARS}`}
      style={{ opacity: active ? 1 : 0 }}
    >
      {/* Halo: two overlapping soft rings straddling the border (wide and faint, narrow and
          brighter), so the glow falls off away from the edge. A clipping parent just hides the
          outer half. */}
      <m.div
        className="absolute rounded-[inherit]"
        style={{ inset: -HALO, opacity: haloOpacity }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ ...RING_MASK, padding: HALO * 2, opacity: 'calc(var(--beam-halo) * 0.55)' }}
        >
          <m.div
            ref={spinner(0)}
            className={square}
            style={{ rotate: angle, background: HALO_GRADIENT }}
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
          <m.div
            ref={spinner(1)}
            className={square}
            style={{ rotate: angle, background: HALO_GRADIENT }}
          />
        </div>
      </m.div>

      {/* The crisp ring: comet plus counter-arc. */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{ ...RING_MASK, padding: width }}
      >
        <m.div
          ref={spinner(2)}
          className={square}
          style={{ rotate: counter, background: COUNTER }}
        />
        <m.div
          ref={spinner(3)}
          className={square}
          style={{ rotate: angle, background: COMET }}
        />
      </div>
    </div>
  );
}
