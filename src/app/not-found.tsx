'use client';

import Link from 'next/link';
import { m, type Variants } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { MotionButton } from '@/components/ui/motion-button';
import { DURATION, EASE_OUT, RISE, staggerChildren } from '@/lib/motion';

// The digits drop into place one by one on a soft spring; the copy follows with the usual rise.
const digit: Variants = {
  hidden: { opacity: 0, y: -24, rotate: -6 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
};

const rise: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-16 text-center">
      {/* Ambient glow: a radial gradient, cheap to composite. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,640px)] w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--glow)/0.12),transparent_65%)]"
      />
      <m.div
        initial="hidden"
        animate="show"
        variants={staggerChildren(0.08, 0.1)}
        className="relative flex max-w-prose flex-col items-center"
      >
        <h1 className="font-headline text-[clamp(6rem,32vw,12rem)] font-bold leading-none tracking-tighter">
          <span className="sr-only">404: page not found</span>
          <span aria-hidden className="flex">
            {['4', '0', '4'].map((d, i) => (
              <m.span
                key={i}
                data-reveal=""
                variants={digit}
                className={i === 1 ? 'inline-block text-primary' : 'inline-block'}
              >
                {d}
              </m.span>
            ))}
          </span>
        </h1>
        <m.p
          data-reveal=""
          variants={rise}
          className="mt-4 font-headline text-2xl font-semibold text-foreground"
        >
          This page wandered off.
        </m.p>
        <m.p
          data-reveal=""
          variants={rise}
          className="mt-3 text-base text-muted-foreground"
        >
          The link may be broken, or the page may have moved. The rest of the
          site is right where you left it.
        </m.p>
        <m.div data-reveal="" variants={rise} className="mt-8">
          <MotionButton
            asChild
            size="lg"
            className="group h-12 rounded-full px-7 text-base"
          >
            <Link href="/">
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              Back to home
            </Link>
          </MotionButton>
        </m.div>
      </m.div>
    </main>
  );
}
