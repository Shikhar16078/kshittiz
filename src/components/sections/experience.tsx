'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  m,
  useReducedMotion,
  useScroll,
  type Variants,
} from 'motion/react';
import { Building, CalendarDays, CheckCircle, ChevronDown } from 'lucide-react';
import { workExperience } from '@/lib/data';
import type { WorkExperience } from '@/lib/types';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal, useScrollReveal } from '@/components/reveal';
import { collapse, DURATION, EASE_OUT, exitTransition } from '@/lib/motion';

const companyLogos: Record<string, string> = {
  Microsoft: '/images/microsoft.png',
  FactSet: '/images/factset.jpeg',
  PayPal: '/images/paypal.jpeg',
  Aricent: '/images/aricent.jpeg',
};

/** The rail fill and the logo pops both use this line, 60% down the screen. */
const FILL_LINE = 0.6;
const FILL_MARGIN = `100000px 0px -${(1 - FILL_LINE) * 100}% 0px`;

const logoPop: Variants = {
  hidden: { scale: 0.5, opacity: 0, transition: exitTransition },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 18 },
  },
};

/** True on mouse/trackpad devices, where scroll-linked JS movement stays in sync. */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return fine;
}

/**
 * The timeline rail fills from the top as the page scrolls (mouse/trackpad only; on touch screens
 * the rail stays plain because JS-driven movement lags behind native scrolling).
 */
function RailFill({
  target,
}: {
  target: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target,
    offset: [`start ${FILL_LINE}`, `end ${FILL_LINE}`],
  });
  return (
    <m.div
      aria-hidden
      style={{ scaleY: scrollYProgress }}
      className="absolute left-3 top-5 h-[calc(100%-2rem)] w-0.5 origin-top bg-primary md:left-5"
    />
  );
}

function TimelineEntry({ job }: { job: WorkExperience }) {
  const [expanded, setExpanded] = useState(false);
  // The logo pops in when the rail's fill reaches it.
  const [logoRef, logoShown] = useScrollReveal<HTMLDivElement>(FILL_MARGIN);
  const initial = job.accomplishments.slice(0, 3);
  const remaining = job.accomplishments.slice(3);

  return (
    <div className="relative pl-12 md:pl-16">
      <m.div
        ref={logoRef}
        data-reveal=""
        initial="hidden"
        animate={logoShown ? 'show' : 'hidden'}
        variants={logoPop}
        className="absolute -left-2 top-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background p-2 md:left-0"
      >
        <Building className="h-5 w-5 text-primary" />
      </m.div>
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{job.role}</CardTitle>
            <CardDescription>
              <span className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                <span className="flex items-center gap-2">
                  {companyLogos[job.company] ? (
                    <Image
                      src={companyLogos[job.company]}
                      alt={`${job.company} logo`}
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain"
                    />
                  ) : (
                    <Building className="h-4 w-4" />
                  )}{' '}
                  {job.company}
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {job.startDate} -{' '}
                  {job.endDate}
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {initial.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <AnimatePresence initial={false}>
              {expanded && (
                <m.div
                  key="more"
                  variants={collapse}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="overflow-hidden"
                >
                  <ul className="space-y-2 pt-2">
                    {remaining.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </m.div>
              )}
            </AnimatePresence>
            {remaining.length > 0 && (
              <Button
                variant="link"
                className="mt-4 px-0"
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? 'Show Less' : 'Show More'}
                <m.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: DURATION.base, ease: EASE_OUT }}
                  className="ml-2 inline-flex"
                >
                  <ChevronDown className="h-4 w-4" />
                </m.span>
              </Button>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

export function Experience() {
  const railRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();

  return (
    <SectionWrapper id="experience">
      <SectionTitle>Experience</SectionTitle>
      <div ref={railRef} className="relative flex flex-col gap-y-12">
        <div className="absolute left-3 top-5 h-[calc(100%-2rem)] w-0.5 bg-border md:left-5" />
        {fine && !reduce && <RailFill target={railRef} />}
        {workExperience.map((job) => (
          <TimelineEntry key={`${job.company}-${job.startDate}`} job={job} />
        ))}
      </div>
    </SectionWrapper>
  );
}
