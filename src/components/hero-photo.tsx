'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  animate,
  m,
  useInView,
  type AnimationPlaybackControls,
  type Transition,
  type Variants,
} from 'motion/react';
import { Tilt } from '@/components/motion/tilt';
import { useAmbientMotion } from '@/lib/motion-tier';
import { DURATION, EASE_OUT } from '@/lib/motion';

// The ring turns once every 12s, about 4x faster while hovered.
const LAP = 12;
const HOVER_SPEED = 4;

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

const PING: Transition = { duration: 2, repeat: Infinity, ease: EASE_OUT };

/**
 * The ring's endless turn as a GPU `transform` loop (WAAPI), paused off screen. Returns a setter
 * that eases the playback rate (hover speed-up) without restarting it.
 */
function useRingSpin(ring: React.RefObject<HTMLDivElement | null>, live: boolean, inView: boolean) {
  const loop = useRef<AnimationPlaybackControls | null>(null);
  const tween = useRef<AnimationPlaybackControls | null>(null);
  const speed = useRef(1);

  useEffect(() => {
    const el = ring.current;
    if (!el || !live) return;
    const c = animate(
      el,
      { transform: ['rotate(0deg)', 'rotate(360deg)'] },
      { duration: LAP, ease: 'linear', repeat: Infinity },
    );
    c.speed = speed.current;
    loop.current = c;
    return () => {
      c.stop();
      loop.current = null;
    };
  }, [ring, live]);

  useEffect(() => {
    const c = loop.current;
    if (!c) return;
    if (inView) c.play();
    else c.pause();
  }, [inView, live]);

  useEffect(() => () => tween.current?.stop(), []);

  return (target: number) => {
    tween.current?.stop();
    tween.current = animate(speed.current, target, {
      duration: 1.2,
      ease: EASE_OUT,
      onUpdate: (v) => {
        speed.current = v;
        if (loop.current) loop.current.speed = v;
      },
    });
  };
}

/**
 * Profile photo inside a slowly spinning ring with a soft glow, tilting toward the cursor on
 * mouse/trackpad devices. Under the mouse the ring eases up to speed and the glow brightens.
 The café photo (every theme but sapphire, preloaded) and the beach photo (sapphire) are both in the first HTML
 * and CSS shows the one for the theme (good for LCP). With a `status`, a pulsing dot sits on the
 * ring and the text is shown in a chip under the photo, so it never depends on hover.
 */
export function HeroPhoto({ status }: { status?: string }) {
  const ambient = useAmbientMotion();
  const ref = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const live = ambient && inView;
  const setSpeed = useRingSpin(ring, ambient, inView);

  return (
    <div ref={ref} className="flex flex-col items-center gap-5">
      <Tilt max={10} className="rounded-full">
        <m.div
          initial="rest"
          animate="rest"
          whileHover="hover"
          onHoverStart={() => setSpeed(HOVER_SPEED)}
          onHoverEnd={() => setSpeed(1)}
          className="relative size-56 sm:size-64 lg:size-[clamp(16rem,44svh,21rem)]"
        >
          {/* Glow: a static shadow whose opacity animates (cheaper than animating box-shadow). */}
          <m.div
            aria-hidden
            variants={glow}
            className="absolute inset-0 rounded-full shadow-[0_0_30px_hsl(var(--glow)/0.9),0_0_60px_hsl(var(--glow)/0.6),0_0_90px_hsl(var(--glow)/0.35)]"
          />
          {/* Ring: a conic arc of light, turned by the GPU loop above. */}
          <div
            ref={ring}
            aria-hidden
            className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--primary))_90deg,transparent_180deg,hsl(var(--primary)/0.5)_270deg,transparent_360deg)]"
          />
          <m.div
            variants={photo}
            className="relative z-[2] h-full w-full overflow-hidden rounded-full bg-background"
          >
            {/* Café photo for every theme, beach photo for sapphire. CSS picks one, so the
                first paint is right with no hydration flash; on a theme switch the circle
                reveals the new photo along with the rest of the page. */}
            <Image
              src="/images/profile_dark.jpeg"
              alt="Profile photo"
              width={400}
              height={400}
              preload
              sizes="(min-width: 1024px) 336px, 256px"
              className="h-full w-full object-cover sapphire:hidden"
            />
            <Image
              src="/images/profile.jpg"
              alt="Profile photo"
              width={400}
              height={400}
              // Eager even while hidden, so it's decoded before a switch to sapphire captures it.
              loading="eager"
              sizes="(min-width: 1024px) 336px, 256px"
              className="hidden h-full w-full object-cover sapphire:block"
            />
          </m.div>
          {status && (
            // On the ring at the 4:30 position (cos 45deg from the centre = 85.4%).
            <span
              aria-hidden
              className="absolute left-[85.4%] top-[85.4%] z-[4] size-5 -translate-x-1/2 -translate-y-1/2 lg:size-6"
            >
              <m.span
                className="absolute inset-0 rounded-full bg-primary"
                initial={{ transform: 'scale(1)', opacity: 0 }}
                animate={
                  live
                    ? { transform: ['scale(1)', 'scale(2.4)'], opacity: [0.6, 0], transition: PING }
                    : { transform: 'scale(1)', opacity: 0 }
                }
              />
              <span className="absolute inset-0 rounded-full border-4 border-background bg-primary" />
            </span>
          )}
        </m.div>
      </Tilt>
      {status && (
        <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-sm font-medium text-foreground/90 shadow-sm">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary" />
          <span className="truncate">{status}</span>
        </p>
      )}
    </div>
  );
}
