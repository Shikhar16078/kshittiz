'use client';

import { useRef } from 'react';
import { m, useInView } from 'motion/react';
import { useAmbientMotion } from '@/lib/motion-tier';
import { cn } from '@/lib/utils';

/**
 * A small pulsing "live" dot (current role, availability). The ping is one GPU loop (a `transform`
 * and opacity animation run by the browser) that runs only while the dot is on screen; it stays
 * still with reduced motion, on the `lite` motion tier, or with `still`
 * (e.g. inside an invisible measuring copy, which IntersectionObserver still counts as visible).
 */
export function LiveDot({
  className = 'size-2',
  still = false,
}: {
  className?: string;
  still?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const ambient = useAmbientMotion();

  return (
    <span ref={ref} aria-hidden className={cn('relative inline-flex shrink-0', className)}>
      {inView && ambient && !still && (
        <m.span
          className="absolute inset-0 rounded-full bg-success"
          initial={{ transform: 'scale(1)', opacity: 0.7 }}
          animate={{ transform: 'scale(2.6)', opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut', repeat: Infinity }}
        />
      )}
      <span className="relative h-full w-full rounded-full bg-success" />
    </span>
  );
}
