'use client';

import { useEffect, useRef } from 'react';
import { cancelFrame, frame, type FrameData } from 'motion/react';

/**
 * Runs `onFrame(delta)` on Motion's frame loop while `active`, and unregisters completely when
 * not (unlike `useAnimationFrame`, which keeps a callback scheduled every frame forever). Gate
 * `active` on being on screen and on reduced motion so idle loops cost nothing.
 */
export function useFrameLoop(onFrame: (delta: number) => void, active: boolean) {
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    if (!active) return;
    const step = ({ delta }: FrameData) => callback.current(delta);
    frame.update(step, true);
    return () => cancelFrame(step);
  }, [active]);
}
