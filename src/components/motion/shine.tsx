'use client';

import { useRef } from 'react';
import { m, useInView } from 'motion/react';
import { useAmbientMotion } from '@/lib/motion-tier';

/**
 * A light sweep that crosses its parent every few seconds (for primary buttons, chips, cover
 * art). Place inside a `relative overflow-hidden` element with rounded corners. The band is a
 * skewed gradient that only translates, as a `transform` animation the browser runs on the GPU.
 * Runs only while on screen; never mounted with reduced motion or on the `lite` motion tier.
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
  const ambient = useAmbientMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  // The wrapper is always rendered: ambient motion is only known on the client, so returning
  // null for it would make the first client render differ from the server HTML (hydration
  // error). The sweep itself only mounts once in view, which never happens during hydration.
  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {inView && ambient && (
        <m.span
          className="absolute inset-y-0 left-0 w-1/2"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(0 0% 100% / ${opacity}), transparent)`,
          }}
          // The skew is part of the transform, so the whole sweep is one GPU animation.
          initial={{ transform: 'translateX(-120%) skewX(-12deg)' }}
          animate={{ transform: 'translateX(320%) skewX(-12deg)' }}
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
