'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { projects } from '@/lib/data';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import { MotionButton } from '@/components/ui/motion-button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselPagination,
  useCarousel,
} from '@/components/ui/carousel';
import type { Project } from '@/lib/types';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectGrid } from '@/components/projects/project-grid';
import { DURATION, EASE_IN, EASE_OUT, REVEAL_MARGIN_PAGE_END } from '@/lib/motion';
import { PROJECTS_FILTER, type ProjectsFilterDetail } from '@/lib/events';

const AUTOPLAY_MS = 5000;
/** The sticky header's height: a filter jump lands the section just below it. */
const HEADER_PX = 64;

/**
 * The slides, inside the Carousel so they can read which one is current: that one (centred, as
 * the carousel aligns to the centre) carries the BorderBeam. Re-renders only when the slide
 * changes, never while it moves.
 */
function Slides({
  projects,
  onOpenChange,
}: {
  projects: Project[];
  onOpenChange: (open: boolean) => void;
}) {
  const { selectedIndex } = useCarousel();
  return (
    <CarouselContent className="py-2">
      {projects.map((project, index) => (
        <CarouselItem
          key={project.id}
          className="flex basis-[88%] sm:basis-[70%] md:basis-1/2 lg:basis-1/3"
          aria-label={`${index + 1} of ${projects.length}`}
        >
          <RevealItem className="h-full w-full">
            <ProjectCard
              project={project}
              index={index}
              featured={index === selectedIndex}
              onOpenChange={onOpenChange}
            />
          </RevealItem>
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}

const view = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
  exit: { opacity: 0, y: 12, transition: { duration: DURATION.fast, ease: EASE_IN } },
};

export function Projects() {
  const [showAll, setShowAll] = useState(false);
  // Tech / year filter set from other sections (or the grid's tech chips).
  const [filter, setFilter] = useState<ProjectsFilterDetail>({});
  // Open dialogs (one per card, so focus returns to the card that opened it) hold autoplay.
  const [openDialogs, setOpenDialogs] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Other sections (Skills, Education) ask for a filtered grid: switch to it, apply the filter
  // and bring the section into view under the header.
  useEffect(() => {
    const onFilter = (e: Event) => {
      const { tech, years } = (e as CustomEvent<ProjectsFilterDetail>).detail ?? {};
      setFilter({ tech: tech || undefined, years });
      setShowAll(true);
      const section = document.getElementById('projects');
      if (!section) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: section.getBoundingClientRect().top + window.scrollY - HEADER_PX,
        behavior: reduced ? 'auto' : 'smooth',
      });
    };
    window.addEventListener(PROJECTS_FILTER, onFilter);
    return () => window.removeEventListener(PROJECTS_FILTER, onFilter);
  }, []);

  const toggle = () => {
    const next = !showAll;
    setShowAll(next);
    if (!next) setFilter({});
    // Collapsing a long grid from below would leave the viewer far down the page.
    const top = anchor.current?.getBoundingClientRect().top ?? 0;
    if (!next && top < 0) {
      anchor.current?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <SectionWrapper id="projects" glow="left">
      <SectionTitle number="03">Projects</SectionTitle>

      <div ref={anchor} className="scroll-mt-24">
        <AnimatePresence mode="wait" initial={false}>
          {showAll ? (
            <m.div key="grid" {...view}>
              <ProjectGrid
                projects={projects}
                filter={filter}
                onFilterChange={setFilter}
              />
            </m.div>
          ) : (
            <m.div key="carousel" {...view}>
              {/* Slides stagger in by on-screen position; slides outside the viewport are skipped. */}
              <RevealGroup>
                <Carousel
                  opts={{ align: 'center', loop: true }}
                  autoplay={AUTOPLAY_MS}
                  paused={openDialogs > 0}
                  depth
                  aria-label="Projects"
                  className="w-full"
                >
                  <Slides
                    projects={projects}
                    onOpenChange={(open) =>
                      setOpenDialogs((n) => Math.max(0, n + (open ? 1 : -1)))
                    }
                  />
                  <div className="mt-8 flex items-center justify-center gap-3 short:mt-3">
                    <CarouselPrevious />
                    <CarouselPagination />
                    <CarouselNext />
                  </div>
                </Carousel>
              </RevealGroup>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Last thing in a screen-sized section, so it can sit below the usual trigger line. */}
      <Reveal
        margin={REVEAL_MARGIN_PAGE_END}
        className="mt-8 flex justify-center short:mt-1"
      >
        <MotionButton
          variant="ghost"
          className="h-11 rounded-full px-5"
          onClick={toggle}
          aria-expanded={showAll}
        >
          {showAll ? 'Show Less' : `Show All ${projects.length}`}
          <m.span
            animate={{ rotate: showAll ? 180 : 0 }}
            transition={{ duration: DURATION.base, ease: EASE_OUT }}
            className="inline-flex"
          >
            <ChevronDown className="h-4 w-4" />
          </m.span>
        </MotionButton>
      </Reveal>
    </SectionWrapper>
  );
}
