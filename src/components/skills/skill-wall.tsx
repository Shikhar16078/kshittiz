'use client';

import { useEffect, useMemo, useRef, type PointerEvent } from 'react';
import {
  animate,
  frame,
  m,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react';
import { Marquee } from '@/components/motion/marquee';
import { MediaOnly } from '@/components/media-only';
import { SkillTileFace } from '@/components/skills/skill-tile';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { DURATION, EASE_OUT, cappedInterval, springSnappy } from '@/lib/motion';
import { skillRows, skills, type Skill, type SkillCategory } from '@/lib/skills';
import { cn } from '@/lib/utils';

export type SkillFilter = SkillCategory | 'All';

/** Plane tilt at rest (degrees, top edge leaning away) and the extra the cursor adds. */
const BASE_TILT = 18;
const POINTER_TILT = 4;
const TILT_SPRING = { stiffness: 120, damping: 20, mass: 0.6 };

// Per row: idle speed in px/s and direction, so neighbouring rows drift against each other.
const DESKTOP_ROWS = [
  { speed: 30, reverse: false },
  { speed: 22, reverse: true },
  { speed: 38, reverse: false },
];
const MOBILE_ROWS = [
  { speed: 26, reverse: false },
  { speed: 18, reverse: true },
];

/** Lit (in the selected category), dimmed (outside it) or neutral (no filter). */
function tileState(skill: Skill, filter: SkillFilter) {
  if (filter === 'All') return { opacity: 1, scale: 1 };
  return skill.category === filter
    ? { opacity: 1, scale: 1.04 }
    : { opacity: 0.22, scale: 0.92 };
}

const dimTransition = { duration: DURATION.base, ease: EASE_OUT };

/**
 * Speed coupling for every row: scroll velocity (fine pointers only, ±5× the idle pace, eased by
 * a spring) and a hold that eases the whole wall to a stop while the detail is open.
 * Marquee multiplies its rate by (1 + boost), so boost −1 is a full stop.
 */
function useWallBoost(held: boolean) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const live = useRef(false);
  useEffect(() => {
    live.current = fine && !reduce;
  }, [fine, reduce]);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 300, damping: 50 });
  const hold = useSpring(0, { stiffness: 120, damping: 24 });
  useEffect(() => {
    hold.set(held ? 1 : 0);
  }, [held, hold]);

  return useTransform(() => {
    const v = smooth.get();
    const scroll = live.current ? Math.max(-5, Math.min(5, v / 400)) : 0;
    return (1 + scroll) * (1 - hold.get()) - 1;
  });
}

/**
 * Hover and click for the drifting rows. Marquee's duplicate copy is `inert`, so pointer events
 * over it land on the track instead of the tile; we find the tile under the pointer from the
 * tiles' boxes, which works the same for both copies. Hover writes `data-hot` on that tile and
 * lifts it with an imperative spring: no React state per pointer move. Box reads happen at most
 * once per frame, in Motion's read phase.
 */
function usePointerTiles(onOpen: (id: string) => void) {
  const hot = useRef<HTMLElement | null>(null);
  const pending = useRef(false);

  const tileAt = (root: HTMLElement, x: number, y: number) => {
    for (const el of root.querySelectorAll<HTMLElement>('[data-skill]')) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x < r.right && y >= r.top && y < r.bottom) return el;
    }
    return null;
  };

  const setHot = (el: HTMLElement | null) => {
    if (hot.current === el) return;
    const prev = hot.current;
    if (prev) {
      delete prev.dataset.hot;
      const lift = prev.querySelector('[data-lift]');
      if (lift) animate(lift, { y: 0, scale: 1 }, springSnappy);
    }
    hot.current = el;
    if (el) {
      el.dataset.hot = '';
      const lift = el.querySelector('[data-lift]');
      if (lift) animate(lift, { y: -5, scale: 1.06 }, springSnappy);
    }
  };

  return {
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (pending.current) return;
      pending.current = true;
      const root = e.currentTarget;
      const { clientX, clientY } = e;
      frame.read(() => {
        pending.current = false;
        setHot(tileAt(root, clientX, clientY));
      });
    },
    onPointerLeave: () => setHot(null),
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      const el = tileAt(e.currentTarget, e.clientX, e.clientY);
      const id = el?.dataset.skill;
      if (id) onOpen(id);
    },
  };
}

function DriftTile({ skill, filter }: { skill: Skill; filter: SkillFilter }) {
  const lit = filter !== 'All' && skill.category === filter;
  return (
    <m.div
      data-skill={skill.id}
      data-lit={lit ? '' : undefined}
      className="group/tile shrink-0 px-1 py-1.5 md:px-2 md:py-2"
      initial={false}
      animate={tileState(skill, filter)}
      transition={dimTransition}
    >
      <SkillTileFace skill={skill} large />
    </m.div>
  );
}

function DriftRows({
  rows,
  config,
  filter,
  boost,
}: {
  rows: Skill[][];
  config: { speed: number; reverse: boolean }[];
  filter: SkillFilter;
  boost: MotionValue<number>;
}) {
  return (
    <>
      {rows.map((row, i) => (
        <Marquee key={i} speed={config[i].speed} reverse={config[i].reverse} boost={boost}>
          {row.map((s) => (
            <DriftTile key={s.id} skill={s} filter={filter} />
          ))}
        </Marquee>
      ))}
    </>
  );
}

/**
 * The logo wall: rows of tiles drifting in opposite directions on a plane tilted back in 3D
 * (following the cursor a little; mouse/trackpad only, flat on touch screens), with faded edges. Three rows from md up,
 * two smaller ones on phones. It's decorative for assistive tech (`aria-hidden`, nothing
 * focusable): keyboard and screen-reader users get the same tiles as real buttons in the grid
 * (`SkillGrid`), via the pause control or a category chip.
 */
export function SkillWall({
  filter,
  held,
  onOpen,
}: {
  filter: SkillFilter;
  held: boolean;
  onOpen: (id: string) => void;
}) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const boost = useWallBoost(held);
  const pointer = usePointerTiles(onOpen);
  const desktopRows = useMemo(() => skillRows(3), []);
  const mobileRows = useMemo(() => skillRows(2), []);

  const rect = useRef<DOMRect | null>(null);
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const rotateX = useTransform(tiltX, (v) => BASE_TILT + v);
  const tiltable = fine && !reduce;

  return (
    <div
      aria-hidden
      // Full bleed: wider than the container, edge to edge (the section clips the overflow).
      // The 3D tilt and the mask over the whole plane are mouse/trackpad only: on phones every
      // marquee frame would recomposite a masked 3D surface, which their GPUs drop frames on.
      className="relative mx-[calc(50%-50vw)] select-none pointer-fine:[perspective:1200px] pointer-fine:[mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
    >
      <m.div
        className="flex flex-col py-4 md:py-5"
        // Flat for the server render and hydration (fine is false until mounted).
        style={fine ? { rotateX, rotateY: tiltY } : undefined}
        onPointerEnter={(e) => {
          if (tiltable) rect.current = e.currentTarget.getBoundingClientRect();
        }}
        onPointerMove={(e) => {
          pointer.onPointerMove(e);
          const r = rect.current;
          if (!tiltable || !r) return;
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          tiltY.set(px * POINTER_TILT * 2);
          tiltX.set(-py * POINTER_TILT * 2);
        }}
        onPointerLeave={() => {
          pointer.onPointerLeave();
          rect.current = null;
          tiltX.set(0);
          tiltY.set(0);
        }}
        onClick={pointer.onClick}
      >
        {/* Both sets in the server HTML (CSS shows one); the other is dropped after hydration. */}
        <MediaOnly query="(min-width: 768px)">
          <div className="hidden md:block">
            <DriftRows rows={desktopRows} config={DESKTOP_ROWS} filter={filter} boost={boost} />
          </div>
        </MediaOnly>
        <MediaOnly query="(max-width: 767.98px)">
          <div className="md:hidden">
            <DriftRows rows={mobileRows} config={MOBILE_ROWS} filter={filter} boost={boost} />
          </div>
        </MediaOnly>
      </m.div>
    </div>
  );
}

/**
 * The still version: every tile as a real button in a centred, wrapped grid. Shown with reduced
 * motion and when the wall is paused. The selected category lights up as on the wall.
 */
export function SkillGrid({
  filter,
  onOpen,
  className,
}: {
  filter: SkillFilter;
  onOpen: (id: string) => void;
  className?: string;
}) {
  const interval = cappedInterval(skills.length, 0.4, 0.012);
  return (
    <ul
      aria-label="Skills"
      className={cn('flex flex-wrap justify-center gap-1.5 py-2 md:gap-2', className)}
    >
      {skills.map((s, i) => {
        const lit = filter !== 'All' && s.category === filter;
        return (
          <m.li
            key={s.id}
            data-lit={lit ? '' : undefined}
            className="group/tile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ ...tileState(s, filter), y: 0 }}
            transition={{ ...dimTransition, delay: i * interval }}
          >
            <m.button
              type="button"
              onClick={() => onOpen(s.id)}
              aria-label={`${s.name}: where it was used`}
              aria-haspopup="dialog"
              whileHover={{ y: -4, transition: springSnappy }}
              whileTap={{ scale: 0.96 }}
              className="block rounded-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <SkillTileFace skill={s} />
            </m.button>
          </m.li>
        );
      })}
    </ul>
  );
}
