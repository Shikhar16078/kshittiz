'use client';

import { useState } from 'react';
import { m } from 'motion/react';
import { CalendarDays, ChevronDown, FolderKanban } from 'lucide-react';
import { projects } from '@/lib/data';
import type { Project } from '@/lib/types';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github } from '@/components/icons/brand-icons';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselPagination,
} from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { HoverLift } from '@/components/hover-lift';
import { BadgeRow } from '@/components/badge-row';
import { DURATION, EASE_OUT, springSnappy } from '@/lib/motion';

const COLLAPSED_COUNT = 6;

function ProjectCard({ project }: { project: Project }) {
  return (
    <HoverLift>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            {project.title}
          </CardTitle>
          <div className="flex flex-wrap justify-between gap-2">
            <Badge
              variant="outline"
              className="flex w-fit items-center gap-2 border-primary/50 text-primary"
            >
              <CalendarDays className="h-4 w-4" />
              <span>
                {project.startDate} - {project.endDate}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className="flex w-fit items-center gap-2 border-primary/50 text-primary"
            >
              <FolderKanban className="h-4 w-4" />
              <span>{project.type} Project</span>
            </Badge>
          </div>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="grow">
          <BadgeRow items={project.techStack} />
        </CardContent>
        <CardFooter className="flex gap-4">
          {project.githubUrl && project.githubUrl !== '#' && (
            <Button asChild variant="outline">
              <m.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, transition: springSnappy }}
                whileTap={{ scale: 0.97 }}
              >
                <Github /> Source
              </m.a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </HoverLift>
  );
}

export function Projects() {
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();

  // Phones always get the grid; "Show All" expands it there as well as on desktop.
  const displayed = showAll ? projects : projects.slice(0, COLLAPSED_COUNT);

  return (
    <SectionWrapper id="projects">
      <SectionTitle>Projects</SectionTitle>

      {isMobile || showAll ? (
        <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((project) => (
            <RevealItem key={project.id} className="h-full">
              <ProjectCard project={project} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        // Slides stagger in by on-screen position; slides outside the viewport are skipped.
        <RevealGroup>
          <Carousel
            opts={{ align: 'start' }}
            className="mx-auto w-full max-w-6xl"
          >
            <CarouselContent>
              {projects.map((project) => (
                <CarouselItem
                  key={project.id}
                  className="flex basis-full md:basis-1/2"
                >
                  <RevealItem className="h-full w-full p-1">
                    <ProjectCard project={project} />
                  </RevealItem>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex items-center justify-center gap-4">
              <CarouselPrevious />
              <CarouselPagination />
              <CarouselNext />
            </div>
          </Carousel>
        </RevealGroup>
      )}

      {projects.length > COLLAPSED_COUNT && (
        <Reveal className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
          >
            {showAll ? 'Show Less' : 'Show All'}
            <m.span
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: DURATION.base, ease: EASE_OUT }}
              className="ml-2 inline-flex"
            >
              <ChevronDown className="h-4 w-4" />
            </m.span>
          </Button>
        </Reveal>
      )}
    </SectionWrapper>
  );
}
