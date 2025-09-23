
'use client';

import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  Server,
  BrainCircuit,
  Database,
  GitMerge,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedSection } from '../ui/animated-section';

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
    skills: [
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'SQL',
      'NoSQL',
      'Snowflake',
    ],
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
      <AnimatedSection>
        <SectionTitle>My Expertise</SectionTitle>
      </AnimatedSection>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((category, index) => (
          <AnimatedSection key={category.title} delay={index * 100}>
            <Card className="flex flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1 h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <category.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline text-xl">
                    {category.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}
