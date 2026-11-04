'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ChevronDown, X } from 'lucide-react';
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
import { useFinePointer } from '@/hooks/use-fine-pointer';
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
  yearRange,
  type ChapterState,
} from '@/components/experience/chapter-parts';
import { LiveDot } from '@/components/live-dot';

/** The sticky header's height: the stage pins right under it. */
const HEADER = 64;

/** Where in the pinned track a chapter is "settled": its share of the track, a little way in. */
const chapterProgress = (i: number, n: number) => (i === 0 ? 0 : (i + 0.3) / n);

const reducedMotionNow = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Where the stage's glow sits for each chapter; it glides between them as chapters change.
const GLOW_SPOTS = [
  { x: '55%', y: '-35%' },
  { x: '-15%', y: '5%' },
  { x: '70%', y: '30%' },
  { x: '10%', y: '-20%' },
];

const glowSpring = { type: 'spring', stiffness: 60, damping: 20, mass: 1 } as const;

/**
 * Desktop scroll story. The section is a tall track (one screen per role plus the opening
 * frame) and a stage inside it stays pinned under the header while the page scrolls through.
 * Scroll progress, smoothed by a spring, picks the chapter on stage and drives the rail; the page
 * scroll itself is never intercepted. Every chapter is rendered (stacked in one grid cell), so
 * screen readers and the Tab key reach all roles in order; the ones not on stage are only
 * transparent and click-through, and focusing into one scrolls the page to it.
 */
export function PinnedStory({ jobs }: { jobs: WorkExperience[] }) {
  const n = jobs.length;
  const track = useRef<HTMLDivElement>(null);
  const [stageRef, shown] = useScrollReveal<HTMLDivElement>();
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  // Parallax is scroll-linked JS movement: mouse/trackpad only, never with reduced motion. Starts
  // still for the server render and hydration, then switches on after mount.
  const [still, setStill] = useState(true);
  useEffect(() => setStill(!!reduce || !fine), [reduce, fine]);

  const { scrollYProgress } = useScroll({
    target: track,
    offset: [`start ${HEADER}px`, 'end end'],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 36,
    mass: 0.5,
    restDelta: 0.0005,
  });
  // With reduced motion the raw progress is used, so the rail and the chapter switch are instant.
  const progress = reduce ? scrollYProgress : smooth;

  const [active, setActive] = useState(0);
  const pick = useCallback(
    (v: number) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n)))),
    [n],
  );
  useMotionValueEvent(smooth, 'change', (v) => !reduce && pick(v));
  useMotionValueEvent(scrollYProgress, 'change', (v) => reduce && pick(v));
  useEffect(() => pick(scrollYProgress.get()), [pick, scrollYProgress]);

  const scrollToChapter = useCallback(
    (i: number) => {
      const el = track.current;
      const stage = stageRef.current;
      if (!el || !stage) return;
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER;
      const range = el.offsetHeight - stage.offsetHeight;
      window.scrollTo({
        top: top + chapterProgress(i, n) * range,
        behavior: reducedMotionNow() ? 'auto' : 'smooth',
      });
    },
    [n, stageRef],
  );

  // Cross-links from other sections ("where I used it"). Only the visible layout answers.
  useEffect(() => {
    const onShow = (e: Event) => {
      const { id } = (e as CustomEvent<ExperienceShowDetail>).detail ?? {};
      const i = jobs.findIndex((j) => j.id === id);
      if (i < 0 || !track.current?.offsetParent) return;
      scrollToChapter(i);
    };
    window.addEventListener(EXPERIENCE_SHOW, onShow);
    return () => window.removeEventListener(EXPERIENCE_SHOW, onShow);
  }, [jobs, scrollToChapter]);

  const stateOf = (i: number): ChapterState =>
    !shown ? 'below' : i === active ? 'show' : i < active ? 'above' : 'below';

  return (
    <div
      ref={track}
      className="relative hidden lg:block"
      // One screen per role, plus the opening frame.
      style={{ height: `calc((100svh - 4rem) * ${n + 1})` }}
    >
      <div
        ref={stageRef}
        className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col py-8 short:py-6 shorter:py-4"
      >
        <SectionTitle number="01">Experience</SectionTitle>
        <div className="grid min-h-0 flex-1 grid-cols-[3.5rem_minmax(0,1fr)] gap-5 xl:grid-cols-[11rem_minmax(0,1fr)] xl:gap-8">
          <Rail
            jobs={jobs}
            active={active}
            progress={progress}
            n={n}
            onSelect={scrollToChapter}
          />
          <Card className="flex min-h-0 flex-col overflow-hidden">
            <Spotlight />
            <BorderBeam />
            {/* Ambient light that glides to a new spot for each chapter. */}
            <m.div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 aspect-square w-[70%] rounded-full bg-[radial-gradient(circle,hsl(var(--glow)/0.14),transparent_65%)]"
              initial={false}
              animate={GLOW_SPOTS[active % GLOW_SPOTS.length]}
              transition={reduce ? { duration: 0 } : glowSpring}
            />
            {/* The logo slot stays put; logos crossfade (with a small spin and pop) between roles. */}
            <div
              aria-hidden
              className="absolute left-6 top-6 z-[2] size-12 short:left-5 short:top-5 shorter:size-11"
            >
              {jobs.map((job, i) => (
                <m.span
                  key={job.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={
                    i === active
                      ? { opacity: 1, scale: 1, rotate: 0 }
                      : { opacity: 0, scale: 0.6, rotate: i < active ? -20 : 20 }
                  }
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                >
                  <CompanyLogo job={job} className="size-full ring-2 ring-primary/40" />
                </m.span>
              ))}
            </div>
            <div className="relative grid min-h-0 flex-1">
              {jobs.map((job, i) => (
                <PinnedChapter
                  key={job.id}
                  job={job}
                  index={i}
                  total={n}
                  state={stateOf(i)}
                  reveal={i === 0}
                  still={still}
                  progress={progress}
                  onRequest={scrollToChapter}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Rail({
  jobs,
  active,
  progress,
  n,
  onSelect,
}: {
  jobs: WorkExperience[];
  active: number;
  progress: MotionValue<number>;
  n: number;
  onSelect: (i: number) => void;
}) {
  // Full once the last chapter starts, so the tip reaches each node as its chapter begins.
  const fill = useTransform(progress, (v) =>
    n > 1 ? Math.min(1, Math.max(0, (v * n) / (n - 1))) : 1,
  );
  const tip = useTransform(fill, (v) => `${v * 100}%`);

  return (
    <nav aria-label="Roles" className="relative flex min-h-0 flex-col justify-between py-6">
      {/* The rail runs between the first and last node centres (nodes are 44 px tall). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[calc(1.5rem+22px)] left-[26px] top-[calc(1.5rem+22px)] w-0.5"
      >
        <div className="absolute inset-0 rounded-full bg-border" />
        <m.div
          className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(to_bottom,hsl(var(--primary)/0.4),hsl(var(--primary)))]"
          style={{ scaleY: fill }}
        />
        <m.div className="absolute inset-0" style={{ y: tip }}>
          <span className="absolute left-1/2 top-0 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.3)_15%,hsl(var(--glow)/0.1)_45%,transparent_70%)]" />
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground ring-2 ring-primary" />
        </m.div>
      </div>

      {jobs.map((job, i) => {
        const on = i === active;
        return (
          <m.button
            key={job.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`${job.role} at ${job.company}, ${job.startDate} to ${job.endDate}`}
            aria-current={on ? 'step' : undefined}
            whileTap={{ scale: 0.95 }}
            className="group relative z-[1] -ml-1 flex min-h-11 items-center gap-3 rounded-full py-0 pl-1 pr-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <m.span
              animate={{ scale: on ? 1.12 : 1 }}
              whileHover={{ scale: on ? 1.16 : 1.08 }}
              transition={springSnappy}
              className="relative flex size-11 shrink-0"
            >
              <CompanyLogo
                job={job}
                size={44}
                className={cn(
                  'size-11 ring-2 ring-offset-2 ring-offset-background transition-colors',
                  on ? 'ring-primary' : 'ring-border grayscale-[60%] group-hover:ring-primary/50',
                )}
              />
            </m.span>
            <span className="hidden min-w-0 flex-col leading-tight xl:flex">
              <span
                className={cn(
                  'text-sm font-semibold transition-colors',
                  on ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                )}
              >
                {job.company}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {yearRange(job)}
                {isCurrent(job) && <LiveDot className="size-1.5" />}
              </span>
            </span>
          </m.button>
        );
      })}
    </nav>
  );
}

function PinnedChapter({
  job,
  index,
  total,
  state,
  reveal,
  still,
  progress,
  onRequest,
}: {
  job: WorkExperience;
  index: number;
  total: number;
  state: ChapterState;
  reveal: boolean;
  still: boolean;
  progress: MotionValue<number>;
  onRequest: (i: number) => void;
}) {
  const headingId = useId();
  const detailsId = useId();
  const [open, setOpen] = useState(false);
  const on = state === 'show';
  // Close the details when the chapter leaves the stage.
  useEffect(() => {
    if (!on) setOpen(false);
  }, [on]);

  // How far the page is through this chapter: 0 as it arrives, 1 as it hands over.
  const local = useTransform(progress, (v) => v * total - index);
  // Parallax layers: the watermark drifts fastest, the metrics a little, the text not at all.
  const markY = useTransform(local, [-0.5, 1.5], [90, -90]);
  const metricsY = useTransform(local, [0, 1], [10, -10]);

  const two = String(index + 1).padStart(2, '0');
  const of = String(total).padStart(2, '0');

  return (
    <m.article
      aria-labelledby={headingId}
      initial="below"
      animate={state}
      variants={chapter}
      {...revealAttr(reveal)}
      // Tabbing into a chapter that isn't on stage brings it on stage.
      onFocusCapture={() => !on && onRequest(index)}
      className={cn(
        'flex min-h-0 flex-col p-6 [grid-area:1/1] short:p-5 shorter:p-4',
        !on && 'pointer-events-none',
      )}
    >
      {/* A huge, faint company initial behind the chapter, drifting against the scroll. */}
      <m.span
        aria-hidden
        style={{ y: still ? 0 : markY }}
        className="pointer-events-none absolute -bottom-[0.18em] right-4 select-none font-headline text-[clamp(14rem,44svh,30rem)] font-bold leading-none text-foreground/[0.035]"
      >
        {job.company.charAt(0)}
      </m.span>

      <header className="relative flex min-h-12 items-start justify-between gap-4 pl-16 shorter:min-h-11 shorter:pl-14">
        <RoleMeta job={job} headingId={headingId} reveal={reveal} />
        <m.span
          variants={piece}
          {...revealAttr(reveal)}
          aria-hidden
          className="shrink-0 pt-1 font-headline text-sm tabular-nums tracking-widest text-muted-foreground"
        >
          <span className="text-primary">{two}</span> / {of}
        </m.span>
      </header>

      <div data-body className="relative mt-6 grid min-h-0 flex-1 grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] items-center gap-8 short:mt-4 shorter:mt-3 xl:gap-12">
        <div className="min-w-0 space-y-6 short:space-y-4 shorter:space-y-3">
          <Headline
            text={job.headline}
            reveal={reveal}
            className="text-[clamp(1.6rem,min(2.7vw,5svh),3.25rem)]"
          />
          <Wins items={job.wins} reveal={reveal} className="shorter:space-y-1.5" />
        </div>
        <m.ul
          aria-label="Impact"
          style={{ y: still ? 0 : metricsY }}
          className="flex min-w-0 flex-col gap-3 shorter:gap-2"
        >
          {(job.impact ?? []).map((stat) => (
            <Metric
              key={stat.label}
              stat={stat}
              run={on}
              reveal={reveal}
              className="short:p-3 shorter:px-3 shorter:py-2.5"
              valueClassName="text-[clamp(1.5rem,min(3vw,4.6svh),3rem)]"
            />
          ))}
        </m.ul>

        {/* Full details: folds open over the chapter body and scrolls inside its own bounds, so the
            stage never grows past the screen. */}
        <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-end">
          <AnimatePresence initial={false}>
            {open && (
              <m.div
                key="details"
                id={detailsId}
                variants={collapse}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="pointer-events-auto flex max-h-full flex-col overflow-hidden rounded-xl border bg-card shadow-[0_-12px_32px_-16px_hsl(0_0%_0%/0.45)]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false);
                }}
              >
                <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
                  <p className="text-sm font-semibold">
                    Everything at {job.company}
                  </p>
                  <MotionButton
                    feel="pop"
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label="Close full details"
                    onClick={() => setOpen(false)}
                  >
                    <X aria-hidden className="size-4" />
                  </MotionButton>
                </div>
                <m.ul
                  variants={staggerChildren(0.04, 0.1)}
                  className="min-h-0 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-3"
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
        </div>
      </div>

      <m.footer
        variants={piece}
        {...revealAttr(reveal)}
        className="relative mt-6 flex items-end justify-between gap-4 short:mt-4 shorter:mt-3"
      >
        <StackChips items={job.stack} className="min-w-0" />
        <MotionButton
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0 rounded-full px-4"
          aria-expanded={open}
          aria-controls={open ? detailsId : undefined}
          onClick={() => setOpen((v) => !v)}
        >
          Full details
          <m.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={springSnappy}
            className="ml-1 inline-flex"
          >
            <ChevronDown className="size-4" />
          </m.span>
        </MotionButton>
      </m.footer>
    </m.article>
  );
}
