'use client';

import { m, useReducedMotion } from 'motion/react';
import { useScrollReveal } from '@/components/reveal';
import { CountUp } from '@/components/count-up';
import { DURATION, EASE_OUT, exitTransition } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** "GPA: 3.7/4.0" → { value: "3.7", scale: "4.0", ratio: 0.925 }. */
export function parseGpa(gpa: string) {
  const match = gpa.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const ratio = Number(match[1]) / Number(match[2]);
  if (!Number.isFinite(ratio)) return null;
  return { value: match[1], scale: match[2], ratio: Math.min(1, Math.max(0, ratio)) };
}

const SIZE = 88;
const STROKE = 7;
const R = (SIZE - STROKE) / 2;

/**
 * A ring gauge that fills to the GPA as it scrolls into view (SVG `pathLength`, the one
 * non-transform property CLAUDE.md allows for small rings) while the value counts up in the
 * centre. It empties again when scrolled back below the trigger line. With reduced motion the
 * ring is simply full.
 */
export function GpaRing({ gpa, className }: { gpa: string; className?: string }) {
  const parsed = parseGpa(gpa);
  const [ref, shown] = useScrollReveal<HTMLDivElement>();
  const reduce = useReducedMotion();
  if (!parsed) return null;
  const fill = shown || reduce ? parsed.ratio : 0;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`GPA ${parsed.value} out of ${parsed.scale}`}
      className={cn('relative shrink-0', className)}
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-primary-ink/15"
        />
        <m.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-primary-ink"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: fill }}
          transition={
            reduce
              ? { duration: 0 }
              : shown
                ? { duration: DURATION.slow * 2, ease: EASE_OUT, delay: 0.15 }
                : exitTransition
          }
        />
      </svg>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center leading-none"
      >
        <span className="font-headline text-xl font-bold text-foreground">
          <CountUp value={parsed.value} />
        </span>
        <span className="pt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          of {parsed.scale}
        </span>
      </div>
    </div>
  );
}
