'use client';

import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useSpring } from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';

const SIZE = 360;
const SPRING = { stiffness: 500, damping: 40, mass: 0.3 };

/**
 * A soft glow that follows the cursor inside its parent card. Place it as the first child of a
 * `relative overflow-hidden` element. It moves with transforms only (no repainting gradients per
 * frame). Mouse/trackpad only; nothing is rendered on touch screens or with reduced motion.
 */
export function Spotlight({ color = 'var(--glow)' }: { color?: string }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent || !fine || reduce) return;
    let rect = parent.getBoundingClientRect();
    const enter = () => {
      rect = parent.getBoundingClientRect();
      opacity.set(1);
    };
    const move = (e: PointerEvent) => {
      x.set(e.clientX - rect.left - SIZE / 2);
      y.set(e.clientY - rect.top - SIZE / 2);
    };
    const leave = () => opacity.set(0);
    parent.addEventListener('pointerenter', enter);
    parent.addEventListener('pointermove', move, { passive: true });
    parent.addEventListener('pointerleave', leave);
    return () => {
      parent.removeEventListener('pointerenter', enter);
      parent.removeEventListener('pointermove', move);
      parent.removeEventListener('pointerleave', leave);
    };
  }, [fine, reduce, x, y, opacity]);

  if (!fine || reduce) return <div ref={ref} hidden />;

  return (
    <m.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 rounded-full"
      style={{
        x,
        y,
        opacity,
        width: SIZE,
        height: SIZE,
        background: `radial-gradient(circle, hsl(${color} / 0.16), transparent 65%)`,
      }}
    />
  );
}
