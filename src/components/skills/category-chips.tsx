'use client';

import { LayoutGroup, m } from 'motion/react';
import { LayoutGrid, Play } from 'lucide-react';
import { springSnappy } from '@/lib/motion';
import { SKILL_CATEGORIES, skills } from '@/lib/skills';
import type { SkillFilter } from '@/components/skills/skill-wall';
import { cn } from '@/lib/utils';

const FILTERS: SkillFilter[] = ['All', ...SKILL_CATEGORIES];
const count = (f: SkillFilter) =>
  f === 'All' ? skills.length : skills.filter((s) => s.category === f).length;

const focusRing =
  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * Category filter chips with a pill that slides to the selected one (shared `layoutId`), and a
 * control that pauses the wall into a still grid of buttons (WCAG 2.2.2, and the keyboard route
 * to every tile). On phones the chips scroll sideways in one row; from md up they wrap, centred.
 */
export function CategoryChips({
  value,
  onChange,
  still,
  onToggleStill,
  showToggle,
}: {
  value: SkillFilter;
  onChange: (value: SkillFilter) => void;
  still: boolean;
  onToggleStill: () => void;
  /** False with reduced motion, where the grid is all there is. */
  showToggle: boolean;
}) {
  return (
    <div className="-mx-4 flex items-center gap-2 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:justify-center md:px-0">
      <LayoutGroup id="skills-filter">
        <div
          role="group"
          aria-label="Filter skills by area"
          className="-my-2 flex min-w-0 gap-1.5 overflow-x-auto py-2 [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {FILTERS.map((f) => {
            const active = f === value;
            return (
              <m.button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(f)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors md:pointer-fine:h-10',
                  active
                    ? 'border-transparent text-foreground'
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground',
                  focusRing
                )}
              >
                {active && (
                  <m.span
                    layoutId="skills-filter-pill"
                    aria-hidden
                    transition={springSnappy}
                    className="absolute inset-0 rounded-full border border-primary/45 bg-primary/15"
                  />
                )}
                <span className="relative">{f}</span>
                <span className="relative text-xs tabular-nums opacity-60">{count(f)}</span>
              </m.button>
            );
          })}
        </div>
      </LayoutGroup>
      <m.button
        type="button"
        onClick={onToggleStill}
        aria-pressed={still}
        aria-label={still ? 'Resume the moving logo wall' : 'Pause the logo wall and show all skills as buttons'}
        title={still ? 'Resume' : 'Pause'}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-border hover:text-foreground md:pointer-fine:size-10',
          focusRing,
          !showToggle && 'hidden'
        )}
      >
        {still ? <Play aria-hidden className="size-4" /> : <LayoutGrid aria-hidden className="size-4" />}
      </m.button>
    </div>
  );
}
