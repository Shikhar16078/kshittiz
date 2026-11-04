'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { workExperience } from '@/lib/data';
import { showExperience } from '@/lib/events';
import { useFrameLoop } from '@/hooks/use-frame-loop';
import { springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { logoImageClass } from '@/lib/logo';

/** Each logo's turn in the light-up loop, and how long of it it's lit (ms). */
const SLOT = 2200;
const LIT = 1500;

const companies = workExperience.filter((job) => job.logo);

/** 0 → 1 → 0 (smooth) while it's this logo's turn, 0 otherwise. */
function glowAt(time: number, index: number) {
  const period = SLOT * companies.length;
  const phase = (((time - index * SLOT) % period) + period) % period;
  if (phase > LIT) return 0;
  return Math.sin((Math.PI * phase) / LIT) ** 2;
}

function Company({
  job,
  index,
  clock,
}: {
  job: (typeof companies)[number];
  index: number;
  clock: MotionValue<number>;
}) {
  const hover = useSpring(0, { stiffness: 260, damping: 30 });
  const loop = useTransform(clock, (t) => glowAt(t, index));
  // Hover (or focus) lights it fully; otherwise it follows the loop.
  const lit = useTransform([loop, hover], ([a, b]: number[]) => Math.max(a, b));
  const halo = useTransform(lit, (v) => v * 0.9);

  return (
    <li>
      <m.button
        type="button"
        onClick={() => showExperience(job.id)}
        onHoverStart={() => hover.set(1)}
        onHoverEnd={() => hover.set(0)}
        onFocus={() => hover.set(1)}
        onBlur={() => hover.set(0)}
        whileHover={{ y: -3, transition: springSnappy }}
        whileTap={{ scale: 0.95 }}
        aria-label={`${job.company}: show my experience there`}
        className="group relative inline-flex h-11 items-center gap-2 rounded-full px-2.5 text-sm font-medium text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Lit state: a soft pill behind, its opacity follows the loop. */}
        <m.span
          aria-hidden
          style={{ opacity: halo }}
          className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
        />
        <span className="relative size-6 shrink-0 overflow-hidden rounded-md ring-1 ring-border/60">
          <Image
            src={job.logo!}
            alt=""
            width={24}
            height={24}
            className={cn('absolute inset-0 opacity-60 grayscale', logoImageClass(job))}
          />
          {/* Full-colour copy faded in over the grey one (opacity, never a filter animation). */}
          <m.span style={{ opacity: lit }} className="absolute inset-0">
            <Image
              src={job.logo!}
              alt=""
              width={24}
              height={24}
              className={logoImageClass(job)}
            />
          </m.span>
        </span>
        <span className="relative">{job.company}</span>
      </m.button>
    </li>
  );
}

/**
 * Every company worked at, as small muted logo pills. They light up one after another in a slow
 * loop (one shared clock motion value, so nothing re-renders), lift and light fully under the
 * cursor or keyboard focus, and clicking one jumps to that role in Experience. The loop runs only
 * on screen and never with reduced motion.
 */
export function CompanyStrip({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const clock = useMotionValue(0);
  useFrameLoop((delta) => clock.set(clock.get() + delta), inView && !reduce);

  if (companies.length === 0) return null;

  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}
    >
      <p id="hero-companies" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
        Shipped at
      </p>
      <ul aria-labelledby="hero-companies" className="flex flex-wrap items-center justify-center gap-1 lg:justify-start">
        {companies.map((job, i) => (
          <Company key={job.id} job={job} index={i} clock={clock} />
        ))}
      </ul>
    </div>
  );
}
