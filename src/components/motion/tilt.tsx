'use client';

import { useRef, type ComponentProps } from 'react';
import { m, useReducedMotion, useSpring } from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';

const SPRING = { stiffness: 220, damping: 20, mass: 0.6 };

/**
 * 3D tilt that follows the cursor (rotateX/rotateY on springs, so it eases instead of snapping).
 * Mouse/trackpad only; flat with reduced motion or on touch screens. `max` is in degrees.
 */
export function Tilt({
  max = 8,
  perspective = 900,
  style,
  onPointerMove,
  onPointerLeave,
  onPointerEnter,
  ...props
}: ComponentProps<typeof m.div> & { max?: number; perspective?: number }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const active = fine && !reduce;
  const rect = useRef<DOMRect | null>(null);
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  return (
    <m.div
      {...props}
      style={{ ...style, rotateX, rotateY, transformPerspective: perspective }}
      onPointerEnter={(e) => {
        if (active) rect.current = e.currentTarget.getBoundingClientRect();
        onPointerEnter?.(e);
      }}
      onPointerMove={(e) => {
        const r = rect.current;
        if (active && r) {
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          rotateY.set(px * max * 2);
          rotateX.set(-py * max * 2);
        }
        onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        rect.current = null;
        rotateX.set(0);
        rotateY.set(0);
        onPointerLeave?.(e);
      }}
    />
  );
}
