'use client';

import { useEffect, type ReactNode } from 'react';
import { domMax, LazyMotion, MotionConfig } from 'motion/react';
import { startMotionTier } from '@/lib/motion-tier';

// `m` components only (strict) keep the Motion bundle to the features listed here.
// domMax adds layout animations, used by the sliding nav and carousel indicators.
// reducedMotion="user": with the OS setting on, transforms are skipped and only fades remain.
export function MotionProvider({ children }: { children: ReactNode }) {
  // Tells the CSS failsafe in globals.css that JS is running, so it must not force reveals visible.
  useEffect(() => {
    document.documentElement.setAttribute('data-motion-ready', '');
    // Decide how much ambient motion this device gets (see src/lib/motion-tier.ts).
    startMotionTier();
  }, []);

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
