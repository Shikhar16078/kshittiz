'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';

// Share of the scroll distance the content drifts down by, and where the fade ends (px).
const DRIFT = 0.3;
const FADE_END = 600;

/**
 * As the page scrolls, the hero content drifts down a little against the scroll and fades, so
 * the next section appears to slide over it. With reduced motion, and on touch screens (where
 * JS-driven movement lags behind native scrolling and jitters), it only fades.
 */
export function HeroScrollAway({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const still = useRef(true);

  const fine = useFinePointer();
  // Read by the transform below on each scroll change, so a ref (no re-subscription needed).
  useEffect(() => {
    still.current = !!reduce || !fine;
  }, [reduce, fine]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) =>
    still.current ? 0 : Math.min(v, 1000) * DRIFT,
  );
  const opacity = useTransform(scrollY, [0, FADE_END], [1, 0.25]);

  return <m.div style={{ y, opacity }}>{children}</m.div>;
}
