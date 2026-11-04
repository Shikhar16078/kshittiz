'use client';

import { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * A small pulsing "live" dot (current role, availability). The ping is one compositor-only loop
 * that runs only while the dot is on screen; it stays still with reduced motion or `still`
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
  const reduce = useReducedMotion();

  return (
    <span ref={ref} aria-hidden className={cn('relative inline-flex shrink-0', className)}>
      {inView && !reduce && !still && (
        <m.span
          className="absolute inset-0 rounded-full bg-primary"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut', repeat: Infinity }}
        />
      )}
      <span className="relative h-full w-full rounded-full bg-primary" />
    </span>
  );
}
