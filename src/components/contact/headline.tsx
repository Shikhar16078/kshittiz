'use client';

import { m, type Variants } from 'motion/react';
import { useScrollReveal } from '@/components/reveal';
import {
  DURATION,
  EASE_OUT,
  exitTransition,
  staggerChildren,
} from '@/lib/motion';

// Same masked word rise as the section titles, so the headline reads as part of that system.
const word: Variants = {
  hidden: { y: '110%', transition: exitTransition },
  show: { y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

/** Large headline whose words rise from behind their own masks; the last `accent` words are tinted. */
export function Headline({
  text,
  accent = 0,
}: {
  text: string;
  /** How many trailing words get the primary colour. */
  accent?: number;
}) {
  const [ref, shown] = useScrollReveal<HTMLParagraphElement>();
  const words = text.split(' ');

  return (
    <m.p
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={staggerChildren(0.05)}
      className="font-headline text-[clamp(2rem,8.5vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-balance"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex flex-wrap justify-center gap-x-[0.25em]">
        {words.map((w, i) => (
          <span
            key={i}
            className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em]"
          >
            <m.span
              data-reveal=""
              variants={word}
              className={
                i >= words.length - accent
                  ? 'inline-block text-primary'
                  : 'inline-block'
              }
            >
              {w}
            </m.span>
          </span>
        ))}
      </span>
    </m.p>
  );
}
