'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { m, type Variants } from 'motion/react';
import {
  enterTransition,
  exitTransition,
  fadeUp,
  REVEAL_AMOUNT,
  REVEAL_MARGIN,
  RISE,
} from '@/lib/motion';

/**
 * True while enough of the element is above the trigger line near the bottom of the screen.
 * That covers everything already scrolled past, so content above the screen stays revealed and
 * only content dropping back below the line (scrolling up) is undone. It depends on position
 * alone, so fast flings and instant jumps can't skip an element.
 */
export function useScrollReveal<T extends Element>(
  margin: string = REVEAL_MARGIN,
) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setShown(
          entry.isIntersecting && entry.intersectionRatio >= REVEAL_AMOUNT,
        ),
      { rootMargin: margin, threshold: [0, REVEAL_AMOUNT] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, shown] as const;
}

type DivProps = Omit<
  ComponentProps<typeof m.div>,
  'initial' | 'animate' | 'whileInView' | 'viewport' | 'ref'
>;

/**
 * Rises into view as it scrolls in; sinks back out when scrolled back up. `data-reveal` lets the
 * no-JS fallback show it. Pass `margin` to move the trigger line, e.g. for the footer, which can
 * never scroll above the default line.
 */
export function Reveal({ margin, ...props }: DivProps & { margin?: string }) {
  const [ref, shown] = useScrollReveal<HTMLDivElement>(margin);
  return (
    <m.div
      ref={ref}
      data-reveal=""
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={fadeUp}
      {...props}
    />
  );
}

/** Seconds between items in a `RevealGroup`'s stagger (halved when hiding). */
const STAGGER = 0.06;

/** Reveals its `RevealItem` children one after another in on-screen order, hides them in reverse. */
export function RevealGroup({
  margin,
  ...props
}: DivProps & { margin?: string }) {
  const [ref, shown] = useScrollReveal<HTMLDivElement>(margin);
  return (
    <m.div
      ref={ref}
      data-reveal-group=""
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: {} }}
      {...props}
    />
  );
}

/**
 * Where an item sits on screen among its group's visible items: [rank, count]. Items count only
 * when inside their clipping box (data-reveal-clip, e.g. the carousel viewport) or else the
 * group's box, ordered top to bottom, then left to right, so the stagger follows what the viewer
 * sees rather than DOM order.
 */
type Rank = () => [number, number];
function visualRank(el: HTMLElement | null): [number, number] {
  const group = el?.closest('[data-reveal-group]');
  if (!el || !group) return [0, 1];
  const inView = (e: HTMLElement, r: DOMRect) => {
    const box = (
      e.closest('[data-reveal-clip]') ?? group
    ).getBoundingClientRect();
    return r.right > box.left + 1 && r.left < box.right - 1;
  };
  const items = [...group.querySelectorAll<HTMLElement>('[data-reveal-item]')]
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .filter(({ e, r }) => inView(e, r))
    .sort(
      (a, b) =>
        Math.round(a.r.top / 8) - Math.round(b.r.top / 8) ||
        a.r.left - b.r.left,
    );
  return [
    Math.max(
      items.findIndex((x) => x.e === el),
      0,
    ),
    Math.max(items.length, 1),
  ];
}

// Item variants take the rank function (passed as `custom`) and turn it into a stagger delay.
const rankedVariants: Variants = {
  hidden: (rank: Rank) => {
    const [i, n] = rank();
    return {
      opacity: 0,
      y: RISE,
      transition: { ...exitTransition, delay: ((n - 1 - i) * STAGGER) / 2 },
    };
  },
  show: (rank: Rank) => {
    const [i] = rank();
    return {
      opacity: 1,
      y: 0,
      transition: { ...enterTransition, delay: i * STAGGER },
    };
  },
};

/** A child of `RevealGroup`; animates when the group does, at its place in the on-screen order. */
export function RevealItem(props: DivProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Resolved when each animation starts, so the order reflects where items are at that moment.
  const rank = useCallback<Rank>(() => visualRank(ref.current), []);
  return (
    <m.div
      ref={ref}
      data-reveal=""
      data-reveal-item=""
      custom={rank}
      variants={rankedVariants}
      {...props}
    />
  );
}
