'use client';

import { m, type Variants } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/components/reveal';
import {
  cappedInterval,
  DURATION,
  EASE_OUT,
  exitTransition,
  springSnappy,
  staggerChildren,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

const badge: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.9, transition: exitTransition },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/**
 * A row of badges that cascade in once the row is on screen and rewind when it leaves. "On
 * screen" respects clipping, so badges in a carousel slide cascade each time the slide comes
 * into view. Each badge lifts under the mouse.
 */
export function BadgeRow({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const [ref, shown] = useScrollReveal<HTMLDivElement>();
  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={staggerChildren(cappedInterval(items.length))}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {items.map((item) => (
        <m.span
          key={item}
          data-reveal=""
          variants={badge}
          whileHover={{ y: -2, scale: 1.06, transition: springSnappy }}
          className="inline-flex"
        >
          <Badge variant="secondary">{item}</Badge>
        </m.span>
      ))}
    </m.div>
  );
}
