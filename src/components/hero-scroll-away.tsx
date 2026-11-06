'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';

// Share of the scroll distance the content drifts down by, and where the fade ends (px).
const DRIFT = 0.3;
const FADE_END = 600;

/**
 * As the page scrolls, the hero content drifts down a little against the scroll and fades, so
 * the next section appears to slide over it. With reduced motion it only fades. On touch screens
 * it does neither: the hero there is taller than the screen, so a fade dimmed it while it was
 * still being read, and JS-driven movement lags behind native scrolling.
 */
export function HeroScrollAway({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  // Read by the transforms below on each scroll change, so refs (no re-subscription needed).
  // Both start "off", matching the server render (no movement, full opacity).
  const still = useRef(true);
  const touch = useRef(true);
  useEffect(() => {
    still.current = !!reduce || !fine;
    touch.current = !fine;
  }, [reduce, fine]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) =>
    still.current ? 0 : Math.min(v, 1000) * DRIFT,
  );
  const opacity = useTransform(scrollY, (v) =>
    touch.current ? 1 : 1 - 0.75 * Math.min(Math.max(v / FADE_END, 0), 1),
  );

  return <m.div style={{ y, opacity }}>{children}</m.div>;
}
