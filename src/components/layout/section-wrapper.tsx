'use client';

import { useRef } from 'react';
import {
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react';
import { cn } from '@/lib/utils';
import {
  DURATION,
  EASE_OUT,
  exitTransition,
  staggerChildren,
} from '@/lib/motion';
import { useScrollReveal } from '@/components/reveal';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { useAmbientMotion } from '@/lib/motion-tier';
import { useLetterWave, WaveLetter } from '@/components/motion/wave-letters';

type SectionWrapperProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Which side the ambient glow sits on; alternate it down the page. */
  glow?: 'left' | 'right' | 'none';
};

/**
 * Ambient backdrop: a soft glow that drifts slowly (a GPU `transform` loop, paused off screen and
 * on the `lite` motion tier) and, on mouse/trackpad devices, moves a little against the scroll.
 * It's a radial gradient, not a blur filter, so it's cheap to composite on phones.
 */
function SectionGlow({
  side,
  target,
}: {
  side: 'left' | 'right';
  target: React.RefObject<HTMLElement | null>;
}) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ambient = useAmbientMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ['start end', 'end start'],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const still = !fine || !!reduce;
  // The drift loop only runs while the section is (nearly) on screen; restarting it off screen
  // from the rest pose is invisible.
  const inView = useInView(target, { margin: '200px' });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <m.div
        style={{ y: still ? 0 : parallax }}
        className={cn(
          'absolute top-1/4 h-[min(70vw,640px)] w-[min(70vw,640px)]',
          side === 'left' ? '-left-1/4' : '-right-1/4'
        )}
      >
        <m.div
          className={cn(
            'h-full w-full rounded-full',
            side === 'left'
              ? 'bg-[radial-gradient(circle,hsl(var(--glow)/0.10),transparent_65%)]'
              : 'bg-[radial-gradient(circle,hsl(var(--glow-2)/0.09),transparent_65%)]'
          )}
          // Explicit start: animating `transform` from the browser's `none` would grow from scale(0).
          initial={{ transform: 'translate(0px, 0px) scale(1)' }}
          animate={
            inView && ambient
              ? {
                  transform: [
                    'translate(0px, 0px) scale(1)',
                    'translate(40px, -30px) scale(1.08)',
                    'translate(0px, 0px) scale(1)',
                  ],
                }
              : { transform: 'translate(0px, 0px) scale(1)' }
          }
          transition={
            inView ? { duration: 18, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }
          }
        />
      </m.div>
    </div>
  );
}

// Sections below the hero sit above it (relative + background), so the hero content that
// drifts on scroll disappears behind the next section. Each is at least one screen tall below the
// sticky header with its content centred, so a nav jump frames exactly one section.
export function SectionWrapper({
  id,
  children,
  className,
  glow = 'none',
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        'relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden bg-background py-16 md:py-20 short:py-10 shorter:py-5',
        className
      )}
    >
      {glow !== 'none' && <SectionGlow side={glow} target={ref} />}
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

// The accent line draws out from the centre beneath the title.
const accent: Variants = {
  hidden: { scaleX: 0, transition: exitTransition },
  show: {
    scaleX: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT, delay: 0.15 },
  },
};

// The eyebrow ("01 / Experience") fades in with its rule drawing from the left.
const eyebrow: Variants = {
  hidden: { opacity: 0, y: 8, transition: exitTransition },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};
const rule: Variants = {
  hidden: { scaleX: 0, transition: exitTransition },
  show: {
    scaleX: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

const ACCENT_WIDTH = 48;
const BREATHE = { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } as const;

/**
 * The accent line under a title, idling once it has drawn in: it slowly breathes (scaleX and
 * opacity) while a small spot of light travels along it every few seconds. Both are GPU
 * `transform` / opacity loops that only run while the line is on screen, and not at all with
 * reduced motion or on the `lite` motion tier.
 * The reveal (scaleX from 0) lives on the outer span, so it never fights the loop.
 */
function AccentLine({ shown }: { shown: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const ambient = useAmbientMotion();
  const live = shown && inView && ambient;

  return (
    <m.span
      ref={ref}
      aria-hidden
      data-reveal=""
      variants={accent}
      className="relative mt-4 block h-0.5 short:mt-3"
      style={{ width: ACCENT_WIDTH }}
    >
      <m.span
        className="absolute inset-0 rounded-full bg-primary"
        initial={{ transform: 'scaleX(1)', opacity: 1 }}
        animate={
          live
            ? {
                transform: ['scaleX(1)', 'scaleX(1.45)', 'scaleX(1)'],
                opacity: [1, 0.65, 1],
                transition: BREATHE,
              }
            : { transform: 'scaleX(1)', opacity: 1, transition: { duration: DURATION.fast } }
        }
      />
      <m.span
        className="absolute -top-[3px] left-0 size-2 rounded-full bg-[radial-gradient(circle,hsl(var(--foreground)),hsl(var(--primary)/0.6)_45%,transparent_70%)]"
        initial={{ transform: 'translateX(-4px)', opacity: 0 }}
        animate={
          live
            ? {
                transform: ['translateX(-4px)', `translateX(${ACCENT_WIDTH - 4}px)`],
                opacity: [0, 1, 1, 0],
                transition: {
                  duration: 1.8,
                  ease: 'easeInOut',
                  delay: 1.2,
                  repeat: Infinity,
                  repeatDelay: 3.2,
                },
              }
            : { transform: 'translateX(-4px)', opacity: 0, transition: { duration: DURATION.fast } }
        }
      />
    </m.span>
  );
}

/**
 * Section title: an eyebrow with the section number, words rising from behind a mask, then an
 * accent line drawing in. Reversible like the other scroll reveals. On mouse/trackpad devices
 * the letters lift in a gentle wave around the cursor (see `useLetterWave`); each word's mask has
 * headroom above it so the lifted letters aren't clipped. Tighter on short desktop screens.
 */
export function SectionTitle({
  children,
  number,
}: {
  children: string;
  /** Two-digit section number for the eyebrow, e.g. "01". */
  number?: string;
}) {
  const [ref, shown] = useScrollReveal<HTMLHeadingElement>();
  const { ref: waveRef, wave } = useLetterWave<HTMLSpanElement>();
  const words = children.split(' ');
  let letterIndex = 0;

  return (
    <m.h2
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={staggerChildren(0.08)}
      className="mb-12 flex flex-col items-center text-center font-headline text-4xl font-bold tracking-tight md:mb-16 md:text-5xl short:mb-8 short:text-[2.75rem] shorter:mb-6 shorter:text-4xl"
    >
      {number && (
        <m.span
          aria-hidden
          data-reveal=""
          variants={eyebrow}
          className="mb-4 flex items-center gap-3 font-body text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground short:mb-2.5"
        >
          <m.span
            variants={rule}
            className="block h-px w-8 origin-left bg-border"
          />
          {number}
          <m.span
            variants={rule}
            className="block h-px w-8 origin-right bg-border"
          />
        </m.span>
      )}
      <span className="sr-only">{children}</span>
      <span
        ref={waveRef}
        aria-hidden
        className="flex flex-wrap justify-center gap-x-[0.25em]"
      >
        {words.map((w, i) => {
          const last = i === words.length - 1;
          return (
            <span
              key={i}
              className="-mb-[0.15em] -mt-[0.2em] inline-block overflow-hidden pb-[0.15em] pt-[0.2em]"
            >
              <m.span data-reveal="" variants={word} className="inline-block">
                {[...w].map((ch, j) => (
                  <WaveLetter key={j} index={letterIndex++} wave={wave}>
                    {ch}
                  </WaveLetter>
                ))}
                {last && (
                  <WaveLetter index={letterIndex++} wave={wave} className="text-primary-ink">
                    .
                  </WaveLetter>
                )}
              </m.span>
            </span>
          );
        })}
      </span>
      <AccentLine shown={shown} />
    </m.h2>
  );
}
