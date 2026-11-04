'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import { Reveal } from '@/components/reveal';
import { CountUp } from '@/components/count-up';
import { CategoryChips } from '@/components/skills/category-chips';
import { SkillDetail } from '@/components/skills/skill-detail';
import { SkillGrid, SkillWall, type SkillFilter } from '@/components/skills/skill-wall';
import { DURATION, EASE_IN, EASE_OUT, REVEAL_MARGIN_PAGE_END } from '@/lib/motion';
import { SKILL_CATEGORIES, skillCountLabel, skills } from '@/lib/skills';

const swap = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: DURATION.fast, ease: EASE_IN } },
};

/**
 * Skills: a headline count, category chips, and a logo wall drifting on a tilted plane. A chip
 * lights up its category and dims the rest; a tile opens where that skill was used, with links
 * into Experience and Projects. With reduced motion, or when paused, the wall is a still grid of
 * buttons. The server and first client render always show the wall (reduced motion is only known
 * after mount), so hydration matches.
 */
export function Skills() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<SkillFilter>('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const still = mounted && (!!reduce || paused);
  const skill = skills.find((s) => s.id === selected) ?? null;

  const openSkill = useCallback((id: string) => {
    setSelected(id);
    setOpen(true);
  }, []);

  return (
    <SectionWrapper id="skills" glow="right">
      <SectionTitle number="02">Skills</SectionTitle>

      <Reveal className="flex flex-col items-center gap-3 text-center md:gap-4 short:gap-3">
        <p className="font-headline text-xl font-semibold tracking-tight md:text-2xl short:text-xl">
          <span className="text-primary-ink">
            <CountUp value={skillCountLabel} />
          </span>{' '}
          tools across{' '}
          <span className="text-primary-ink">
            <CountUp value={String(SKILL_CATEGORIES.length)} />
          </span>{' '}
          areas
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-primary/80" />
            Used in a role
          </span>
          <span>Pick a logo to see where I used it</span>
        </p>
      </Reveal>

      <Reveal className="mt-5 md:mt-7 short:mt-5 shorter:mt-4">
        <CategoryChips
          value={filter}
          onChange={setFilter}
          still={still}
          onToggleStill={() => setPaused((p) => !p)}
          showToggle={!(mounted && reduce)}
        />
      </Reveal>

      {/* Last thing in a screen-sized section, so it can sit below the usual trigger line. */}
      <Reveal
        margin={REVEAL_MARGIN_PAGE_END}
        className="mt-3 md:mt-5 short:mt-3 shorter:mt-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          {still ? (
            <m.div key="grid" {...swap}>
              <SkillGrid filter={filter} onOpen={openSkill} />
            </m.div>
          ) : (
            <m.div key="wall" {...swap}>
              <SkillWall filter={filter} held={open} onOpen={openSkill} />
            </m.div>
          )}
        </AnimatePresence>
      </Reveal>

      <SkillDetail skill={skill} open={open} onOpenChange={setOpen} />
    </SectionWrapper>
  );
}
