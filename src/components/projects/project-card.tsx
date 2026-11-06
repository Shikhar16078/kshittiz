'use client';

import { useState, type MouseEvent } from 'react';
import { ArrowUpRight, CalendarDays, FolderKanban } from 'lucide-react';
import type { Project } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MotionButton } from '@/components/ui/motion-button';
import { Shine } from '@/components/motion/shine';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Github } from '@/components/icons/brand-icons';
import { Tilt } from '@/components/motion/tilt';
import { Spotlight } from '@/components/motion/spotlight';
import { BorderBeam } from '@/components/motion/border-beam';
import { BorderGlow } from '@/components/motion/border-glow';
import { HoverLift } from '@/components/hover-lift';
import { BadgeRow } from '@/components/badge-row';
import { ProjectCover } from '@/components/projects/project-cover';
import { REVEAL_MARGIN_PAGE_END } from '@/lib/motion';

function projectDates({ startDate, endDate }: Project) {
  return startDate === endDate ? startDate : `${startDate} – ${endDate}`;
}

function hasSource(project: Project) {
  return !!project.githubUrl && project.githubUrl !== '#';
}

function Meta({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline">
        <CalendarDays aria-hidden />
        <span className="sr-only">Date: </span>
        {projectDates(project)}
      </Badge>
      <Badge variant="outline">
        <FolderKanban aria-hidden />
        {project.type}
      </Badge>
    </div>
  );
}

/**
 * A project card with generated cover art. The whole card (or its Details button, for keyboard
 * users) opens a dialog with the full description, stack and source link. `onOpenChange` lets
 * the carousel hold autoplay while the dialog is up. The `featured` card (the carousel's current
 * slide) carries the BorderBeam; the rest light their border under the cursor.
 */
export function ProjectCard({
  project,
  index,
  featured = false,
  onOpenChange,
}: {
  project: Project;
  index: number;
  featured?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // React bubbles clicks out of the dialog's portal too; only real clicks on the card count,
    // and its own links and buttons keep their behaviour.
    if (!e.currentTarget.contains(target) || target.closest('a, button')) return;
    change(true);
  };

  const source = hasSource(project);

  return (
    <Dialog open={open} onOpenChange={change}>
      <Tilt max={4} className="h-full w-full">
        <HoverLift>
          <Card
            className="flex h-full cursor-pointer flex-col overflow-hidden"
            onClick={onCardClick}
          >
            <Spotlight />
            <ProjectCover
              project={project}
              index={index}
              className="short:h-24 shorter:h-16"
            />
            {/* Mounted for every card so the beam fades between slides instead of popping. */}
            <BorderBeam active={featured} />
            {!featured && <BorderGlow />}
            <CardHeader className="gap-3 space-y-0 p-5 short:gap-2 short:p-4">
              <Meta project={project} />
              <CardTitle className="font-headline text-lg leading-snug sm:text-xl">
                <h3>{project.title}</h3>
              </CardTitle>
              <CardDescription className="line-clamp-3 text-[15px] leading-relaxed shorter:line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="grow px-5 pb-5 short:px-4 short:pb-4">
              <BadgeRow items={project.techStack} />
            </CardContent>
            <CardFooter className="gap-2 px-5 pb-5 short:px-4 short:pb-4">
              <DialogTrigger asChild>
                <MotionButton variant="secondary" className="h-11 rounded-full px-5">
                  Details
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                  <span className="sr-only">: {project.title}</span>
                </MotionButton>
              </DialogTrigger>
              {source && (
                <MotionButton
                  asChild
                  variant="ghost"
                  className="h-11 rounded-full px-4"
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github /> Source
                    <span className="sr-only"> code for {project.title}</span>
                  </a>
                </MotionButton>
              )}
            </CardFooter>
          </Card>
        </HoverLift>
      </Tilt>

      <DialogContent className="max-h-[85svh] gap-0 overflow-y-auto p-0 sm:max-w-xl sm:rounded-xl sm:p-0">
        <ProjectCover project={project} index={index} className="sm:h-36" />
        <div className="grid gap-5 p-6">
          <DialogHeader className="gap-3 space-y-0 text-left">
            <Meta project={project} />
            <DialogTitle className="font-headline text-2xl leading-tight">
              {project.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="max-w-prose text-[15px] leading-relaxed">
            {project.description}
          </DialogDescription>
          <div className="grid gap-3">
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Tech stack
            </h4>
            <BadgeRow
              items={project.techStack}
              margin={REVEAL_MARGIN_PAGE_END}
            />
          </div>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <MotionButton variant="outline" className="h-11 rounded-full px-5">
                Close
              </MotionButton>
            </DialogClose>
            {source && (
              <MotionButton
                asChild
                className="relative h-11 overflow-hidden rounded-full px-5"
              >
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Shine every={4} delay={0.8} />
                  <Github /> View on GitHub
                </a>
              </MotionButton>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
