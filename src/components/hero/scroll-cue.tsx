'use client';

import { useRef } from 'react';
import {
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Transition,
} from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { scrollToSection } from '@/lib/scroll-to-section';
import { cn } from '@/lib/utils';

// One 2.4s cycle: the wheel dot slides down and fades, then the two chevrons cascade after it,
// each on a sine-like ease so the loop flows instead of ticking.
const LOOP: Transition = { duration: 2.4, repeat: Infinity, ease: 'easeInOut' };
const REST = { y: 0, opacity: 1, transition: { duration: 0.3 } };
const CHEVRON_REST = { y: 0, opacity: 0.6, transition: { duration: 0.3 } };

/**
 * A small mouse-and-chevron cue at the foot of the hero that scrolls to the next section. It
 * fades out over the first 160 px of scrolling (opacity only, fine on every device). A fluid loop
 * (wheel dot, then two cascading chevrons) runs while on screen, never with reduced motion. Hidden on short
 * viewports, where it would crowd the content.
 */
export function ScrollCue({
  href = '#experience',
  className,
}: {
  href?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 160], [1, 0]);
  const pointerEvents = useTransform(opacity, (v) => (v < 0.1 ? 'none' : 'auto'));
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref);
  // Not scroll-linked, so it runs on touch screens too; only on screen, never with reduced motion.
  const bob = !reduce && inView;

  return (
    <m.a
      ref={ref}
      href={href}
      onClick={scrollToSection}
      aria-label="Scroll to experience"
      style={{ opacity, pointerEvents }}
      className={cn(
        'group flex flex-col items-center gap-1.5 rounded-full p-2 text-muted-foreground transition-colors hover:text-primary-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [@media(max-height:700px)]:hidden',
        className,
      )}
    >
      <span
        aria-hidden
        className="flex h-9 w-6 justify-center rounded-full border-2 border-current pt-1.5"
      >
        <m.span
          className="h-1.5 w-1 rounded-full bg-current"
          animate={
            bob
              ? {
                  y: [0, 0, 9, 9],
                  opacity: [0, 1, 0.15, 0],
                  transition: { ...LOOP, times: [0, 0.15, 0.7, 1] },
                }
              : REST
          }
        />
      </span>
      <span aria-hidden className="-mt-0.5 flex flex-col items-center">
        {[0, 1].map((i) => (
          <m.span
            key={i}
            className={i === 1 ? '-mt-2.5' : undefined}
            animate={
              bob
                ? {
                    y: [0, 4, 0],
                    opacity: [0.25, 1, 0.25],
                    transition: { ...LOOP, delay: 0.35 + i * 0.18 },
                  }
                : CHEVRON_REST
            }
          >
            <ChevronDown className="h-4 w-4" />
          </m.span>
        ))}
      </span>
    </m.a>
  );
}
