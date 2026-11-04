'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'motion/react';
import { useFrameLoop } from '@/hooks/use-frame-loop';
import { cn } from '@/lib/utils';

/**
 * An endless horizontal ticker. The content is rendered twice and the track is moved with a
 * transform each frame (never re-rendering), wrapping seamlessly. It eases to a stop under the
 * mouse or a finger, pauses while off screen, and stays still with reduced motion.
 * `speed` is in px per second; `reverse` scrolls left to right. `boost` (optional) is added to
 * the 1× rate, e.g. from scroll velocity: 2 runs three times as fast, -2 briefly runs backwards.
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  className,
  boost,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
  boost?: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { margin: '100px' });
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  // 1 = full speed, 0 = stopped; eased so hovering slows the ticker instead of freezing it.
  const rate = useSpring(1, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const el = copy.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Registered on the frame loop only while on screen and allowed to move.
  useFrameLoop((delta) => {
    const dir = reverse ? 1 : -1;
    // Hovering (rate → 0) still eases everything, boost included, to a stop.
    const factor = rate.get() * (1 + (boost?.get() ?? 0));
    let next = x.get() + dir * speed * factor * (delta / 1000);
    if (next <= -width) next += width;
    if (next > 0) next -= width;
    x.set(next);
  }, !reduce && inView && width > 0);

  return (
    <div
      ref={root}
      className={cn(
        'relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className
      )}
      onPointerEnter={() => rate.set(0)}
      onPointerLeave={() => rate.set(1)}
    >
      <m.div className="flex w-max" style={{ x }}>
        <div ref={copy} className="flex shrink-0">
          {children}
        </div>
        {/* The duplicate is decorative: hidden from screen readers and keyboard focus. */}
        <div className="flex shrink-0" aria-hidden inert>
          {children}
        </div>
      </m.div>
    </div>
  );
}
