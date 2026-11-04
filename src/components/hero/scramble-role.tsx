'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { DURATION, EASE_IN, EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** How long each role stays resolved, and one scramble step (ms). */
const HOLD = 3000;
const STEP = 34;
/** Steps of pure noise before the first letter locks in; then one letter locks per step. */
const LEAD = 5;
// Lowercase and digits only: close to the roles' own letter widths, so the noise doesn't jump.
const GLYPHS = 'abcdefghkmnopqrsuvwxyz0123456789';

function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

/**
 * Cycles through `roles` with a decode effect: the next role's letters cycle through random
 * glyphs and lock in from left to right. Text is written straight into two spans (locked and
 * still-scrambling), so React never re-renders per step. Every role is also rendered invisibly in
 * the same cell, so the line keeps the width of the longest one and nothing shifts. It pauses off
 * screen and while the tab is hidden; with reduced motion roles crossfade instead. Screen readers
 * get the whole list as one static sentence.
 */
export function ScrambleRole({
  roles,
  prefix = 'Focused on',
  className,
}: {
  roles: readonly string[];
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const locked = useRef<HTMLSpanElement>(null);
  const noise = useRef<HTMLSpanElement>(null);
  const index = useRef(0);
  const inView = useInView(ref);
  const visible = usePageVisible();
  const reduce = useReducedMotion();
  const running = inView && visible && roles.length > 1;

  useEffect(() => {
    const box = text.current;
    const done = locked.current;
    const rest = noise.current;
    if (!running || !box || !done || !rest) return;
    let timer = 0;
    let fade: ReturnType<typeof animate> | undefined;

    const show = (value: string, scrambled = '') => {
      done.textContent = value;
      rest.textContent = scrambled;
    };
    const hold = () => {
      timer = window.setTimeout(next, HOLD);
    };
    const next = () => {
      index.current = (index.current + 1) % roles.length;
      const target = roles[index.current];
      if (reduce) {
        fade = animate(box, { opacity: 0 }, { duration: DURATION.fast, ease: EASE_IN });
        fade.then(() => {
          show(target);
          fade = animate(box, { opacity: 1 }, { duration: DURATION.base, ease: EASE_OUT });
          hold();
        });
        return;
      }
      let step = 0;
      const tick = () => {
        const count = Math.max(0, step - LEAD);
        let scrambled = '';
        for (let i = count; i < target.length; i++) {
          scrambled +=
            target[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        show(target.slice(0, count), scrambled);
        step++;
        if (count >= target.length) hold();
        else timer = window.setTimeout(tick, STEP);
      };
      tick();
    };

    hold();
    return () => {
      window.clearTimeout(timer);
      fade?.stop();
      // Never leave half-decoded noise on screen while paused.
      box.style.opacity = '';
      show(roles[index.current]);
    };
  }, [running, reduce, roles]);

  if (roles.length === 0) return null;

  return (
    <p ref={ref} className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      <span className="sr-only">
        {prefix} {roles.join(', ')}.
      </span>
      <span aria-hidden className="text-muted-foreground">
        {prefix}
      </span>
      <span aria-hidden className="relative grid">
        {roles.map((role) => (
          <span key={role} className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {role}
          </span>
        ))}
        {/* Absolutely placed, so wider noise glyphs can never widen the cell. */}
        <span
          ref={text}
          data-scramble=""
          className="absolute left-0 top-0 whitespace-nowrap font-semibold text-primary"
        >
          <span ref={locked}>{roles[0]}</span>
          <span ref={noise} className="opacity-55" />
        </span>
      </span>
    </p>
  );
}
