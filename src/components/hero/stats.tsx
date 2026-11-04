'use client';

import { useRef } from 'react';
import { m, useInView, useReducedMotion, type Transition } from 'motion/react';
import { RevealGroup, RevealItem, useScrollReveal } from '@/components/reveal';
import { CountUp } from '@/components/count-up';
import { EASE_OUT, springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Stat = { value: string; label: string };
type Kind = 'year' | 'flow' | 'race' | 'dots';

/** Visuals start once the count-up (1.4s) is nearly done, then one stat after another. */
const VISUAL_AT = 1.1;
const VISUAL_GAP = 0.22;
/** How far back the year ticker starts rolling from. */
const TICKER_YEARS = 8;

function kindOf(value: string): Kind | null {
  if (/^\d{4}$/.test(value)) return 'year';
  if (/\d\s*[TGP]B\b/i.test(value)) return 'flow';
  if (/\d\s*[×x]$/.test(value)) return 'race';
  const n = Number(value);
  if (Number.isInteger(n) && n > 0 && n <= 12) return 'dots';
  return null;
}

type VisualProps = { shown: boolean; delay: number; live: boolean };

/** "~300 TB": seconds for the dash to cross the track, and the pause before it goes again. */
const LAP = 1.6;
const LAP_PAUSE = 0.6;

/**
 * "~300 TB moved": a track with one dash of data sliding along it, loop after loop. The dash rides
 * a carrier the width of the track; it's a quarter of the track long, so x: 0% → 126% takes it
 * fully off the far end. Moves only on screen and never with reduced motion (then it rests
 * mid-track).
 */
function Flow({ shown, delay, live }: VisualProps) {
  const moving = live && shown;
  return (
    <m.span
      data-reveal=""
      className="relative block h-1.5 w-24 origin-left overflow-hidden rounded-full bg-primary/15"
      initial={{ scaleX: 0 }}
      animate={{
        scaleX: shown ? 1 : 0,
        transition: shown ? { duration: 0.6, ease: EASE_OUT, delay } : { duration: 0.15 },
      }}
    >
      <m.span
        className="absolute inset-0"
        initial={{ x: '60%' }}
        animate={
          moving
            ? {
                x: ['0%', '126%'],
                transition: {
                  duration: LAP,
                  ease: [0.45, 0, 0.55, 1],
                  repeat: Infinity,
                  repeatDelay: LAP_PAUSE,
                  delay: delay + 0.6,
                },
              }
            : { x: '60%' }
        }
      >
        <span className="absolute left-0 top-0 h-full w-6 -translate-x-full rounded-full bg-primary" />
      </m.span>
    </m.span>
  );
}

/** "8×": two bars race for the same time; the faster one covers 8× the distance. */
function Race({ shown, delay, ratio }: VisualProps & { ratio: number }) {
  const t = (d: number): Transition =>
    shown ? { duration: 1.1, ease: EASE_OUT, delay: d } : { duration: 0.2 };
  return (
    <span className="flex w-28 flex-col gap-1">
      <m.span
        data-reveal=""
        className="block h-1 origin-left rounded-full bg-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: shown ? 1 : 0, transition: t(delay) }}
      />
      <m.span
        data-reveal=""
        style={{ width: `${100 / ratio}%` }}
        className="block h-1 origin-left rounded-full bg-muted-foreground/45"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: shown ? 1 : 0, transition: t(delay) }}
      />
    </span>
  );
}

/** "2015": a timeline filling from then to now, ending on a lit "now" dot. */
function Timeline({ shown, delay }: VisualProps) {
  return (
    <span className="relative flex h-1.5 w-24 items-center">
      <span className="absolute inset-x-0 h-px bg-border" />
      <m.span
        data-reveal=""
        className="absolute inset-x-0 h-0.5 origin-left rounded-full bg-primary"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: shown ? 1 : 0,
          transition: shown ? { duration: 0.9, ease: EASE_OUT, delay } : { duration: 0.2 },
        }}
      />
      <span className="absolute left-0 size-1.5 rounded-full bg-primary" />
      <m.span
        data-reveal=""
        className="absolute right-0 size-1.5 rounded-full bg-primary"
        initial={{ scale: 0 }}
        animate={{
          scale: shown ? 1 : 0,
          transition: shown ? { ...springSnappy, delay: delay + 0.8 } : { duration: 0.2 },
        }}
      />
    </span>
  );
}

/** "4": one dot per company, popping in one after another. */
function Dots({ shown, delay, count }: VisualProps & { count: number }) {
  return (
    <span className="flex h-1.5 items-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <m.span
          key={i}
          data-reveal=""
          className="block size-1.5 rounded-full bg-primary"
          initial={{ scale: 0 }}
          animate={{
            scale: shown ? 1 : 0,
            transition: shown
              ? { type: 'spring', stiffness: 600, damping: 18, delay: delay + i * 0.12 }
              : { duration: 0.15 },
          }}
        />
      ))}
    </span>
  );
}

/**
 * The year rolls up through the years before it and lands on it, like a ticker. The server renders
 * it resting on the year; it drops back before revealing. Screen readers get the plain year.
 */
function YearTicker({ value, shown }: { value: string; shown: boolean }) {
  const year = Number(value);
  const years = Array.from({ length: TICKER_YEARS }, (_, i) => year - TICKER_YEARS + 1 + i);
  const end = `${(-(TICKER_YEARS - 1) / TICKER_YEARS) * 100}%`;
  return (
    <span>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-block h-[1.1em] overflow-hidden align-bottom leading-[1.1em]">
        <m.span
          className="block tabular-nums"
          initial={{ y: end }}
          animate={{
            y: shown ? end : '0%',
            transition: shown
              ? { duration: 1.4, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0 },
          }}
        >
          {years.map((y) => (
            <span key={y} className="block h-[1.1em]">
              {y}
            </span>
          ))}
        </m.span>
      </span>
    </span>
  );
}

function StatVisual({ kind, value, ...props }: VisualProps & { kind: Kind; value: string }) {
  const n = Number(value.match(/\d+/)?.[0] ?? 0);
  if (kind === 'flow') return <Flow {...props} />;
  if (kind === 'race') return <Race {...props} ratio={Math.max(n, 1)} />;
  if (kind === 'dots') return <Dots {...props} count={n} />;
  return <Timeline {...props} />;
}

/**
 * Key numbers under the hero: 2×2 on phones, one row of four from md up, separated by hairline
 * dividers. Items rise in one after another and the numbers count up (the year rolls like a
 * ticker); then each gets a small visual in turn: a timeline, one dot per company, a dash of
 * data sliding along a track and a speed race. The dash loops only on screen and never with
 * reduced motion.
 */
export function HeroStats({ stats, className }: { stats: readonly Stat[]; className?: string }) {
  const [ref, shown] = useScrollReveal<HTMLDListElement>();
  const box = useRef<HTMLDivElement>(null);
  // The top quarter of the screen doesn't count: the hero drifts down as the page scrolls, so the
  // stats linger there underneath the next section (IntersectionObserver ignores that cover).
  const inView = useInView(box, { margin: '-25% 0px 0px 0px' });
  const reduce = useReducedMotion();
  const live = inView && !reduce;

  if (stats.length === 0) return null;
  return (
    <RevealGroup className={cn('border-t border-border/60', className)}>
      <div ref={box}>
        <dl ref={ref} className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => {
            const kind = kindOf(stat.value);
            return (
              <RevealItem
                key={stat.label}
                className={cn(
                  'flex flex-col-reverse gap-1 py-5 md:px-6 md:py-6 short:py-4 shorter:py-3.5',
                  // Phones (2 columns): divider right of the left column, below the first row.
                  i % 2 === 0 ? 'border-r border-border/60 pr-4' : 'pl-4',
                  i < 2 && 'border-b border-border/60 md:border-b-0',
                  // md+ (4 columns): dividers between every item, none after the last.
                  'md:border-r md:pl-6 md:pr-6 md:first:pl-0 md:last:border-r-0',
                )}
              >
                <dt className="text-sm leading-snug text-muted-foreground">{stat.label}</dt>
                <dd className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl shorter:text-[2rem]">
                  {kind === 'year' ? (
                    <YearTicker value={stat.value} shown={shown} />
                  ) : (
                    <CountUp value={stat.value} />
                  )}
                  {/* Always reserved, so stats without a visual keep their labels in line. */}
                  <span aria-hidden className="mt-1.5 flex h-2.5 items-center">
                    {kind && (
                      <StatVisual
                        kind={kind}
                        value={stat.value}
                        shown={shown}
                        live={live}
                        delay={VISUAL_AT + i * VISUAL_GAP}
                      />
                    )}
                  </span>
                </dd>
              </RevealItem>
            );
          })}
        </dl>
      </div>
    </RevealGroup>
  );
}
