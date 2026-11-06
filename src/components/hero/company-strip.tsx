'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { animate, m, useInView } from 'motion/react';
import { workExperience } from '@/lib/data';
import { showExperience } from '@/lib/events';
import { springSnappy } from '@/lib/motion';
import { useAmbientMotion } from '@/lib/motion-tier';
import { cn } from '@/lib/utils';
import { logoImageClass } from '@/lib/logo';

/** Each logo's turn in the light-up loop, and how long of it it's lit (ms). */
const SLOT = 2200;
const LIT = 1500;

const companies = workExperience.filter((job) => job.logo);

/**
 * Opacity keyframes for one logo's turn in the shared loop: dark, rising to lit and back within
 * its slot, dark for the rest of the period. All logos start their loops together, so the turns
 * pass along the row in order.
 */
function turn(index: number) {
  const period = SLOT * companies.length;
  const from = (index * SLOT) / period;
  const peak = (index * SLOT + LIT / 2) / period;
  const to = (index * SLOT + LIT) / period;
  const times = from > 0 ? [0, from, peak, to, 1] : [0, peak, to, 1];
  const opacity = from > 0 ? [0, 0, 1, 0, 0] : [0, 1, 0, 0];
  return { times, opacity, duration: period / 1000 };
}

function Company({
  job,
  index,
  live,
}: {
  job: (typeof companies)[number];
  index: number;
  live: boolean;
}) {
  const halo = useRef<HTMLSpanElement>(null);
  const color = useRef<HTMLSpanElement>(null);

  // The loop: GPU opacity animations on the lit pill and the full-colour logo.
  useEffect(() => {
    if (!live) return;
    const { times, opacity, duration } = turn(index);
    const options = { duration, times, ease: 'easeInOut' as const, repeat: Infinity };
    const loops = [
      color.current && animate(color.current, { opacity }, options),
      halo.current && animate(halo.current, { opacity: opacity.map((o) => o * 0.9) }, options),
    ];
    return () => {
      for (const l of loops) l?.stop();
      if (color.current) color.current.style.opacity = '0';
      if (halo.current) halo.current.style.opacity = '0';
    };
  }, [live, index]);

  return (
    <li>
      <m.button
        type="button"
        onClick={() => showExperience(job.id)}
        whileHover={{ y: -3, transition: springSnappy }}
        whileTap={{ scale: 0.95 }}
        aria-label={`${job.company}: show my experience there`}
        className="group relative inline-flex h-11 items-center gap-2 rounded-full px-2.5 text-sm font-medium text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Lit state: a soft pill behind. The loop drives one copy; hover and keyboard focus
            light a second copy with a plain opacity transition, so the two never fight. */}
        <span
          ref={halo}
          aria-hidden
          style={{ opacity: 0 }}
          className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-90 group-focus-visible:opacity-90"
        />
        <span className="relative size-6 shrink-0 overflow-hidden rounded-md ring-1 ring-border/60">
          <Image
            loading="eager"
            src={job.logo!}
            alt=""
            width={24}
            height={24}
            className={cn('absolute inset-0 opacity-60 grayscale', logoImageClass(job))}
          />
          {/* Full-colour copies faded in over the grey one (opacity, never a filter animation):
              one for the loop, one for hover/focus. */}
          <span ref={color} style={{ opacity: 0 }} className="absolute inset-0">
            <Image loading="eager" src={job.logo!} alt="" width={24} height={24} className={logoImageClass(job)} />
          </span>
          <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Image loading="eager" src={job.logo!} alt="" width={24} height={24} className={logoImageClass(job)} />
          </span>
        </span>
        <span className="relative">{job.company}</span>
      </m.button>
    </li>
  );
}

/**
 * Every company worked at, as small muted logo pills. They light up one after another in a slow
 * loop (GPU opacity animations started together, so nothing runs per frame in JS), lift and
 * light fully under the cursor or keyboard focus, and clicking one jumps to that role in
 * Experience. The loop runs only on screen and never with reduced motion or on the lite tier.
 */
export function CompanyStrip({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const live = useAmbientMotion() && inView;

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
          <Company key={job.id} job={job} index={i} live={live} />
        ))}
      </ul>
    </div>
  );
}
