
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
  ChevronDown,
  ChevronUp,
  CalendarDays,
  FolderKanban,
} from 'lucide-react';
import { Github } from '@/components/icons/brand-icons';
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
import { AnimatedSection } from '../ui/animated-section';

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
      <CardContent className="grow">
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

  const displayedProjects = showAll ? projects : projects.slice(0, 6);

  return (
    <SectionWrapper id="projects">
      <AnimatedSection>
        <SectionTitle>Projects</SectionTitle>
      </AnimatedSection>

      <div className={cn('relative transition-all duration-500 ease-in-out')}>
        {isMobile || showAll ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayedProjects.map((project, index) => (
              <AnimatedSection key={project.id} delay={index * 100}>
                <ProjectCard project={project} />
              </AnimatedSection>
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
                  className="basis-full md:basis-1/2 flex"
                >
                  <AnimatedSection variant="zoom" className="w-full">
                    <div className="p-1 h-full">
                      <ProjectCard project={project} />
                    </div>
                  </AnimatedSection>
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

      {!isMobile && projects.length > 6 && (
        <div className="mt-8 flex justify-center">
          <AnimatedSection>
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
          </AnimatedSection>
        </div>
      )}
    </SectionWrapper>
  );
}
