'use client';

import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useSpring } from 'motion/react';
import { useFinePointer } from '@/hooks/use-fine-pointer';

const SPRING = { stiffness: 500, damping: 40, mass: 0.3 };

/**
 * Hover border light: a soft spot of the accent colour that follows the cursor around its
 * parent's border while hovered. The lighter sibling of `BorderBeam` for cards that aren't
 * featured. Like BorderBeam, the ring is a static mask (border-box minus content-box) and only
 * the spot inside it moves, by transform. Place inside a `relative` rounded element.
 * Mouse/trackpad only; nothing is rendered on touch screens or with reduced motion.
 */
export function BorderGlow({
  size = 320,
  width = 1.5,
}: {
  size?: number;
  width?: number;
}) {
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
    const enter = (e: PointerEvent) => {
      rect = parent.getBoundingClientRect();
      x.jump(e.clientX - rect.left - size / 2);
      y.jump(e.clientY - rect.top - size / 2);
      opacity.set(1);
    };
    const move = (e: PointerEvent) => {
      x.set(e.clientX - rect.left - size / 2);
      y.set(e.clientY - rect.top - size / 2);
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
  }, [fine, reduce, size, x, y, opacity]);

  if (!fine || reduce) return <div ref={ref} hidden />;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      style={{
        padding: width,
        WebkitMask:
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
      }}
    >
      <m.div
        className="absolute left-0 top-0 rounded-full"
        style={{
          x,
          y,
          opacity,
          width: size,
          height: size,
          // About twice the old strength: a solid accent centre, a brighter shoulder and a
          // longer falloff, so the light reads on white (light theme) as well as on dark cards.
          background:
            'radial-gradient(circle, hsl(var(--primary)), hsl(var(--primary) / 0.75) 22%, hsl(var(--glow) / 0.45) 44%, hsl(var(--glow) / 0.12) 60%, transparent 72%)',
        }}
      />
    </div>
  );
}
