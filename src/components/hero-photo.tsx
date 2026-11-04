'use client';

import Image from 'next/image';
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from 'motion/react';
import { DURATION, EASE_OUT } from '@/lib/motion';

// Ring speed in degrees per millisecond: one turn every 12s, about 4x faster while hovered.
const BASE_SPEED = 360 / 12000;
const HOVER_SPEED = BASE_SPEED * 4;

const glow: Variants = {
  rest: { opacity: 0.55, transition: { duration: DURATION.base } },
  hover: { opacity: 1, transition: { duration: DURATION.base } },
};

const photo: Variants = {
  rest: { scale: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
  hover: {
    scale: 1.04,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/**
 * Profile photo inside a slowly spinning gold ring with a soft glow. Under the mouse the ring
 * eases up to speed and the glow brightens. Both theme variants are rendered and CSS shows the
 * right one, so the photo is in the first HTML (good for LCP) instead of waiting for JS.
 */
export function HeroPhoto() {
  const reduce = useReducedMotion();
  const rotate = useMotionValue(0);
  const speed = useSpring(BASE_SPEED, { stiffness: 40, damping: 20 });

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    rotate.set((rotate.get() + speed.get() * delta) % 360);
  });

  return (
    <m.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      onHoverStart={() => speed.set(HOVER_SPEED)}
      onHoverEnd={() => speed.set(BASE_SPEED)}
      className="relative h-80 w-80"
    >
      {/* Glow: a static shadow whose opacity animates (cheaper than animating box-shadow). */}
      <m.div
        aria-hidden
        variants={glow}
        className="absolute inset-0 rounded-full shadow-[0_0_30px_hsl(var(--glow)/0.9),0_0_60px_hsl(var(--glow)/0.6),0_0_90px_hsl(var(--glow)/0.35)]"
      />
      {/* Ring: a conic arc of light, rotated by the frame loop above. */}
      <m.div
        aria-hidden
        style={{ rotate }}
        className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--primary))_90deg,transparent_180deg,hsl(var(--primary)/0.5)_270deg,transparent_360deg)]"
      />
      <m.div
        variants={photo}
        className="relative h-full w-full overflow-hidden rounded-full bg-background"
      >
        <Image
          src="/images/profile_dark.jpeg"
          alt="Profile photo"
          width={400}
          height={400}
          preload
          className="hidden h-full w-full object-cover dark:block"
        />
        <Image
          src="/images/profile.jpg"
          alt="Profile photo"
          width={400}
          height={400}
          className="h-full w-full object-cover dark:hidden"
        />
      </m.div>
    </m.div>
  );
}
