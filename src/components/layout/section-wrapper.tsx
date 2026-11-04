'use client';

import { m, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  DURATION,
  EASE_OUT,
  exitTransition,
  staggerChildren,
} from '@/lib/motion';
import { useScrollReveal } from '@/components/reveal';

type SectionWrapperProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

// Sections below the hero sit above it (relative + background), so the hero content
// that drifts on scroll (hero.tsx) disappears behind the next section.
export function SectionWrapper({
  id,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative flex min-h-svh flex-col justify-center bg-background py-16 md:py-24',
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

// Each word rises from behind its own mask, one after another.
const word: Variants = {
  hidden: { y: '110%', transition: exitTransition },
  show: { y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

// Then an accent line draws out from the centre beneath the title.
const accent: Variants = {
  hidden: { scaleX: 0, transition: exitTransition },
  show: {
    scaleX: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT, delay: 0.15 },
  },
};

/** Section title: words rise from behind a mask, then an accent line draws in. Reversible. */
export function SectionTitle({ children }: { children: string }) {
  const [ref, shown] = useScrollReveal<HTMLHeadingElement>();
  const words = children.split(' ');

  return (
    <m.h2
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={staggerChildren(0.08)}
      className="mb-12 text-center font-headline text-3xl font-bold md:text-4xl"
    >
      <span className="sr-only">{children}</span>
      <span
        aria-hidden
        className="flex flex-wrap justify-center gap-x-[0.25em]"
      >
        {words.map((w, i) => (
          <span
            key={i}
            className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em]"
          >
            <m.span data-reveal="" variants={word} className="inline-block">
              {w}
              {i === words.length - 1 && (
                <span className="text-primary">.</span>
              )}
            </m.span>
          </span>
        ))}
      </span>
      <m.span
        aria-hidden
        data-reveal=""
        variants={accent}
        className="mx-auto mt-3 block h-0.5 w-12 rounded-full bg-primary"
      />
    </m.h2>
  );
}
