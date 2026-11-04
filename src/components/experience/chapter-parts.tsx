'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  animate,
  m,
  stagger,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import { Building, CalendarDays, Check } from 'lucide-react';
import type { Stat, WorkExperience } from '@/lib/types';
import { cn } from '@/lib/utils';
import { logoImageClass } from '@/lib/logo';
import { LiveDot } from '@/components/live-dot';
import { DURATION, EASE_IN, EASE_OUT, RISE } from '@/lib/motion';

/**
 * A chapter is always in one of three states: `below` (not reached yet), `show` (the one being
 * read) or `above` (scrolled past). Leaving upward and arriving from below share one direction,
 * so scrolling down everything rises; scrolling back up, it all comes back down from the top.
 */
export type ChapterState = 'below' | 'show' | 'above';

export const chapter: Variants = {
  below: { opacity: 0, y: 48, transition: { duration: DURATION.exit, ease: EASE_IN } },
  above: { opacity: 0, y: -48, transition: { duration: DURATION.exit, ease: EASE_IN } },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: EASE_OUT,
      // Children cascade in after the outgoing chapter has mostly cleared.
      delayChildren: stagger(0.05, { startDelay: 0.12 }),
    },
  },
};

/** One piece inside a chapter (meta row, metric, win, chip row). */
export const piece: Variants = {
  below: { opacity: 0, y: RISE, transition: { duration: DURATION.fast, ease: EASE_IN } },
  above: { opacity: 0, y: -RISE / 2, transition: { duration: DURATION.fast, ease: EASE_IN } },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

const words: Variants = {
  below: {},
  above: {},
  show: { transition: { delayChildren: stagger(0.045) } },
};

// Each headline word rises from behind its own mask (or drops in from above when scrolling up).
const word: Variants = {
  below: { y: '110%', transition: { duration: DURATION.fast, ease: EASE_IN } },
  above: { y: '-110%', transition: { duration: DURATION.fast, ease: EASE_IN } },
  show: { y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const iconPop: Variants = {
  below: { scale: 0.4, rotate: -30, opacity: 0 },
  above: { scale: 0.4, rotate: 30, opacity: 0 },
  show: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 420, damping: 18, delay: 0.08 },
  },
};

/** `data-reveal` for content that starts hidden, so no-JS and the failsafe still show it. */
export const revealAttr = (on: boolean) => (on ? { 'data-reveal': '' } : {});

export const isCurrent = (job: WorkExperience) => job.endDate === 'Present';

/** "Jan 2022" → "2022", "Present" → "Now". */
export const year = (d: string) => (d === 'Present' ? 'Now' : d.split(' ').pop());
export const yearRange = (job: WorkExperience) => {
  const a = year(job.startDate);
  const b = year(job.endDate);
  return a === b ? b : `${a} – ${b}`;
};

export function CompanyLogo({
  job,
  className,
  size = 48,
}: {
  job: WorkExperience;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-card ring-1 ring-border',
        className,
      )}
    >
      {job.logo ? (
        <Image
          src={job.logo}
          alt=""
          width={size}
          height={size}
          className={logoImageClass(job)}
        />
      ) : (
        <Building aria-hidden className="h-1/2 w-1/2 text-primary" />
      )}
    </span>
  );
}

/** Role, company and dates, with the live dot on the current role. */
export function RoleMeta({
  job,
  headingId,
  reveal,
}: {
  job: WorkExperience;
  headingId: string;
  reveal?: boolean;
}) {
  return (
    <m.div variants={piece} {...revealAttr(!!reveal)} className="min-w-0 space-y-1">
      <h3
        id={headingId}
        className="font-headline text-lg font-semibold leading-snug tracking-tight md:text-xl"
      >
        {job.role}
        <span className="sr-only"> at {job.company}</span>
      </h3>
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
        <span aria-hidden className="font-medium text-primary">
          {job.company}
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden className="h-3.5 w-3.5" />
          {job.startDate} – {isCurrent(job) ? 'Present' : job.endDate}
          {isCurrent(job) && <LiveDot className="ml-1 size-2" />}
        </span>
      </p>
    </m.div>
  );
}

/** The big impact headline, revealed word by word. */
export function Headline({
  text,
  className,
  reveal,
}: {
  text: string;
  className?: string;
  reveal?: boolean;
}) {
  const list = text.split(' ');
  return (
    <m.p
      variants={words}
      className={cn(
        'font-headline font-bold leading-[1.08] tracking-tight text-balance',
        className,
      )}
    >
      {list.map((w, i) => (
        <span key={i}>
          <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <m.span variants={word} {...revealAttr(!!reveal)} className="inline-block">
              {w}
            </m.span>
          </span>
          {i < list.length - 1 && ' '}
        </span>
      ))}
    </m.p>
  );
}

/** Three short wins, each with an icon that pops in as it cascades. */
export function Wins({
  items,
  reveal,
  className,
}: {
  items: string[];
  reveal?: boolean;
  className?: string;
}) {
  return (
    <ul aria-label="Key wins" className={cn('space-y-2.5', className)}>
      {items.map((win) => (
        <m.li
          key={win}
          variants={piece}
          {...revealAttr(!!reveal)}
          className="flex items-start gap-3 text-[15px] leading-6 text-muted-foreground"
        >
          <m.span
            aria-hidden
            variants={iconPop}
            {...revealAttr(!!reveal)}
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30"
          >
            <Check className="size-3" strokeWidth={3} />
          </m.span>
          <span className="max-w-prose">{win}</span>
        </m.li>
      ))}
    </ul>
  );
}

export function StackChips({
  items,
  reveal,
  className,
}: {
  items: string[];
  reveal?: boolean;
  className?: string;
}) {
  return (
    <m.ul
      variants={piece}
      {...revealAttr(!!reveal)}
      aria-label="Stack"
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {items.map((s) => (
        <li
          key={s}
          className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {s}
        </li>
      ))}
    </m.ul>
  );
}

// ---------------------------------------------------------------------------------------------
// Metrics

type Kind =
  | { type: 'ring'; fraction: number }
  | { type: 'ticks'; count: number }
  | { type: 'bar' };

/** Picks a micro-visual that fits the number: a ring for a percentage, ticks for "8×", else a bar. */
function kindOf(value: string): Kind {
  const pct = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) return { type: 'ring', fraction: Math.min(1, Number(pct[1]) / 100) };
  const times = value.match(/(\d+)\s*×/);
  if (times) return { type: 'ticks', count: Math.min(12, Number(times[1])) };
  return { type: 'bar' };
}

const COUNT_DURATION = 1.2;

/**
 * The metric's number counts up each time its chapter becomes the one being read. Digits are
 * written to the DOM directly (no re-render per frame); the server and screen readers get the
 * final value. Years (e.g. "2016") don't count: 0 → 2016 reads as noise, not impact.
 */
function Counter({ value, run }: { value: string; run: boolean }) {
  const reduce = useReducedMotion();
  const digits = useRef<HTMLSpanElement>(null);
  const match = value.match(/\d+(?:\.\d+)?/);
  const raw = match?.[0];
  const target = raw ? Number(raw) : 0;
  const decimals = raw?.split('.')[1]?.length ?? 0;
  const isYear = !!raw && /^\d{4}$/.test(raw) && target > 1900;

  useEffect(() => {
    const el = digits.current;
    if (!el || !raw || isYear) return;
    if (reduce || !run) {
      el.textContent = (reduce || run ? target : 0).toFixed(decimals);
      return;
    }
    const controls = animate(0, target, {
      duration: COUNT_DURATION,
      ease: EASE_OUT,
      delay: 0.2,
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [run, reduce, raw, target, decimals, isYear]);

  if (!match || match.index === undefined) return <span>{value}</span>;
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {value.slice(0, match.index)}
        <span ref={digits} className="tabular-nums">
          {raw}
        </span>
        {value.slice(match.index + raw!.length)}
      </span>
    </>
  );
}

const fill: Variants = {
  below: { scaleX: 0, transition: { duration: DURATION.fast } },
  above: { scaleX: 0, transition: { duration: DURATION.fast } },
  show: { scaleX: 1, transition: { duration: COUNT_DURATION, ease: EASE_OUT, delay: 0.25 } },
};

const tick: Variants = {
  below: { scaleY: 0.2, opacity: 0.25 },
  above: { scaleY: 0.2, opacity: 0.25 },
  show: { scaleY: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 22 } },
};

function MetricVisual({ value, reveal }: { value: string; reveal?: boolean }) {
  const reduce = useReducedMotion();
  const kind = kindOf(value);

  if (kind.type === 'ring') {
    return (
      <svg aria-hidden viewBox="0 0 36 36" className="size-10 shrink-0 -rotate-90 short:size-9">
        <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" className="stroke-muted" />
        <m.circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="stroke-primary"
          // pathLength isn't covered by reducedMotion="user", so the duration is dropped by hand.
          variants={{
            below: { pathLength: 0, transition: { duration: DURATION.fast } },
            above: { pathLength: 0, transition: { duration: DURATION.fast } },
            show: {
              pathLength: kind.fraction,
              transition: reduce
                ? { duration: 0 }
                : { duration: COUNT_DURATION, ease: EASE_OUT, delay: 0.25 },
            },
          }}
        />
      </svg>
    );
  }

  if (kind.type === 'ticks') {
    return (
      <m.span
        aria-hidden
        variants={{
          below: {},
          above: {},
          show: { transition: { delayChildren: stagger(0.06, { startDelay: 0.25 }) } },
        }}
        className="flex h-2.5 w-full items-end gap-1"
      >
        {Array.from({ length: kind.count }, (_, i) => (
          <m.span
            key={i}
            variants={tick}
            {...revealAttr(!!reveal)}
            className="h-full flex-1 origin-bottom rounded-full bg-primary"
          />
        ))}
      </m.span>
    );
  }

  return (
    <span aria-hidden className="relative block h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <m.span
        variants={fill}
        {...revealAttr(!!reveal)}
        className="absolute inset-0 origin-left rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)/0.35),hsl(var(--primary)))]"
      />
    </span>
  );
}

/** One oversized number with its micro-visual and label. */
export function Metric({
  stat,
  run,
  reveal,
  className,
  valueClassName,
}: {
  stat: Stat;
  run: boolean;
  reveal?: boolean;
  className?: string;
  valueClassName?: string;
}) {
  const ring = kindOf(stat.value).type === 'ring';
  return (
    <m.li
      variants={piece}
      {...revealAttr(!!reveal)}
      className={cn(
        'relative min-w-0 overflow-hidden rounded-xl border border-border/70 bg-background/40 p-3.5',
        className,
      )}
    >
      <div className={cn('flex', ring ? 'items-center gap-3' : 'flex-col gap-3 short:gap-2.5 shorter:gap-2')}>
        {ring && <MetricVisual value={stat.value} reveal={reveal} />}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-headline font-bold leading-none tracking-tight text-primary',
              valueClassName,
            )}
          >
            <Counter value={stat.value} run={run} />
          </p>
          <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground shorter:mt-1">{stat.label}</p>
        </div>
        {!ring && <MetricVisual value={stat.value} reveal={reveal} />}
      </div>
    </m.li>
  );
}
