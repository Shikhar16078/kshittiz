'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  AnimatePresence,
  m,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { WorkExperience } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EXPERIENCE_SHOW, type ExperienceShowDetail } from '@/lib/events';
import { collapse, fadeUp, springSnappy, staggerChildren } from '@/lib/motion';
import { SectionTitle } from '@/components/layout/section-wrapper';
import { Card } from '@/components/ui/card';
import { MotionButton } from '@/components/ui/motion-button';
import { Spotlight } from '@/components/motion/spotlight';
import { BorderBeam } from '@/components/motion/border-beam';
import { useScrollReveal } from '@/components/reveal';
import {
  chapter,
  CompanyLogo,
  Headline,
  isCurrent,
  Metric,
  piece,
  revealAttr,
  RoleMeta,
  StackChips,
  Wins,
} from '@/components/experience/chapter-parts';
import { LiveDot } from '@/components/live-dot';

const HEADER = 64;
const cardId = (job: WorkExperience) => `experience-${job.id}`;

/**
 * Follows the sticky site header as it tucks away on scroll (it slides up by its own height), so
 * the mini progress bar can slide up with it instead of leaving a gap. It reads the header's own
 * inline transform when Motion writes it (no layout reads), and only while the header animates.
 */
function useHeaderShift() {
  const shift = useMotionValue(0);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    if (!header) return;
    const read = () => {
      const t = header.style.transform;
      const pct = t.match(/translateY\((-?[\d.]+)%\)/);
      const px = t.match(/translateY\((-?[\d.]+)px\)/);
      shift.set(pct ? (Number(pct[1]) / 100) * HEADER : px ? Number(px[1]) : 0);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(header, { attributes: true, attributeFilter: ['style'] });
    return () => mo.disconnect();
  }, [shift]);
  return shift;
}

/**
 * Phones and tablets: no pinning. Each role is a full card that plays the same choreography as
 * the desktop chapters when it scrolls into view, and a sticky row of logos at the top shows
 * (and jumps to) the role being read.
 */
export function StackedStory({ jobs }: { jobs: WorkExperience[] }) {
  const n = jobs.length;
  const [inView, setInView] = useState(0);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const shift = useHeaderShift();
  const reduce = useReducedMotion();

  // The role being read is the card crossing the middle band of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setInView(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const el of cards.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollToCard = (i: number) => {
    const el = cards.current[i];
    if (!el) return;
    // Below the header and the sticky logo row (scroll-margin on the card).
    el.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    const onShow = (e: Event) => {
      const { id } = (e as CustomEvent<ExperienceShowDetail>).detail ?? {};
      const i = jobs.findIndex((j) => j.id === id);
      const el = cards.current[i];
      if (i < 0 || !el?.offsetParent) return;
      scrollToCard(i);
    };
    window.addEventListener(EXPERIENCE_SHOW, onShow);
    return () => window.removeEventListener(EXPERIENCE_SHOW, onShow);
  });

  return (
    <div className="lg:hidden">
      <SectionTitle number="01">Experience</SectionTitle>

      <m.nav
        aria-label="Roles"
        style={{ y: shift }}
        className="sticky top-16 z-10 -mx-4 mb-5 border-b border-border/60 bg-background px-4 py-1.5 sm:-mx-6 sm:px-6"
      >
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          {/* Track and fill behind the logos, filling up to the role in view. */}
          <span aria-hidden className="absolute inset-x-[22px] top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
          <m.span
            aria-hidden
            className="absolute left-[22px] right-[22px] top-1/2 h-0.5 origin-left -translate-y-1/2 rounded-full bg-primary"
            initial={false}
            animate={{ scaleX: n > 1 ? inView / (n - 1) : 1 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}
          />
          {jobs.map((job, i) => {
            const on = i === inView;
            return (
              <m.button
                key={job.id}
                type="button"
                onClick={() => scrollToCard(i)}
                aria-label={`${job.role} at ${job.company}`}
                aria-current={on ? 'step' : undefined}
                whileTap={{ scale: 0.9 }}
                className="relative flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <m.span
                  initial={false}
                  animate={{ scale: on ? 1.15 : 0.9, opacity: on ? 1 : 0.7 }}
                  transition={springSnappy}
                  className="flex"
                >
                  <CompanyLogo
                    job={job}
                    size={32}
                    className={cn(
                      'size-8 ring-2 ring-offset-2 ring-offset-background transition-colors',
                      on ? 'ring-primary' : 'ring-border',
                    )}
                  />
                </m.span>
                {isCurrent(job) && (
                  <LiveDot className="absolute right-0.5 top-0.5 size-2" />
                )}
              </m.button>
            );
          })}
        </div>
      </m.nav>

      <div className="space-y-5 sm:space-y-6">
        {jobs.map((job, i) => (
          <StackedCard
            key={job.id}
            job={job}
            index={i}
            total={n}
            active={i === inView}
            cardRef={(el) => {
              cards.current[i] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StackedCard({
  job,
  index,
  total,
  active,
  cardRef,
}: {
  job: WorkExperience;
  index: number;
  total: number;
  active: boolean;
  cardRef: (el: HTMLElement | null) => void;
}) {
  const [ref, shown] = useScrollReveal<HTMLElement>();
  const headingId = useId();
  const moreId = useId();
  const [open, setOpen] = useState(false);
  const state = shown ? 'show' : 'below';

  return (
    <m.article
      ref={(el) => {
        ref.current = el;
        cardRef(el);
      }}
      id={cardId(job)}
      data-index={index}
      aria-labelledby={headingId}
      initial="below"
      animate={state}
      variants={chapter}
      data-reveal=""
      // Clear the header and the sticky logo row when jumped to.
      className="scroll-mt-32"
    >
      <Card className="overflow-hidden p-5 sm:p-6">
        <Spotlight />
        <BorderBeam active={active} />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.2em] -right-2 select-none font-headline text-[11rem] font-bold leading-none text-foreground/[0.04]"
        >
          {job.company.charAt(0)}
        </span>

        <header className="relative flex items-start gap-3">
          <m.span variants={piece} data-reveal="">
            <CompanyLogo job={job} size={44} className="size-11 ring-2 ring-primary/40" />
          </m.span>
          <div className="min-w-0 flex-1">
            <RoleMeta job={job} headingId={headingId} reveal />
          </div>
          <span
            aria-hidden
            className="shrink-0 pt-1 font-headline text-xs tabular-nums tracking-widest text-muted-foreground"
          >
            <span className="text-primary-ink">{String(index + 1).padStart(2, '0')}</span> /{' '}
            {String(total).padStart(2, '0')}
          </span>
        </header>

        <Headline
          text={job.headline}
          reveal
          className="relative mt-5 text-[1.65rem] sm:text-3xl"
        />

        <ul
          aria-label="Impact"
          className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        >
          {(job.impact ?? []).map((stat, k, all) => (
            <Metric
              key={stat.label}
              stat={stat}
              run={shown}
              reveal
              // An odd one out spans the row on two-column phones.
              className={cn(all.length % 2 === 1 && k === all.length - 1 && 'col-span-2 sm:col-span-1')}
              valueClassName="text-[1.75rem] sm:text-3xl"
            />
          ))}
        </ul>

        <Wins items={job.wins} reveal className="relative mt-5" />

        <StackChips items={job.stack} reveal className="relative mt-5" />

        <m.div variants={piece} data-reveal="" className="relative mt-3">
          <MotionButton
            variant="link"
            whileHover={undefined}
            className="min-h-11 px-0"
            aria-expanded={open}
            aria-controls={open ? moreId : undefined}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Hide details' : `Full details (${job.accomplishments.length})`}
            <m.span
              aria-hidden
              animate={{ rotate: open ? 180 : 0 }}
              transition={springSnappy}
              className="ml-1 inline-flex"
            >
              <ChevronDown className="size-4" />
            </m.span>
          </MotionButton>
          <AnimatePresence initial={false}>
            {open && (
              <m.div
                key="more"
                id={moreId}
                variants={collapse}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="overflow-hidden"
              >
                <m.ul
                  variants={staggerChildren(0.04, 0.1)}
                  className="space-y-2.5 border-t pt-3"
                >
                  {job.accomplishments.map((item, k) => (
                    <m.li
                      key={k}
                      variants={fadeUp}
                      className="flex gap-3 text-[15px] leading-7 text-muted-foreground"
                    >
                      <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="max-w-prose">{item}</span>
                    </m.li>
                  ))}
                </m.ul>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </Card>
    </m.article>
  );
}
