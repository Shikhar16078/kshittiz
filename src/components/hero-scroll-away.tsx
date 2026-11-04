'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';

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

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => {
      still.current = !!reduce || !fine.matches;
    };
    update();
    fine.addEventListener('change', update);
    return () => fine.removeEventListener('change', update);
  }, [reduce]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) =>
    still.current ? 0 : Math.min(v, 1000) * DRIFT,
  );
  const opacity = useTransform(scrollY, [0, FADE_END], [1, 0.25]);

  return <m.div style={{ y, opacity }}>{children}</m.div>;
}
