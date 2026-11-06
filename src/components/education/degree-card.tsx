'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { m, useInView, type Variants } from 'motion/react';
import { ArrowRight, CalendarDays, GraduationCap } from 'lucide-react';
import type { Education as EducationEntry } from '@/lib/types';
import { projects } from '@/lib/data';
import { showProjects } from '@/lib/events';
import { Card } from '@/components/ui/card';
import { MotionButton } from '@/components/ui/motion-button';
import { Spotlight } from '@/components/motion/spotlight';
import { useAmbientMotion } from '@/lib/motion-tier';
import { BorderBeam } from '@/components/motion/border-beam';
import { Tilt } from '@/components/motion/tilt';
import { useScrollReveal } from '@/components/reveal';
import { GpaRing } from '@/components/education/gpa-ring';
import { matchesFilter } from '@/components/projects/filter';
import {
  cappedInterval,
  DURATION,
  EASE_OUT,
  exitTransition,
  GPU_REST,
  gpuKeyframes,
  springSnappy,
  staggerChildren,
} from '@/lib/motion';

const chip: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.92, transition: exitTransition },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/**
 * The crest as a large, faint watermark drifting slowly behind the card (a transform loop that
 * only runs on screen, as a GPU `transform` loop, and not with reduced motion or on the lite
 * motion tier). Decorative.
 */
function Watermark({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '50px' });
  const ambient = useAmbientMotion();
  const run = inView && ambient;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute -bottom-16 -right-14 h-64 w-64 md:h-72 md:w-72"
    >
      <m.div
        className="h-full w-full opacity-[0.05] grayscale dark:opacity-[0.06]"
        initial={{ transform: GPU_REST }}
        animate={
          run
            ? {
                transform: gpuKeyframes({ x: [0, -14, 6, 0], y: [0, -10, 8, 0], rotate: [0, -5, 3, 0] }),
                transition: { duration: 22, ease: 'easeInOut', repeat: Infinity },
              }
            : { transform: GPU_REST, transition: { duration: 0.6 } }
        }
      >
        <Image
          loading="eager"
          src={src}
          alt=""
          width={288}
          height={288}
          className="h-full w-full rounded-full object-cover"
        />
      </m.div>
    </div>
  );
}

function yearOf(date: string) {
  const match = date.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

/**
 * A degree card: crest, degree, school and years; a GPA gauge; the courses as chips that cascade
 * in; and a link that shows the projects started during the degree (Projects listens for the
 * event, filters its grid and scrolls there). Everything is visible without hover.
 */
export function DegreeCard({ edu }: { edu: EducationEntry }) {
  const [chipsRef, chipsShown] = useScrollReveal<HTMLUListElement>();
  const from = yearOf(edu.startDate);
  const to = yearOf(edu.endDate);
  const years: [number, number] | null =
    from !== null && to !== null ? [from, to] : null;
  const related = years
    ? projects.filter((p) => matchesFilter(p, { years })).length
    : 0;

  return (
    <Tilt max={3} className="h-full">
      <Card className="flex h-full flex-col overflow-hidden">
        <Spotlight />
        {edu.logo && <Watermark src={edu.logo} />}
        <BorderBeam />
        <div className="relative flex grow flex-col gap-5 p-5 md:p-6 shorter:gap-4 shorter:p-5">
          <div className="flex items-start gap-4">
            {edu.logo ? (
              <Image
                loading="eager"
                src={edu.logo}
                alt={`${edu.institution} crest`}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap aria-hidden className="h-6 w-6 text-primary-ink" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="font-headline text-lg font-semibold leading-snug md:text-xl">
                {edu.degree}
              </h3>
              <p className="pt-1 text-[15px] font-medium text-foreground/80">
                {edu.institution}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {edu.gpa && <GpaRing gpa={edu.gpa} />}
            <div className="min-w-0 space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
                <CalendarDays aria-hidden className="h-4 w-4" />
                {edu.startDate} – {edu.endDate}
              </span>
              <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
                {edu.description}
              </p>
            </div>
          </div>

          <div>
            <h4 className="pb-2.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Relevant courses
            </h4>
            <m.ul
              ref={chipsRef}
              initial="hidden"
              animate={chipsShown ? 'show' : 'hidden'}
              variants={staggerChildren(cappedInterval(edu.courses.length, 0.45, 0.07), 0.1)}
              className="flex flex-wrap gap-2"
            >
              {edu.courses.map((course) => (
                <m.li
                  key={course}
                  data-reveal=""
                  variants={chip}
                  whileHover={{ y: -3, scale: 1.04, transition: springSnappy }}
                  className="rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-sm leading-5 text-secondary-foreground transition-colors hover:border-foreground/25"
                >
                  {course}
                </m.li>
              ))}
            </m.ul>
          </div>

          {years && related > 0 && (
            <div className="mt-auto border-t pt-3">
              <MotionButton
                variant="ghost"
                className="-ml-3 h-11 rounded-full px-3 text-primary-ink hover:bg-primary/10 hover:text-primary-ink"
                onClick={() => showProjects({ years })}
              >
                Projects from this degree
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs tabular-nums leading-none">
                  {related}
                </span>
                <ArrowRight aria-hidden className="h-4 w-4" />
              </MotionButton>
            </div>
          )}
        </div>
      </Card>
    </Tilt>
  );
}
