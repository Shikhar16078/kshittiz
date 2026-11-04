'use client';

import { useRef, type ReactNode } from 'react';
import { m, useReducedMotion, useSpring } from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { cn } from '@/lib/utils';

const SPRING = { stiffness: 320, damping: 22, mass: 0.4 };

/**
 * Pulls its child toward the cursor while hovered and springs back on leave.
 * Mouse/trackpad only; static with reduced motion or on touch screens.
 * `strength` is the share of the cursor's offset from the centre that the child follows.
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const active = fine && !reduce;
  const rect = useRef<DOMRect | null>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  return (
    <m.div
      className={cn('inline-flex', className)}
      style={{ x, y }}
      onPointerEnter={(e) => {
        if (active) rect.current = e.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(e) => {
        const r = rect.current;
        if (!active || !r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        rect.current = null;
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </m.div>
  );
}
