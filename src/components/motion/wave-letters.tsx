'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { cn } from '@/lib/utils';

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 };
const AWAY = -1e5;

export type LetterWave = {
  /** Cursor x in client coordinates, or far away when the pointer isn't over the area. */
  px: MotionValue<number>;
  /** Letter centres in client x, measured on pointerenter (never per frame). */
  centers: React.RefObject<number[]>;
};

/**
 * Tracks the cursor over an area so `WaveLetter`s inside it can lift as it passes, like a ripple
 * running along the text. One motion value for the whole area; each letter derives its own lift
 * from it, so nothing re-renders while the pointer moves. Letter positions are cached on
 * pointerenter. Mouse/trackpad only and off with reduced motion: the letters then stay put.
 */
export function useLetterWave<T extends HTMLElement>() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const active = fine && !reduce;
  const ref = useRef<T>(null);
  const px = useMotionValue(AWAY);
  const centers = useRef<number[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const measure = () => {
      centers.current = Array.from(
        el.querySelectorAll<HTMLElement>('[data-wave]'),
        (n) => {
          const r = n.getBoundingClientRect();
          return r.left + r.width / 2;
        },
      );
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      measure();
      px.set(e.clientX);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') px.set(e.clientX);
    };
    const leave = () => px.set(AWAY);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      px.set(AWAY);
    };
  }, [active, px]);

  return { ref, wave: { px, centers } satisfies LetterWave };
}

/**
 * One letter of a `useLetterWave` area. It rises by up to `lift` px when the cursor is right
 * above it, falling off smoothly (a raised cosine) over `radius` px either side. With `dim`, its
 * opacity also goes from dim[0] at rest to dim[1] under the cursor.
 */
export function WaveLetter({
  children,
  index,
  wave,
  lift = 6,
  radius = 70,
  dim,
  className,
}: {
  children: ReactNode;
  index: number;
  wave: LetterWave;
  lift?: number;
  radius?: number;
  dim?: [number, number];
  className?: string;
}) {
  const near = useTransform(wave.px, (v) => {
    const c = wave.centers.current[index];
    if (c === undefined) return 0;
    const d = Math.abs(v - c);
    return d >= radius ? 0 : (1 + Math.cos((Math.PI * d) / radius)) / 2;
  });
  const p = useSpring(near, SPRING);
  const y = useTransform(p, (v) => -lift * v);
  const opacity = useTransform(p, [0, 1], dim ?? [1, 1]);

  return (
    <m.span
      data-wave=""
      className={cn('inline-block', className)}
      style={dim ? { y, opacity } : { y }}
    >
      {children}
    </m.span>
  );
}
