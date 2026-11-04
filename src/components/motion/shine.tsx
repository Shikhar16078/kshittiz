'use client';

import { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'motion/react';

/**
 * A light sweep that crosses its parent every few seconds (for primary buttons, chips, cover
 * art). Place inside a `relative overflow-hidden` element with rounded corners. The band is a
 * skewed gradient that only translates, so it stays on the compositor. Runs only while on
 * screen; the sweep is never mounted with reduced motion.
 *
 * `every` is the pause between sweeps in seconds; `delay` offsets the first one.
 */
export function Shine({
  every = 4,
  delay = 1.2,
  opacity = 0.35,
}: {
  every?: number;
  delay?: number;
  opacity?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  // The wrapper is always rendered: reduced motion is only known on the client, so returning
  // null for it would make the first client render differ from the server HTML (hydration
  // error). The sweep itself only mounts once in view, which never happens during hydration.
  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {inView && !reduce && (
        <m.span
          className="absolute inset-y-0 left-0 w-1/2 -skew-x-12"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(0 0% 100% / ${opacity}), transparent)`,
          }}
          initial={{ x: '-120%' }}
          animate={{ x: '320%' }}
          transition={{
            duration: 1.1,
            ease: [0.4, 0, 0.2, 1],
            delay,
            repeat: Infinity,
            repeatDelay: every,
          }}
        />
      )}
    </span>
  );
}
