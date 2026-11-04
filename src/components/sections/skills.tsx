'use client';

import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Code,
  Server,
  BrainCircuit,
  Database,
  GitMerge,
  type LucideIcon,
} from 'lucide-react';
import { RevealGroup, RevealItem } from '@/components/reveal';
import { HoverLift } from '@/components/hover-lift';
import { BadgeRow } from '@/components/badge-row';

type SkillCategory = {
  title: string;
  icon: LucideIcon;
  skills: string[];
};

const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend',
    icon: Code,
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript (ES6+)',
      'Tailwind CSS',
      'HTML5 & CSS3',
      'Framer Motion',
    ],
  },
  {
    title: 'Backend',
    icon: Server,
    skills: [
      'Node.js',
      'Python',
      'Go',
      'Java',
      'REST APIs',
      'gRPC',
      'Microservices',
    ],
  },
  {
    title: 'AI/ML',
    icon: BrainCircuit,
    skills: [
      'Genkit',
      'TensorFlow',
      'PyTorch',
      'scikit-learn',
      'OpenAI',
      'LLM Integration',
      'LangChain',
    ],
  },
  {
    title: 'Databases',
    icon: Database,
    skills: ['PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL', 'Snowflake'],
  },
  {
    title: 'General',
    icon: GitMerge,
    skills: [
      'CI/CD',
      'Docker',
      'Git',
      'Agile Methodologies',
      'Problem Solving',
      'Distributed Systems',
      'Cloud Computing (Azure)',
    ],
  },
];

export function Skills() {
  return (
    <SectionWrapper id="skills">
      <SectionTitle>Skills</SectionTitle>
      <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((category) => (
          <RevealItem key={category.title} className="h-full">
            <HoverLift>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <category.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="font-headline text-xl">
                      {category.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <BadgeRow items={category.skills} />
                </CardContent>
              </Card>
            </HoverLift>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionWrapper>
  );
}
