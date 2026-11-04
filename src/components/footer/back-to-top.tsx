'use client';

import { m, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { springSnappy } from '@/lib/motion';

const RADIUS = 22;

/**
 * Back-to-top button ringed by the page's scroll progress. The ring is driven by a motion value
 * (no React renders while scrolling) through a spring, so it trails the scroll smoothly.
 */
export function BackToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  const reduce = useReducedMotion();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <m.button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.92 }}
      className="group relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:text-primary-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="2"
          className="stroke-border"
        />
        <m.circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-primary-ink"
          style={{ pathLength: progress }}
        />
      </svg>
      <m.span
        variants={{ rest: { y: 0 }, hover: { y: -3 } }}
        transition={springSnappy}
        className="inline-flex"
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </m.span>
    </m.button>
  );
}
