'use client';

import { education } from '@/lib/data';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import { RevealGroup, RevealItem } from '@/components/reveal';
import { DegreeCard } from '@/components/education/degree-card';

export function Education() {
  return (
    <SectionWrapper id="education" glow="right">
      <SectionTitle number="04">Education</SectionTitle>
      <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {education.map((edu) => (
          <RevealItem key={edu.institution} className="h-full">
            <DegreeCard edu={edu} />
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionWrapper>
  );
}
