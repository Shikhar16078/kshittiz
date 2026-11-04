'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, m } from 'motion/react';
import {
  CalendarDays,
  CheckCircle,
  Award,
  BookOpen,
  FileText,
} from 'lucide-react';
import { education } from '@/lib/data';
import type { Education as EducationEntry } from '@/lib/types';
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
import { Separator } from '@/components/ui/separator';
import { RevealGroup, RevealItem } from '@/components/reveal';
import { HoverLift } from '@/components/hover-lift';
import { CountUp } from '@/components/count-up';
import {
  cappedInterval,
  DURATION,
  EASE_IN,
  EASE_OUT,
  fadeUp,
  staggerChildren,
} from '@/lib/motion';

const educationLogos: Record<string, string> = {
  'North Carolina State University': '/images/ncstate.jpg',
  'Guru Gobind Singh Indraprastha University': '/images/ggsipu.jpg',
};

// The description and the course list swap in place: the old one fades up and out, then the
// new one rises in (courses cascade in one after another).
const swap = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: DURATION.fast, ease: EASE_IN },
  },
};

function EducationCard({ edu }: { edu: EducationEntry }) {
  const [showCourses, setShowCourses] = useState(false);

  return (
    <HoverLift>
      <Card className="flex h-full flex-col">
        <CardHeader className="min-h-[160px]">
          <div className="flex items-start gap-4">
            <Image
              src={educationLogos[edu.institution]}
              alt={`${edu.institution} logo`}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-md object-cover"
            />
            <div className="grow">
              <CardTitle className="font-headline text-xl">
                {edu.degree}
              </CardTitle>
              <CardDescription className="pt-1">
                {edu.institution}
                <span className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </span>
                  {edu.gpa && (
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <CountUp value={edu.gpa} />
                    </span>
                  )}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex grow flex-col">
          <div className="relative grow">
            <Separator className="my-4" />
            <AnimatePresence mode="wait" initial={false}>
              {showCourses ? (
                <m.div key="courses" {...swap}>
                  <h3 className="mb-2 font-headline text-lg font-bold text-primary">
                    Relevant Courses
                  </h3>
                  <m.ul
                    initial="hidden"
                    animate="show"
                    variants={staggerChildren(
                      cappedInterval(edu.courses.length),
                    )}
                    className="grid grid-cols-1 gap-2 pt-2"
                  >
                    {edu.courses.map((course) => (
                      <m.li
                        key={course}
                        variants={fadeUp}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{course}</span>
                      </m.li>
                    ))}
                  </m.ul>
                </m.div>
              ) : (
                <m.p
                  key="description"
                  {...swap}
                  className="mt-4 text-muted-foreground"
                >
                  {edu.description}
                </m.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <Button
              variant="link"
              onClick={() => setShowCourses((v) => !v)}
              aria-expanded={showCourses}
              className="px-0 text-sm"
            >
              {showCourses ? (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Show Description
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Relevant Courses
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </HoverLift>
  );
}

export function Education() {
  return (
    <SectionWrapper id="education">
      <SectionTitle>Education</SectionTitle>
      <RevealGroup className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        {education.map((edu) => (
          <RevealItem key={edu.institution} className="h-full">
            <EducationCard edu={edu} />
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionWrapper>
  );
}
