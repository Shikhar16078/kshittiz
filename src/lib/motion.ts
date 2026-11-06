import { stagger, type Transition, type Variants } from 'motion/react';

// Shared motion language: one easing curve, a few durations, short travel distances.
// Only transform and opacity animate, so it stays smooth on phones.
// Reveals are reversible: content rises in when it scrolls into view and sinks back out
// (faster, in reverse order) when it drops below the screen again, i.e. when scrolling up.

/** Fast start, long gentle settle: for things arriving. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Slow start, quick finish: for things leaving. */
export const EASE_IN = [0.4, 0, 1, 1] as const;

export const DURATION = {
  fast: 0.2,
  exit: 0.3,
  base: 0.45,
  slow: 0.7,
} as const;

/** Vertical travel for reveals, in px. */
export const RISE = 16;

/** Reveal trigger: this share of the element must be above the trigger line... */
export const REVEAL_AMOUNT = 0.1;
/** ...which sits 12% up from the bottom of the screen. The area reaches far above the
 *  screen, so anything already scrolled past counts as revealed. */
export const REVEAL_MARGIN = '100000px 0px -12% 0px';
/** Trigger line at the very bottom of the screen, for content at the end of the page. */
export const REVEAL_MARGIN_PAGE_END = '100000px 0px 0px 0px';
/** On touch screens the trigger line sits 10% *below* the screen, so a reveal has started (and
 *  mostly finished) before the content scrolls into view, instead of popping in late. */
export const REVEAL_MARGIN_TOUCH = '100000px 0px 10% 0px';

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 40,
  mass: 1,
};

export const exitTransition: Transition = {
  duration: DURATION.exit,
  ease: EASE_IN,
};

export const enterTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: RISE, transition: exitTransition },
  show: { opacity: 1, y: 0, transition: enterTransition },
};

/**
 * The GPU version of `fadeUp`, for anything that enters on scroll or on load (where many run at
 * once while the page is busy): `transform` and opacity, which Motion hands to the browser to run
 * off the main thread. Reduced motion doesn't suppress `transform`, so pass it in: the rise is then
 * instant and only the fade remains. The hidden pose is the same either way, so the server HTML
 * never depends on it. `delay` adds to each transition (e.g. a stagger).
 */
export function rise(reduce: boolean | null, delay = 0, hideDelay = 0): Variants {
  const still = reduce ? { transform: { duration: 0 } } : {};
  return {
    hidden: {
      opacity: 0,
      transform: `translateY(${RISE}px)`,
      transition: { ...exitTransition, delay: hideDelay, ...still },
    },
    show: {
      opacity: 1,
      transform: 'translateY(0px)',
      transition: { ...enterTransition, delay, ...still },
    },
  };
}

/** Parent variants that stagger children in, and back out in reverse at half the interval. */
export function staggerChildren(interval = 0.06, startDelay = 0): Variants {
  return {
    hidden: {
      transition: { delayChildren: stagger(interval / 2, { from: 'last' }) },
    },
    show: { transition: { delayChildren: stagger(interval, { startDelay }) } },
  };
}

/** Spreads `count` items over at most `total` seconds, so long lists don't drag on. */
export function cappedInterval(count: number, total = 0.35, max = 0.05) {
  return Math.min(max, total / Math.max(count, 1));
}

/** Popovers (dropdown, tooltip): a small scale-and-fade from the trigger side. */
export const popIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: DURATION.fast, ease: EASE_IN },
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  },
};

/** Hover lift for cards (hover only fires for mouse and pen, never touch). */
export const hoverLift = { y: -4, transition: springSnappy };

/**
 * Expanding panels (use with AnimatePresence and `overflow-hidden`): they ease open to their
 * natural height while the content fades in, and close by fading first, then folding shut.
 * Height is the one non-transform property animated, because the layout has to make room.
 */
export const collapse: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: { duration: DURATION.fast, ease: EASE_IN },
      height: { duration: DURATION.exit, ease: EASE_IN, delay: 0.05 },
    },
  },
  show: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: DURATION.base, ease: EASE_OUT },
      opacity: { duration: DURATION.base, ease: EASE_OUT, delay: 0.1 },
    },
  },
};

/**
 * Turns per-axis keyframes into `transform` keyframes for endless ambient loops. Motion only hands
 * `transform` (and opacity, filter, clip-path) to the browser to run on the GPU; the `x`/`y`/
 * `scale`/`rotate` shorthands are computed on the main thread every frame, so a busy page makes
 * them stutter. Arrays shorter than the longest hold their last value. Px for x/y, deg for rotate.
 *
 * Note: `reducedMotion="user"` does not suppress `transform` animations, so callers gate these
 * loops themselves (`useAmbientMotion()`). Always give a `transform` animation an explicit
 * `initial`: animating from the browser's `none` makes Motion start from scale(0).
 */
export function gpuKeyframes({
  x = [0],
  y = [0],
  scale = [1],
  rotate = [0],
}: {
  x?: readonly number[];
  y?: readonly number[];
  scale?: readonly number[];
  rotate?: readonly number[];
}): string[] {
  const n = Math.max(x.length, y.length, scale.length, rotate.length);
  const at = (a: readonly number[], i: number) => a[Math.min(i, a.length - 1)];
  return Array.from(
    { length: n },
    (_, i) =>
      `translate(${at(x, i)}px, ${at(y, i)}px) rotate(${at(rotate, i)}deg) scale(${at(scale, i)})`,
  );
}

/** The resting pose of a `gpuKeyframes` loop. */
export const GPU_REST = 'translate(0px, 0px) rotate(0deg) scale(1)';
