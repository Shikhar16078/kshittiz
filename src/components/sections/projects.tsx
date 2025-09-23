'use client';

import { useState } from 'react';
import { projects } from '@/lib/data';
import { SectionWrapper, SectionTitle } from '../layout/section-wrapper';
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
import {
  Github,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  FolderKanban,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselPagination,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function Projects() {
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();

  const ProjectCard = ({ project }: { project: (typeof projects)[0] }) => (
    <Card className="flex h-full flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
        <div className="flex flex-wrap gap-2 justify-between">
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
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-4">
        {project.githubUrl && project.githubUrl !== '#' && (
          <Button asChild variant="outline">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github /> Source
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <SectionWrapper id="projects">
      <SectionTitle>Projects</SectionTitle>

      <div className={cn('relative transition-all duration-500 ease-in-out')}>
        {isMobile || showAll ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {projects.map((project) => (
                <CarouselItem
                  key={project.id}
                  className="basis-full md:basis-1/2"
                >
                  <div className="p-1 h-full">
                    <ProjectCard project={project} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex justify-center items-center gap-4">
              <CarouselPrevious />
              <CarouselPagination />
              <CarouselNext />
            </div>
          </Carousel>
        )}
      </div>

      {!isMobile && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            className="group"
          >
            {showAll ? 'Show Less' : 'Show All'}
            {showAll ? (
              <ChevronUp className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
            )}
          </Button>
        </div>
      )}
    </SectionWrapper>
  );
}
