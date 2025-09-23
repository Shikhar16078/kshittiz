'use client';

import { useState } from 'react';
import { SectionWrapper, SectionTitle } from '../layout/section-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const staticSkills = {
  frontendSkills: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript (ES6+)',
    'Tailwind CSS',
    'HTML5 & CSS3',
    'Framer Motion',
  ],
  backendSkills: [
    'Node.js',
    'Python',
    'Go',
    'Java',
    'REST APIs',
    'gRPC',
    'Microservices',
  ],
  aiSkills: [
    'Genkit',
    'TensorFlow',
    'PyTorch',
    'scikit-learn',
    'OpenAI',
    'LLM Integration',
    'LangChain',
  ],
  databaseSkills: [
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'SQL',
    'NoSQL',
    'Snowflake',
  ],
  generalSkills: [
    'CI/CD',
    'Docker',
    'Git',
    'Agile Methodologies',
    'Problem Solving',
    'Distributed Systems',
    'Cloud Computing (Azure)',
  ],
};

const allSkills = Object.values(staticSkills).flat();
const skills1 = allSkills.slice(0, Math.ceil(allSkills.length / 2));
const skills2 = allSkills.slice(Math.ceil(allSkills.length / 2));

export function Skills() {
  const [showAll, setShowAll] = useState(false);

  const SkillMarquee = () => (
    <div className="group relative w-full overflow-hidden h-24 flex flex-col justify-center gap-2">
      <div className="relative w-full overflow-hidden">
        <div className="animate-scroll-horizontal group-hover:[animation-play-state:paused] flex w-[200%] gap-2">
          {[...skills1, ...skills1].map((skill, index) => (
            <Badge
              key={`${skill}-${index}-1`}
              variant="secondary"
              className="cursor-pointer select-none whitespace-nowrap border-primary/20 bg-primary/10 px-4 py-2 text-base text-primary shadow-sm transition-all hover:bg-primary/20 hover:shadow-md"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="animate-scroll-horizontal-reverse group-hover:[animation-play-state:paused] flex w-[200%] gap-2">
          {[...skills2, ...skills2].map((skill, index) => (
            <Badge
              key={`${skill}-${index}-2`}
              variant="secondary"
              className="cursor-pointer select-none whitespace-nowrap border-primary/20 bg-primary/10 px-4 py-2 text-base text-primary shadow-sm transition-all hover:bg-primary/20 hover:shadow-md"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const AllSkillsGrid = () => (
    <div className="flex flex-wrap justify-center gap-2">
      {allSkills.map((skill, index) => (
        <Badge
          key={`${skill}-${index}`}
          variant="secondary"
          className="cursor-pointer select-none whitespace-nowrap border-primary/20 bg-primary/10 px-4 py-2 text-base text-primary shadow-sm transition-all hover:bg-primary/20 hover:shadow-md"
        >
          {skill}
        </Badge>
      ))}
    </div>
  );

  return (
    <SectionWrapper id="skills">
      <SectionTitle>Skills</SectionTitle>
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4">
        {showAll ? <AllSkillsGrid /> : <SkillMarquee />}
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
    </SectionWrapper>
  );
}