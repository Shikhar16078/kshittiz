'use client';

import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { DURATION, EASE_OUT } from '@/lib/motion';
import { useScrollReveal } from '@/components/reveal';

/**
 * Counts the first number in a value like "GPA: 3.7/4.0" up from 0 as it scrolls into view, and
 * back down as it leaves through the bottom. Decimals keep their places. The server renders the
 * final value, and digits are written to the DOM directly so nothing re-renders per frame.
 */
export function CountUp({ value }: { value: string }) {
  const match = value.match(/\d+(?:\.\d+)?/);
  const [ref, shown] = useScrollReveal<HTMLSpanElement>();
  const digits = useRef<HTMLSpanElement>(null);
  const current = useRef<number | null>(null);
  const reduce = useReducedMotion();

  const raw = match?.[0];
  const target = raw ? Number(raw) : 0;
  const decimals = raw?.split('.')[1]?.length ?? 0;

  useEffect(() => {
    const el = digits.current;
    if (!el || !raw) return;
    const to = shown ? target : 0;
    if (reduce) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const controls = animate(current.current ?? 0, to, {
      duration: shown ? DURATION.slow * 2 : DURATION.exit,
      ease: EASE_OUT,
      onUpdate: (v) => {
        current.current = v;
        el.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [shown, target, decimals, reduce, raw]);

  if (!match || match.index === undefined) return <span>{value}</span>;
  const before = value.slice(0, match.index);
  const after = value.slice(match.index + match[0].length);

  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {before}
        <span ref={digits} className="tabular-nums">
          {match[0]}
        </span>
        {after}
      </span>
    </span>
  );
}
