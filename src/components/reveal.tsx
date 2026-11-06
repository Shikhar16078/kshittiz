'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { m, useReducedMotion, type TargetAndTransition, type Variants } from 'motion/react';
import {
  REVEAL_AMOUNT,
  REVEAL_MARGIN,
  REVEAL_MARGIN_TOUCH,
  rise,
} from '@/lib/motion';

/**
 * True while enough of the element is above the trigger line near the bottom of the screen.
 * That covers everything already scrolled past, so content above the screen stays revealed and
 * only content dropping back below the line (scrolling up) is undone. It depends on position
 * alone, so fast flings and instant jumps can't skip an element.
 *
 * On touch screens (no hover, coarse pointer) it's tuned for flick scrolling: the trigger line
 * sits just below the screen, so the reveal is under way before the content appears, and it
 * reveals once and stays (no re-running everything on every scroll back up).
 */
export function useScrollReveal<T extends Element>(
  margin: string = REVEAL_MARGIN,
) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const touch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= REVEAL_AMOUNT;
        if (touch) {
          if (!visible) return;
          setShown(true);
          observer.disconnect();
        } else setShown(visible);
      },
      {
        // The page-end margin (footer) stays as given: there's nothing below it to scroll to.
        rootMargin: touch && margin === REVEAL_MARGIN ? REVEAL_MARGIN_TOUCH : margin,
        threshold: [0, REVEAL_AMOUNT],
      },
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
  const reduce = useReducedMotion();
  return (
    <m.div
      ref={ref}
      data-reveal=""
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={rise(reduce)}
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

// Every item of a group asks for its rank in the same frame when the group starts animating.
// Measure the group once per frame and share it, rather than each item re-measuring all of its
// siblings (n² layout reads at the moment the section comes into view).
const rankCache = new WeakMap<Element, { order: Map<Element, number>; count: number }>();

function groupOrder(group: Element) {
  const hit = rankCache.get(group);
  if (hit) return hit;
  const groupBox = group.getBoundingClientRect();
  const clipBoxes = new Map<Element, DOMRect>();
  const boxOf = (e: HTMLElement) => {
    const clip = e.closest('[data-reveal-clip]');
    if (!clip) return groupBox;
    let r = clipBoxes.get(clip);
    if (!r) clipBoxes.set(clip, (r = clip.getBoundingClientRect()));
    return r;
  };
  const items = [...group.querySelectorAll<HTMLElement>('[data-reveal-item]')]
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .filter(({ e, r }) => {
      const box = boxOf(e);
      return r.right > box.left + 1 && r.left < box.right - 1;
    })
    .sort(
      (a, b) =>
        Math.round(a.r.top / 8) - Math.round(b.r.top / 8) ||
        a.r.left - b.r.left,
    );
  const entry = {
    order: new Map<Element, number>(items.map((x, i) => [x.e, i])),
    count: Math.max(items.length, 1),
  };
  rankCache.set(group, entry);
  requestAnimationFrame(() => rankCache.delete(group));
  return entry;
}

function visualRank(el: HTMLElement | null): [number, number] {
  const group = el?.closest('[data-reveal-group]');
  if (!el || !group) return [0, 1];
  const { order, count } = groupOrder(group);
  return [order.get(el) ?? 0, count];
}

// Item variants take the rank function and reduced motion (passed as `custom`) and turn them into
// the GPU rise with a stagger delay.
type ItemCustom = { rank: Rank; reduce: boolean | null };
const rankedVariants: Variants = {
  hidden: ({ rank, reduce }: ItemCustom) => {
    const [i, n] = rank();
    return rise(reduce, 0, ((n - 1 - i) * STAGGER) / 2).hidden as TargetAndTransition;
  },
  show: ({ rank, reduce }: ItemCustom) => {
    const [i] = rank();
    return rise(reduce, i * STAGGER).show as TargetAndTransition;
  },
};

/** A child of `RevealGroup`; animates when the group does, at its place in the on-screen order. */
export function RevealItem(props: DivProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Resolved when each animation starts, so the order reflects where items are at that moment.
  const rank = useCallback<Rank>(() => visualRank(ref.current), []);
  const reduce = useReducedMotion();
  const custom = useMemo<ItemCustom>(() => ({ rank, reduce }), [rank, reduce]);
  return (
    <m.div
      ref={ref}
      data-reveal=""
      data-reveal-item=""
      custom={custom}
      variants={rankedVariants}
      {...props}
    />
  );
}
