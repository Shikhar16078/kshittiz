'use client';

import { m, type Variants } from 'motion/react';
import { useScrollReveal } from '@/components/reveal';
import { useLetterWave, WaveLetter } from '@/components/motion/wave-letters';
import {
  DURATION,
  EASE_OUT,
  REVEAL_MARGIN_PAGE_END,
  exitTransition,
  staggerChildren,
} from '@/lib/motion';

const letter: Variants = {
  hidden: { y: '105%', transition: exitTransition },
  show: { y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

/**
 * The name, set huge and faint across the bottom of the page. Letters rise out of a single mask
 * one after another as the footer reaches the bottom of the screen (it can never pass the usual
 * trigger line, hence the page-end margin). On mouse/trackpad devices the letters ripple up and
 * brighten under the cursor; the mask has headroom above so lifted letters aren't clipped.
 * Decorative: the copyright line carries the name.
 */
export function Wordmark({ text }: { text: string }) {
  const [ref, shown] = useScrollReveal<HTMLDivElement>(REVEAL_MARGIN_PAGE_END);
  const letters = [...text];
  const { ref: waveRef, wave } = useLetterWave<HTMLDivElement>();

  return (
    // Pointer area for the ripple (the masked row below clips, so it can't be the target).
    <div ref={waveRef} aria-hidden>
      <m.div
        ref={ref}
        initial="hidden"
        animate={shown ? 'show' : 'hidden'}
        variants={staggerChildren(0.035)}
        className="-mb-[0.1em] flex select-none justify-center overflow-hidden whitespace-nowrap pb-[0.1em] pt-[0.15em] font-headline text-[clamp(2.25rem,10.5vw,9rem)] font-bold leading-none tracking-tighter text-foreground"
      >
        {letters.map((ch, i) => (
          <m.span key={i} data-reveal="" variants={letter} className="inline-block">
            {/* Rests at 10% (the old faint wordmark) and brightens under the cursor. */}
            <WaveLetter index={i} wave={wave} lift={14} radius={150} dim={[0.1, 0.32]}>
              {ch === ' ' ? '\u00a0' : ch}
            </WaveLetter>
          </m.span>
        ))}
      </m.div>
    </div>
  );
}
