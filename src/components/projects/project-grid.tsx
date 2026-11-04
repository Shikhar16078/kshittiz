'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { X } from 'lucide-react';
import type { Project } from '@/lib/types';
import type { ProjectsFilterDetail } from '@/lib/events';
import { ProjectCard } from '@/components/projects/project-card';
import { Shine } from '@/components/motion/shine';
import { MotionButton } from '@/components/ui/motion-button';
import {
  canonical,
  commonTech,
  matchesFilter,
  techLabel,
} from '@/components/projects/filter';
import {
  DURATION,
  EASE_IN,
  EASE_OUT,
  enterTransition,
  springSnappy,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

type Category = 'All' | Project['type'];
const CATEGORIES: Category[] = ['All', 'Academic', 'Personal'];
/** How many of the most used technologies get a quick filter chip. */
const TECH_CHIPS = 8;

const focusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background';

const pop = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: springSnappy },
  exit: { opacity: 0, scale: 0.9, transition: { duration: DURATION.fast, ease: EASE_IN } },
};

/** A segmented chip group; the active fill slides between options (one layoutId per group). */
function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  count,
  layoutId,
  className,
}: {
  className?: string;
  label: string;
  options: T[];
  value: T | null;
  onChange: (next: T) => void;
  count: (option: T) => number;
  layoutId: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  // On narrow screens the row scrolls; keep the active chip in view (e.g. after a filter jump).
  useEffect(() => {
    const el = scroller.current;
    const chip = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !chip || el.scrollWidth <= el.clientWidth) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({
      left: chip.offsetLeft - (el.clientWidth - chip.offsetWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [value]);

  return (
    // Scrolls sideways on narrow screens rather than wrapping or overflowing the page.
    <div
      ref={scroller}
      className={cn(
        '-mx-4 self-stretch overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      <div
        role="group"
        aria-label={label}
        className="mx-auto flex w-max gap-1 rounded-full border bg-card/60 p-1"
      >
        {options.map((option) => {
          const active = option === value;
          const n = count(option);
          return (
            <m.button
              key={option}
              type="button"
              whileTap={{ scale: 0.95 }}
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                'relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors',
                focusRing,
                active
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <m.span
                  layoutId={layoutId}
                  transition={springSnappy}
                  className="absolute inset-0 overflow-hidden rounded-full bg-primary"
                  style={{ borderRadius: 999 }}
                >
                  <Shine every={4.5} delay={0.8} />
                </m.span>
              )}
              <span className="relative">{option}</span>
              <span
                className={cn(
                  'relative rounded-full px-1.5 py-0.5 text-xs tabular-nums leading-none transition-colors',
                  active
                    ? 'bg-primary-foreground/20'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {n}
              </span>
            </m.button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * All projects in a grid, filtered by category chips, technology chips and an optional start-year
 * range (set from Education). External filters (from the `projects:filter` event or the tech
 * chips) show as clearable "Filtered by" chips. The grid reflows with layout animations: leaving
 * cards pop out of the flow at once (popLayout) so the rest glide into their new places.
 */
export function ProjectGrid({
  projects,
  filter,
  onFilterChange,
}: {
  projects: Project[];
  filter: ProjectsFilterDetail;
  onFilterChange: (next: ProjectsFilterDetail) => void;
}) {
  const [category, setCategory] = useState<Category>('All');
  const techs = useMemo(
    () => commonTech(projects).slice(0, TECH_CHIPS).map((t) => t.name),
    [projects]
  );
  // An external tech that isn't one of the quick chips still gets the "Filtered by" chip.
  const activeTech =
    (filter.tech &&
      techs.find((t) => canonical(t) === canonical(filter.tech ?? ''))) ||
    null;

  const external = projects.filter((p) => matchesFilter(p, filter));
  const shown =
    category === 'All' ? external : external.filter((p) => p.type === category);
  const countCategory = (c: Category) =>
    c === 'All' ? external.length : external.filter((p) => p.type === c).length;
  const countTech = (tech: string) =>
    projects.filter((p) => matchesFilter(p, { ...filter, tech })).length;

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filter.tech) {
    chips.push({
      key: 'tech',
      label: techLabel(projects, filter.tech),
      clear: () => onFilterChange({ ...filter, tech: undefined }),
    });
  }
  if (filter.years) {
    const [from, to] = filter.years;
    chips.push({
      key: 'years',
      label: from === to ? `${from}` : `${from}–${to}`,
      clear: () => onFilterChange({ ...filter, years: undefined }),
    });
  }

  const description = [
    category === 'All' ? '' : category.toLowerCase(),
    shown.length === 1 ? 'project' : 'projects',
    filter.tech ? `using ${techLabel(projects, filter.tech)}` : '',
    filter.years ? `started ${filter.years[0]} to ${filter.years[1]}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LayoutGroup id="project-grid">
      {/* One toolbar row on desktop: the type switch, then the tech chips scrolling sideways
          with faded edges, so the filters take a single line above the grid. */}
      <div className="mb-6 flex flex-col items-center gap-3 short:mb-4 lg:flex-row lg:gap-4">
        <ChipGroup
          className="lg:mx-0 lg:shrink-0 lg:self-auto lg:px-0"
          label="Filter projects by category"
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
          count={countCategory}
          layoutId="project-filter-chip"
        />
        <ChipGroup
          className="lg:mx-0 lg:min-w-0 lg:flex-1 lg:px-6 lg:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
          label="Filter projects by technology"
          options={techs}
          value={activeTech}
          onChange={(tech) =>
            onFilterChange({ ...filter, tech: activeTech === tech ? undefined : tech })
          }
          count={countTech}
          layoutId="project-tech-chip"
        />
        <AnimatePresence initial={false}>
          {chips.length > 0 && (
            <m.div
              key="active"
              {...pop}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <span className="text-sm text-muted-foreground">Filtered by:</span>
              <AnimatePresence mode="popLayout" initial={false}>
                {chips.map((c) => (
                  <m.button
                    key={c.key}
                    layout
                    {...pop}
                    whileHover={{ y: -2, transition: springSnappy }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={c.clear}
                    aria-label={`Clear filter: ${c.label}`}
                    className={cn(
                      'inline-flex h-11 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 pl-4 pr-3 text-sm font-medium text-primary-ink transition-colors hover:bg-primary/20',
                      focusRing
                    )}
                  >
                    {c.label}
                    <X aria-hidden className="h-4 w-4" />
                  </m.button>
                ))}
              </AnimatePresence>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {shown.length} {description}
      </p>

      <m.ul className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((project) => (
            <m.li
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, transition: enterTransition }}
              exit={{
                opacity: 0,
                scale: 0.94,
                transition: { duration: DURATION.fast, ease: EASE_IN },
              }}
              transition={{
                layout: { duration: DURATION.base, ease: EASE_OUT },
              }}
              className="h-full"
            >
              <ProjectCard project={project} index={projects.indexOf(project)} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      <AnimatePresence initial={false}>
        {shown.length === 0 && (
          <m.div
            key="empty"
            {...pop}
            className="flex flex-col items-center gap-3 py-10 text-center"
          >
            <p className="max-w-prose text-[15px] text-muted-foreground">
              No projects match these filters yet.
            </p>
            <MotionButton
              variant="outline"
              className="h-11 rounded-full px-5"
              onClick={() => {
                setCategory('All');
                onFilterChange({});
              }}
            >
              Clear filters
            </MotionButton>
          </m.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
