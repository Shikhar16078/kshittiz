import { cn } from '@/lib/utils';
import React from 'react';

type SectionWrapperProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionWrapper({
  id,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24 min-h-screen flex flex-col justify-center',
        className
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-12 text-center font-headline text-3xl font-bold md:text-4xl">
      {children}
      <span className="text-primary">.</span>
    </h2>
  );
}
