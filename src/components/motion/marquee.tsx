'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  animate,
  useInView,
  useSpring,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react';
import { useAmbientMotion } from '@/lib/motion-tier';
import { cn } from '@/lib/utils';

/**
 * An endless horizontal ticker. The content is rendered twice and the track slides by one copy's
 * width in a linear `transform` loop that Motion hands to the browser (WAAPI), so it runs on the
 * GPU at the display's full refresh rate and doesn't stutter when the main thread is busy. It
 * eases to a stop under the mouse or a finger (only the playback rate changes), pauses while off
 * screen, and stays still with reduced motion or on the `lite` motion tier.
 * `speed` is in px per second; `reverse` scrolls left to right. `boost` (optional) is added to
 * the 1× rate, e.g. from scroll velocity: 2 runs three times as fast, -1 stops it.
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
  const ambient = useAmbientMotion();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { margin: '100px' });
  const [width, setWidth] = useState(0);
  // 1 = full speed, 0 = stopped; eased so hovering slows the ticker instead of freezing it.
  const rate = useSpring(1, { stiffness: 80, damping: 20 });
  const loop = useRef<AnimationPlaybackControls | null>(null);
  // Where the loop was (0-1) when it was last torn down, so a rebuilt loop carries on from there.
  const progress = useRef(0);

  useEffect(() => {
    const el = copy.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The loop itself: recreated only when the distance or speed changes, keeping its progress.
  useEffect(() => {
    const el = track.current;
    if (!el || !ambient || width <= 0) return;
    const ends = ['translateX(0px)', `translateX(${-width}px)`];
    const duration = width / speed;
    const c = animate(
      el,
      { transform: reverse ? [...ends].reverse() : ends },
      { duration, ease: 'linear', repeat: Infinity },
    );
    c.time = progress.current * duration;
    loop.current = c;
    return () => {
      progress.current = c.duration > 0 ? (c.time % c.duration) / c.duration : 0;
      c.stop();
      if (loop.current === c) loop.current = null;
      el.style.transform = '';
    };
  }, [ambient, width, speed, reverse]);

  useEffect(() => {
    const c = loop.current;
    if (!c) return;
    if (inView) c.play();
    else c.pause();
  }, [inView, ambient, width, speed, reverse]);

  // Hover and the external boost only change the playback rate (never below a stop).
  useEffect(() => {
    const apply = () => {
      const c = loop.current;
      if (c) c.speed = Math.max(0, rate.get() * (1 + (boost?.get() ?? 0)));
    };
    apply();
    const offRate = rate.on('change', apply);
    const offBoost = boost?.on('change', apply);
    return () => {
      offRate();
      offBoost?.();
    };
  }, [rate, boost, ambient, width, speed, reverse]);

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
      <div ref={track} className="flex w-max">
        <div ref={copy} className="flex shrink-0">
          {children}
        </div>
        {/* The duplicate is decorative: hidden from screen readers and keyboard focus. */}
        <div className="flex shrink-0" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
