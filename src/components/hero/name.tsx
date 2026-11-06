'use client';

import { useRef } from 'react';
import { m, useInView, useReducedMotion, type Variants } from 'motion/react';
import { DURATION, EASE_OUT, staggerChildren } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useAmbientMotion } from '@/lib/motion-tier';

// The name is the largest text on screen, so it never starts at opacity 0 and is never masked
// (either would delay Largest Contentful Paint): the server renders it fully visible, a little
// low, and the letters only settle.
const letter: Variants = {
  hidden: { y: '0.35em' },
  show: { y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

/** When the shimmer starts (s): after the letters have settled. */
const SHIMMER_AT = 1.05;
const SHIMMER_GAP = 0.045;

/**
 * The hero name, split into letters that settle one after another. Once settled, a highlight
 * runs through the letters once (a glowing copy of each letter fading in and out over it, so only
 * opacity animates), then a soft glow behind the name breathes slowly while it's on screen.
 * Must sit inside a parent driving the `hidden` → `show` variants.
 */
export function HeroName({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const ambient = useAmbientMotion();
  const words = name.split(' ');
  const letters = words.join('').length;
  // Shimmer is opacity-only, which reduced motion doesn't suppress, so gate it explicitly.
  const shimmer = reduce === false;
  let n = 0;

  return (
    <m.h1
      ref={ref}
      variants={staggerChildren(0.03, 0.05)}
      className="relative font-headline text-[length:clamp(2.5rem,min(7vw+0.5rem,11svh),5.75rem)] font-bold leading-[0.95] tracking-tight"
    >
      {/* Idle glow: a static gradient whose opacity breathes (never a filter or text-shadow). */}
      <m.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-[12%] -inset-y-[45%] -z-10 bg-[radial-gradient(ellipse_closest-side,hsl(var(--glow)/0.16),transparent)]"
        initial={{ opacity: 0.3 }}
        animate={
          inView && ambient
            ? {
                opacity: [0.3, 0.85, 0.3],
                transition: {
                  duration: 6,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: SHIMMER_AT + letters * SHIMMER_GAP,
                },
              }
            : { opacity: 0.3 }
        }
      />
      <span className="sr-only">{name}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <span key={w}>
            <span
              className={cn(
                'inline-block whitespace-nowrap',
                w === words.length - 1 ? 'text-primary-ink' : 'text-foreground',
              )}
            >
              {[...word].map((char) => {
                const i = n++;
                return (
                  <m.span key={i} variants={letter} className="relative inline-block">
                    {char}
                    <m.span
                      className="pointer-events-none absolute inset-0 text-[hsl(var(--glow))] [text-shadow:0_0_0.35em_hsl(var(--glow)/0.55)]"
                      initial={{ opacity: 0 }}
                      animate={
                        shimmer
                          ? {
                              opacity: [0, 1, 0],
                              transition: {
                                duration: 0.7,
                                ease: 'easeInOut',
                                delay: SHIMMER_AT + i * SHIMMER_GAP,
                              },
                            }
                          : { opacity: 0 }
                      }
                    >
                      {char}
                    </m.span>
                  </m.span>
                );
              })}
            </span>
            {w < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </m.h1>
  );
}
