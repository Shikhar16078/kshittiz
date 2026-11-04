'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  animate,
  useInView,
  useReducedMotion,
  type AnimationPlaybackControls,
} from 'motion/react';
import { GraduationCap, Rocket } from 'lucide-react';
import type { Project } from '@/lib/types';
import { cn, hash } from '@/lib/utils';

/** Small seeded PRNG (mulberry32). Same seed, same numbers, on server and client. */
function prng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 400;
const H = 160;
const r1 = (n: number) => Math.round(n * 10) / 10;

type Pattern = (rand: () => number) => ReactNode;

// Each pattern draws with theme tokens only (Tailwind fill/stroke classes), so covers follow
// the active theme.
const patterns: Pattern[] = [
  // Dot field that swells toward a focal point.
  (rand) => {
    const fx = rand() * W;
    const fy = rand() * H;
    const dots: ReactNode[] = [];
    for (let x = 10; x < W; x += 20) {
      for (let y = 10; y < H; y += 20) {
        const d = Math.hypot(x - fx, y - fy);
        const r = Math.max(0.6, 4.5 - d / 45);
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={r1(r)} />);
      }
    }
    return <g className="fill-pattern/35">{dots}</g>;
  },
  // Parallel diagonal lines.
  (rand) => {
    const angle = r1(20 + rand() * 50) * (rand() > 0.5 ? 1 : -1);
    const gap = 12 + Math.floor(rand() * 8);
    const lines: ReactNode[] = [];
    for (let x = -W; x < W * 2; x += gap) {
      lines.push(<line key={x} x1={x} y1={-H} x2={x} y2={H * 2} />);
    }
    return (
      <g
        className="stroke-pattern/25"
        strokeWidth={1.5}
        transform={`rotate(${angle} ${W / 2} ${H / 2})`}
      >
        {lines}
      </g>
    );
  },
  // Concentric rings from an off-centre point.
  (rand) => {
    const cx = r1(rand() * W);
    const cy = r1(rand() * H);
    const rings: ReactNode[] = [];
    for (let r = 14; r < 460; r += 18) {
      rings.push(<circle key={r} cx={cx} cy={cy} r={r} />);
    }
    return (
      <g className="fill-none stroke-pattern/25" strokeWidth={1.25}>
        {rings}
      </g>
    );
  },
  // Block grid with a scatter of lit cells.
  (rand) => {
    const size = 20;
    const cells: ReactNode[] = [];
    for (let x = 0; x < W; x += size) {
      for (let y = 0; y < H; y += size) {
        const v = rand();
        if (v > 0.72) {
          cells.push(
            <rect
              key={`${x}-${y}`}
              x={x + 2}
              y={y + 2}
              width={size - 4}
              height={size - 4}
              rx={3}
              className={v > 0.93 ? 'fill-pattern/45' : 'fill-pattern/15'}
            />
          );
        }
      }
    }
    return (
      <>
        <g className="stroke-pattern/10" strokeWidth={1}>
          {Array.from({ length: W / size }, (_, i) => (
            <line key={`v${i}`} x1={i * size} y1={0} x2={i * size} y2={H} />
          ))}
          {Array.from({ length: H / size }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * size} x2={W} y2={i * size} />
          ))}
        </g>
        {cells}
      </>
    );
  },
  // Stacked sine waves.
  (rand) => {
    const freq = 1 + rand() * 2;
    const phase = rand() * Math.PI * 2;
    const waves: ReactNode[] = [];
    for (let i = 0; i < 9; i++) {
      const base = 10 + i * 18;
      const amp = 8 + rand() * 10;
      let d = '';
      for (let x = 0; x <= W; x += 10) {
        const y =
          base + Math.sin((x / W) * Math.PI * 2 * freq + phase + i * 0.4) * amp;
        d += `${x === 0 ? 'M' : 'L'}${x} ${r1(y)}`;
      }
      waves.push(<path key={i} d={d} />);
    }
    return (
      <g className="fill-none stroke-pattern/30" strokeWidth={1.5}>
        {waves}
      </g>
    );
  },
];

/**
 * Generated cover art: a pattern and two soft glows chosen deterministically from the project id,
 * plus the category icon and project number. Decorative, so it's hidden from screen readers.
 */
export function ProjectCover({
  project,
  index,
  className,
}: {
  project: Project;
  index: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reduce = useReducedMotion();
  const { art, background, drift } = useMemo(() => {
    const seed = hash(`${project.id}:${project.title}`);
    const rand = prng(seed);
    const pattern = patterns[seed % patterns.length];
    const g1 = [Math.round(rand() * 100), Math.round(rand() * 100)];
    const g2 = [Math.round(rand() * 100), Math.round(rand() * 100)];
    const art = pattern(rand);
    // A slow drift loop, different per project (direction and pace), so covers side by side
    // don't move in step.
    const sx = rand() > 0.5 ? 1 : -1;
    const sy = rand() > 0.5 ? 1 : -1;
    const drift = {
      x: [0, 14 * sx, -6 * sx, 0],
      y: [0, -8 * sy, 6 * sy, 0],
      scale: [1, 1.04, 1.02, 1],
      duration: 11 + Math.round(rand() * 6),
    };
    return {
      art,
      drift,
      // Radial gradients, not blur filters: cheap to composite.
      background: [
        `radial-gradient(circle at ${g1[0]}% ${g1[1]}%, hsl(var(--glow) / 0.28), transparent 55%)`,
        `radial-gradient(circle at ${g2[0]}% ${g2[1]}%, hsl(var(--glow-2) / 0.16), transparent 60%)`,
        'hsl(var(--secondary))',
      ].join(', '),
    };
  }, [project.id, project.title]);

  // The drift is one endless loop, paused off screen and sped up while the card is hovered
  // (its playback speed eases, so the pattern never jumps).
  const artRef = useRef<HTMLDivElement>(null);
  const loop = useRef<AnimationPlaybackControls | null>(null);
  useEffect(() => {
    const el = artRef.current;
    if (!el || reduce) return;
    loop.current = animate(
      el,
      { x: drift.x, y: drift.y, scale: drift.scale },
      { duration: drift.duration, ease: 'easeInOut', repeat: Infinity }
    );
    return () => {
      loop.current?.stop();
      loop.current = null;
      animate(el, { x: 0, y: 0, scale: 1 }, { duration: 0.6 });
    };
  }, [drift, reduce]);

  useEffect(() => {
    const c = loop.current;
    if (!c) return;
    if (inView) c.play();
    else c.pause();
  }, [inView, reduce, drift]);

  useEffect(() => {
    const card = root.current?.parentElement;
    if (!card || reduce) return;
    let tween: AnimationPlaybackControls | null = null;
    const to = (speed: number) => {
      const c = loop.current;
      if (!c) return;
      tween?.stop();
      tween = animate(c.speed, speed, {
        duration: 0.5,
        onUpdate: (v) => {
          c.speed = v;
        },
      });
    };
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && to(3);
    const leave = () => to(1);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    return () => {
      tween?.stop();
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
    };
  }, [reduce]);

  const Icon = project.type === 'Academic' ? GraduationCap : Rocket;

  return (
    <div
      ref={root}
      aria-hidden
      className={cn('relative h-28 overflow-hidden border-b sm:h-32', className)}
      style={{ background }}
    >
      {/* The art is drawn a little larger than the cover so its drift never shows an edge.
          Transform-only, and only while the cover is on screen (clipped slides don't count). */}
      <div ref={artRef} className="absolute -inset-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          {art}
        </svg>
      </div>
      {/* Fades the art into the card so the title below reads cleanly. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--card)/0.9),transparent_65%)]" />
      <span className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-card/80 text-primary-ink shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <span className="absolute right-4 top-3 font-headline text-3xl font-bold tabular-nums text-foreground/15">
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}
