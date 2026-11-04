
'use client';

import { useState } from 'react';
import { education } from '@/lib/data';
import { SectionWrapper, SectionTitle } from '../layout/section-wrapper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  CalendarDays,
  CheckCircle,
  Award,
  BookOpen,
  FileText,
} from 'lucide-react';
import Image from 'next/image';
import { AnimatedSection } from '../ui/animated-section';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Separator } from '../ui/separator';

const educationLogos: { [key: string]: string } = {
  'North Carolina State University': '/images/ncstate.jpg',
  'Guru Gobind Singh Indraprastha University': '/images/ggsipu.jpg',
};

export function Education() {
  const [showCourses, setShowCourses] = useState<{ [key: number]: boolean }>(
    {}
  );

  const toggleView = (index: number) => {
    setShowCourses((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <SectionWrapper id="education">
      <AnimatedSection>
        <SectionTitle>Education</SectionTitle>
      </AnimatedSection>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-start">
        {education.map((edu, index) => {
          const isCoursesVisible = showCourses[index];
          return (
            <AnimatedSection key={index} delay={index * 100}>
              <Card className="flex h-full flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1">
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
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              {edu.startDate} - {edu.endDate}
                            </span>
                          </span>
                          {edu.gpa && (
                            <span className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              <span>{edu.gpa}</span>
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex grow flex-col">
                  <div className="relative grow">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isCoursesVisible ? 'courses' : 'description'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        {isCoursesVisible ? (
                          <div>
                            <Separator className="my-4" />
                            <h3 className="mb-2 font-headline text-lg font-bold text-primary">
                              Relevant Courses
                            </h3>
                            <ul className="grid grid-cols-1 gap-2 pt-2">
                              {edu.courses.map((course) => (
                                <li
                                  key={course}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-primary" />
                                  <span className="text-muted-foreground">
                                    {course}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div>
                            <Separator className="my-4" />
                            <p className="mt-4 grow text-muted-foreground">
                              {edu.description}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="mt-auto pt-4">
                    <Separator className="mb-4" />
                    <Button
                      variant="link"
                      onClick={() => toggleView(index)}
                      className="px-0 text-sm"
                    >
                      {isCoursesVisible ? (
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
            </AnimatedSection>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
