'use client';

import { useEffect, useRef } from 'react';
import {
  animate,
  m,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { cn } from '@/lib/utils';

// Each blob drifts through its own loop. Durations are long and different from each other so the
// blobs never line up into a visible repeating pattern.
const BLOBS = [
  {
    className:
      '-left-[20%] -top-[15%] size-[min(110vw,820px)] bg-[radial-gradient(circle,hsl(var(--glow)/0.22),transparent_62%)]',
    keyframes: { x: [0, 60, -30, 0], y: [0, 40, 70, 0], scale: [1, 1.08, 0.96, 1] },
    duration: 26,
  },
  {
    className:
      '-right-[25%] top-[10%] size-[min(100vw,720px)] bg-[radial-gradient(circle,hsl(var(--glow-2)/0.14),transparent_62%)]',
    keyframes: { x: [0, -70, 20, 0], y: [0, 50, -30, 0], scale: [1, 0.94, 1.06, 1] },
    duration: 32,
  },
  {
    className:
      'bottom-[-30%] left-[20%] size-[min(90vw,640px)] bg-[radial-gradient(circle,hsl(var(--glow)/0.14),transparent_62%)]',
    keyframes: { x: [0, 40, -50, 0], y: [0, -40, 10, 0], scale: [1, 1.1, 1, 1] },
    duration: 38,
  },
] as const;

type Controls = NonNullable<ReturnType<typeof animate>>;

const LIGHT = 320;

// Dot grid: period of the pattern (px), the cursor spotlight's diameter, and one drift lap (s).
const DOT = 24;
const SPOT = 220;
const DRIFT = 48;
const DOTS = `radial-gradient(circle, hsl(var(--foreground) / 0.16) 1px, transparent 1.6px)`;
const LIT_DOTS = `radial-gradient(circle, hsl(var(--primary)) 1.25px, transparent 1.9px)`;
const LIGHT_SPRING = { stiffness: 120, damping: 24, mass: 0.6 };

/**
 * Hero atmosphere: large soft radial-gradient blobs in theme colours drifting slowly over a faint,
 * slowly drifting dot grid, plus (mouse and trackpad only) a soft light that trails the cursor and
 * lights up the dots around it. Gradients instead of blur filters and
 * transform-only motion keep it cheap. The loops pause while the hero is off screen and are
 * never started with reduced motion. Place as the first child of a `relative` section.
 */
export function Aurora() {
  const root = useRef<HTMLDivElement>(null);
  const blobs = useRef<(HTMLDivElement | null)[]>([]);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const inView = useInView(root, { margin: '200px' });
  const controls = useRef<Controls[]>([]);
  const drift = useRef<HTMLDivElement>(null);

  // Started once (imperatively, so they can be paused and resumed without jumping).
  useEffect(() => {
    if (reduce) return;
    const started: Controls[] = [];
    BLOBS.forEach((blob, i) => {
      const el = blobs.current[i];
      if (!el) return;
      started.push(
        animate(el, blob.keyframes, {
          duration: blob.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }),
      );
    });
    // The grid drifts exactly one period diagonally per lap, so the linear loop is seamless.
    if (drift.current) {
      started.push(
        animate(
          drift.current,
          { x: [0, DOT], y: [0, DOT] },
          { duration: DRIFT, repeat: Infinity, ease: 'linear' },
        ),
      );
    }
    controls.current = started;
    return () => {
      controls.current.forEach((c) => c.stop());
      controls.current = [];
    };
  }, [reduce]);

  useEffect(() => {
    controls.current.forEach((c) => (inView ? c.play() : c.pause()));
  }, [inView, reduce]);

  // Cursor light. The section's page offset is cached on enter and resize, so pointermove does
  // no layout reads: page coordinates minus the cached offset give the position inside it.
  const x = useSpring(0, LIGHT_SPRING);
  const y = useSpring(0, LIGHT_SPRING);
  const opacity = useSpring(0, { stiffness: 120, damping: 30 });
  const lit = fine && !reduce;
  // The spotlight window follows the same springs (re-centred for its size and the drift layer's
  // -DOT inset); the lit dots inside it counter-move, so they stay pinned to the page grid.
  const spotX = useTransform(x, (v) => v + LIGHT / 2 - SPOT / 2 + DOT);
  const spotY = useTransform(y, (v) => v + LIGHT / 2 - SPOT / 2 + DOT);
  const pinX = useTransform(spotX, (v) => -v);
  const pinY = useTransform(spotY, (v) => -v);

  useEffect(() => {
    const section = root.current?.parentElement;
    if (!section || !lit) return;
    const origin = { left: 0, top: 0 };
    const measure = () => {
      const r = section.getBoundingClientRect();
      origin.left = r.left + window.scrollX;
      origin.top = r.top + window.scrollY;
    };
    const enter = (e: PointerEvent) => {
      measure();
      // Jump to the entry point so the light doesn't streak in from the last exit.
      x.jump(e.pageX - origin.left - LIGHT / 2);
      y.jump(e.pageY - origin.top - LIGHT / 2);
      opacity.set(1);
    };
    const move = (e: PointerEvent) => {
      x.set(e.pageX - origin.left - LIGHT / 2);
      y.set(e.pageY - origin.top - LIGHT / 2);
    };
    const leave = () => opacity.set(0);
    measure();
    section.addEventListener('pointerenter', enter);
    section.addEventListener('pointermove', move, { passive: true });
    section.addEventListener('pointerleave', leave);
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      section.removeEventListener('pointerenter', enter);
      section.removeEventListener('pointermove', move);
      section.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', measure);
    };
  }, [lit, x, y, opacity]);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={(el) => {
            blobs.current[i] = el;
          }}
          className={cn('absolute rounded-full will-change-transform', blob.className)}
        />
      ))}
      {/* Dot grid. The faint layer is static apart from the slow drift of its wrapper. Under the
          cursor, a round window (a static mask on a transformed element) shows a second, lit
          copy of the grid, so the spotlight only moves layers and nothing repaints per frame. */}
      <div ref={drift} style={{ inset: -DOT }} className="absolute will-change-transform">
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_42%,black_20%,transparent_75%)]"
          style={{ backgroundImage: DOTS, backgroundSize: `${DOT}px ${DOT}px` }}
        />
        {lit && (
          <m.div
            className="absolute left-0 top-0 overflow-hidden will-change-transform [mask-image:radial-gradient(closest-side,black,transparent)]"
            style={{ x: spotX, y: spotY, opacity, width: SPOT, height: SPOT }}
          >
            <m.div
              className="absolute left-0 top-0 h-[calc(150svh+48px)] w-[calc(100vw+48px)] opacity-70 will-change-transform"
              style={{
                x: pinX,
                y: pinY,
                backgroundImage: LIT_DOTS,
                backgroundSize: `${DOT}px ${DOT}px`,
              }}
            />
          </m.div>
        )}
      </div>
      {lit && (
        <m.div
          className="absolute left-0 top-0 rounded-full bg-[radial-gradient(circle,hsl(var(--glow)/0.16),transparent_65%)]"
          style={{ x, y, opacity, width: LIGHT, height: LIGHT }}
        />
      )}
      {/* Fades the atmosphere into the page so the next section starts on plain background. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
