'use client';

import { m } from 'motion/react';
import { ArrowUpRight, Briefcase, FolderGit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SkillGlyph } from '@/components/skills/skill-glyph';
import { DURATION, fadeUp, springSnappy, staggerChildren } from '@/lib/motion';
import { showExperience, showProjects } from '@/lib/events';
import type { Skill } from '@/lib/skills';

const chip =
  'group inline-flex min-h-11 items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-left text-sm font-medium text-foreground/90 ring-offset-background transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function Group({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <m.section variants={fadeUp} className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <Icon aria-hidden className="size-3.5" />
        {title}
      </h3>
      <ul className="flex flex-wrap gap-2">{children}</ul>
    </m.section>
  );
}

/**
 * A skill's detail: logo, name, category and time used, then where it was used. Role chips open
 * that chapter in Experience; project chips filter Projects by this technology. A centred card
 * from sm up and a bottom sheet on phones (the shared Dialog). The cross-link fires once the
 * dialog has closed, so its scroll lock is gone before the other section scrolls.
 */
export function SkillDetail({
  skill,
  open,
  onOpenChange,
}: {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const go = (link: () => void) => {
    onOpenChange(false);
    window.setTimeout(link, DURATION.exit * 1000 + 60);
  };
  const meta = skill
    ? [skill.category, skill.experience && `${skill.experience} in roles`, skill.span]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        {skill && (
          <m.div
            className="grid gap-5"
            initial="hidden"
            animate="show"
            variants={staggerChildren(0.06, 0.08)}
          >
            <DialogHeader className="flex-row items-center gap-4 space-y-0 pr-12 text-left sm:text-left">
              <m.span
                initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1, transition: springSnappy }}
                className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 bg-card"
              >
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 50% 20%, color-mix(in srgb, ${skill.icon.glow} 35%, transparent), transparent 70%)`,
                  }}
                />
                <SkillGlyph icon={skill.icon} className="relative size-7" />
              </m.span>
              <div className="min-w-0">
                <DialogTitle className="font-headline text-2xl leading-tight">
                  {skill.name}
                </DialogTitle>
                <DialogDescription className="mt-1">{meta}</DialogDescription>
              </div>
            </DialogHeader>

            {skill.roles.length > 0 && (
              <Group icon={Briefcase} title="Used at">
                {skill.roles.map((r) => (
                  <li key={r.id}>
                    <m.button
                      type="button"
                      data-role={r.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => go(() => showExperience(r.id))}
                      className={chip}
                    >
                      {r.company}
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {r.span}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary-ink"
                      />
                    </m.button>
                  </li>
                ))}
              </Group>
            )}

            {skill.projects.length > 0 && skill.projectTech && (
              <Group icon={FolderGit2} title="In projects">
                {skill.projects.map((p) => (
                  <li key={p.id} className="max-w-full">
                    <m.button
                      type="button"
                      data-project={p.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => go(() => showProjects({ tech: skill.projectTech }))}
                      className={chip}
                    >
                      <span className="min-w-0">{p.title}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {p.year}
                      </span>
                    </m.button>
                  </li>
                ))}
              </Group>
            )}

            {skill.site && (
              <m.p variants={fadeUp} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                This site is built with it.
              </m.p>
            )}

            {skill.roles.length === 0 && skill.projects.length === 0 && !skill.site && (
              <m.p variants={fadeUp} className="text-[15px] leading-relaxed text-muted-foreground">
                {skill.category === 'Practices'
                  ? 'A practice I bring to every role and project.'
                  : 'From my own work and learning, beyond the roles and projects listed here.'}
              </m.p>
            )}
          </m.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
