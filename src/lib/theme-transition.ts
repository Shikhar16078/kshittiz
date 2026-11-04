import { flushSync } from 'react-dom';

export const THEMES = ['light', 'dark', 'fresh'] as const;
export type ThemeName = (typeof THEMES)[number];

export type Origin = { x: number; y: number };

// Where the circle's soft edge begins, as a fraction of its radius; matches the gradient in
// view-transitions.css.
const FEATHER_START = 0.75;
const CIRCLE = { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' };

/** Centre of an element, as a circle origin. */
export function centreOf(el: Element | null | undefined): Origin | undefined {
  if (!el) return undefined;
  const { left, top, width, height } = el.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
}

function applyThemeClass(next: ThemeName) {
  const root = document.documentElement;
  root.classList.remove(...THEMES);
  root.classList.add(next);
  root.style.colorScheme = next === 'light' ? 'light' : 'dark';
}

/** Grows the feathered circle mask on `::view-transition-new(root)` from `origin`. */
function sweep(origin: Origin, size: number) {
  const { x, y } = origin;
  document.documentElement.animate(
    {
      maskSize: ['0px 0px', `${size}px ${size}px`],
      maskPosition: [`${x}px ${y}px`, `${x - size / 2}px ${y - size / 2}px`],
    },
    // fill: hold the full size until the transition ends, or the mask snaps back to 0 (its value
    // in view-transitions.css) for a frame and the old theme flashes.
    { ...CIRCLE, fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
  );
}

/**
 * Switches theme with the new one spreading from `origin` as a soft-edged circle. Everything,
 * the hero photo included, is part of the one root snapshot, so each pixel changes exactly as
 * the circle passes over it. Without the View Transitions API, with reduced motion, or without
 * an origin, it's the plain switch.
 */
export function switchTheme(
  next: ThemeName,
  setTheme: (theme: string) => void,
  origin?: Origin,
) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce || !origin) {
    setTheme(next);
    return;
  }

  const { innerWidth: w, innerHeight: h } = window;
  const radius = Math.hypot(
    Math.max(origin.x, w - origin.x),
    Math.max(origin.y, h - origin.y),
  );
  // The mask's edge fades over its outer quarter, so grow it until that soft edge has passed the
  // farthest corner.
  const size = (radius / FEATHER_START) * 2;

  // The page's colour transitions would leave the "after" snapshot half-faded; pause them.
  const pause = document.createElement('style');
  pause.textContent = '*,*::before,*::after{transition:none!important}';

  const transition = document.startViewTransition(() => {
    document.head.appendChild(pause);
    // next-themes sets the class in an effect after rendering; set it now so the snapshot has it.
    applyThemeClass(next);
    flushSync(() => setTheme(next));
  });

  // Skipped, e.g. by a quick second click: the theme still switches, just without the circle.
  transition.ready.then(() => sweep(origin, size)).catch(() => {});
  transition.finished.catch(() => {}).finally(() => pause.remove());
}
