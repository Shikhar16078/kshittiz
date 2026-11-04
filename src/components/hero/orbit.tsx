'use client';

import { m, useTransform, type MotionValue } from 'motion/react';
import {
  siDocker,
  siGo,
  siPython,
  siRedis,
  siSnowflake,
  siSpringboot,
  type SimpleIcon,
} from 'simple-icons';
import { cn } from '@/lib/utils';

// Hidden on phones (`mobile: false`): opposite pairs, so the four that remain stay balanced.
const ICONS: { icon: SimpleIcon; mobile: boolean }[] = [
  { icon: siGo, mobile: true },
  { icon: siSnowflake, mobile: false },
  { icon: siRedis, mobile: true },
  { icon: siPython, mobile: true },
  { icon: siDocker, mobile: false },
  { icon: siSpringboot, mobile: true },
];

// The orbit is a circle squashed to an ellipse (FLATTEN) and tilted in the screen plane (TILT),
// so it reads as a ring seen from slightly above. The lower half is the near side.
const TILT = (-14 * Math.PI) / 180;
const FLATTEN = 0.32;
/** The ring sits low on the photo (share of the orbit box), so the near side crosses the shirt, not the face. */
const DROP = 12;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);

const round = (v: number) => Math.round(v * 1000) / 1000;

/** Position on the ellipse as a share of the orbit box, plus depth (0 far, 1 near). */
function place(deg: number) {
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = FLATTEN * Math.sin(a);
  return {
    x: round((ux * COS_T - uy * SIN_T) * 50),
    y: round((ux * SIN_T + uy * COS_T) * 50 + DROP),
    depth: (Math.sin(a) + 1) / 2,
    front: Math.sin(a) > 0,
  };
}

function OrbitIcon({
  angle,
  offset,
  icon,
  className,
}: {
  angle: MotionValue<number>;
  offset: number;
  icon: SimpleIcon;
  className?: string;
}) {
  // Each value is derived from the one shared angle, so all icons move in lockstep and nothing
  // re-renders. Percentages are of the carrier (the orbit box), so no layout is measured.
  const x = useTransform(angle, (v) => `${place(v + offset).x}%`);
  const y = useTransform(angle, (v) => `${place(v + offset).y}%`);
  // Swaps only twice per lap: near side over the photo, far side under it.
  const zIndex = useTransform(angle, (v) => (place(v + offset).front ? 3 : 1));
  const scale = useTransform(angle, (v) => 0.7 + 0.38 * place(v + offset).depth);
  const opacity = useTransform(angle, (v) => 0.4 + 0.6 * place(v + offset).depth);
  // Near-black brand colours would vanish on dark cards.
  const color = parseInt(icon.hex, 16) < 0x333333 ? 'currentColor' : `#${icon.hex}`;

  return (
    <m.span
      aria-hidden
      data-orbit-icon={icon.title}
      style={{ x, y, zIndex }}
      className={cn(
        'pointer-events-none absolute -inset-[15%] flex items-center justify-center',
        className,
      )}
    >
      <m.span
        style={{ scale, opacity }}
        className="flex size-9 items-center justify-center rounded-full border border-primary/25 bg-card shadow-[0_6px_16px_-6px_hsl(0_0%_0%/0.45)] lg:size-10"
      >
        <svg viewBox="0 0 24 24" className="size-[56%]" fill={color}>
          <path d={icon.path} />
        </svg>
      </m.span>
    </m.span>
  );
}

/**
 * Tech icons orbiting the profile photo on a tilted ellipse, driven by one `angle` motion value
 * (degrees) from the photo's frame loop. Place inside the photo's `relative` box, after the photo,
 * with the photo at z-index 2: near-side icons (z 3) pass over it, far-side ones (z 1) under it.
 * Phones show four smaller icons. With reduced motion the angle never advances, so they rest.
 */
export function Orbit({ angle }: { angle: MotionValue<number> }) {
  return (
    <>
      {ICONS.map(({ icon, mobile }, i) => (
        <OrbitIcon
          key={icon.slug}
          angle={angle}
          offset={(i * 360) / ICONS.length}
          icon={icon}
          className={mobile ? undefined : 'hidden sm:flex'}
        />
      ))}
    </>
  );
}
