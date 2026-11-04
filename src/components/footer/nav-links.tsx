'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  m,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import type { NavLink, SocialLink } from '@/lib/types';
import { useScrollReveal } from '@/components/reveal';
import { scrollToSection } from '@/lib/scroll-to-section';
import {
  DURATION,
  EASE_OUT,
  REVEAL_MARGIN_PAGE_END,
  fadeUp,
  springSnappy,
  staggerChildren,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const PILL = { borderRadius: 9999 };

// Each letter rolls up one line; its copy underneath rolls in after it. Letter delays come from
// the `custom` index so the roll runs left to right.
const roll: Variants = {
  rest: { y: 0, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  hover: (i: number) => ({
    y: '-100%',
    transition: { duration: 0.32, ease: EASE_OUT, delay: i * 0.018 },
  }),
};
const nudge: Variants = {
  rest: { x: 0, rotate: 0, transition: springSnappy },
  hover: { x: -1, rotate: -10, scale: 1.12, transition: springSnappy },
};
const lift: Variants = {
  rest: { y: 0, scale: 1, transition: springSnappy },
  hover: { y: -2, scale: 1.08, transition: springSnappy },
};

/**
 * One highlight pill that glides (shared layoutId) to whichever item the pointer or focus is
 * on, and fades out when both leave the group. Hover state only changes on enter/leave, never
 * per frame. With reduced motion the pill just appears in place (no glide).
 */
function useHoverPill() {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const id = useId();

  const itemProps = (key: string) => ({
    onPointerEnter: () => setHovered(key),
    onFocus: () => setHovered(key),
    onBlur: () => setHovered((h) => (h === key ? null : h)),
  });

  const pill = (key: string, className: string) => (
    <AnimatePresence>
      {hovered === key && (
        <m.span
          aria-hidden
          layoutId={reduce ? undefined : `${id}-pill`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: DURATION.fast } }}
          exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
          transition={springSnappy}
          style={PILL}
          className={cn('absolute inset-0', className)}
        />
      )}
    </AnimatePresence>
  );

  return { itemProps, pill, clear: () => setHovered(null) };
}

/** The label as letters with a copy underneath, so it can roll up within one line box. */
function RollingLabel({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="relative inline-flex overflow-hidden leading-5">
        {[...text].map((ch, i) => (
          <m.span key={i} custom={i} variants={roll} className="relative inline-block">
            {ch === ' ' ? ' ' : ch}
            <span className="absolute left-0 top-full">{ch === ' ' ? ' ' : ch}</span>
          </m.span>
        ))}
      </span>
    </>
  );
}

function useCascade() {
  const [ref, shown] = useScrollReveal<HTMLUListElement>(REVEAL_MARGIN_PAGE_END);
  return {
    ref,
    initial: 'hidden' as const,
    animate: shown ? 'show' : 'hidden',
    variants: staggerChildren(0.05),
  };
}

/**
 * Footer section links in the header's language: a gliding highlight pill, the label rolling
 * up letter by letter on hover or focus, and the section icon nudging. Two columns on phones,
 * one wrapping row from sm up; every link is 44 px tall and everything is visible without hover.
 */
export function FooterNav({ links }: { links: NavLink[] }) {
  const { itemProps, pill, clear } = useHoverPill();
  const cascade = useCascade();
  const reduce = useReducedMotion();

  return (
    <nav aria-label="Footer">
      <LayoutGroup>
        <m.ul
          {...cascade}
          onPointerLeave={clear}
          className="-mx-3 grid grid-cols-2 gap-1 sm:flex sm:flex-wrap"
        >
          {links.map((link) => (
            <m.li key={link.href} data-reveal="" variants={fadeUp}>
              <m.a
                href={link.href}
                onClick={scrollToSection}
                {...itemProps(link.href)}
                initial="rest"
                animate="rest"
                whileHover={reduce ? undefined : 'hover'}
                whileFocus={reduce ? undefined : 'hover'}
                whileTap={{ scale: 0.96 }}
                style={PILL}
                className={cn(
                  'group relative flex min-h-11 items-center gap-2 px-3 text-sm text-muted-foreground transition-colors hover:text-primary-ink focus-visible:text-primary-ink',
                  focusRing,
                )}
              >
                {pill(link.href, 'bg-primary/10 ring-1 ring-primary/20')}
                <m.span variants={nudge} className="relative inline-flex">
                  <link.icon aria-hidden className="h-4 w-4" />
                </m.span>
                <span className="relative">
                  <RollingLabel text={link.label} />
                </span>
              </m.a>
            </m.li>
          ))}
        </m.ul>
      </LayoutGroup>
    </nav>
  );
}

/** Footer social icons with the same gliding pill, plus a small lift and scale on hover. */
export function FooterSocials({ links }: { links: SocialLink[] }) {
  const { itemProps, pill, clear } = useHoverPill();
  const cascade = useCascade();
  const reduce = useReducedMotion();

  return (
    <LayoutGroup>
      <m.ul {...cascade} onPointerLeave={clear} className="-ml-2 flex items-center gap-1">
        {links.map((social) => (
          <m.li key={social.name} data-reveal="" variants={fadeUp}>
            <SocialItem
              social={social}
              reduce={!!reduce}
              pill={pill(social.name, 'bg-primary/10 ring-1 ring-primary/20')}
              {...itemProps(social.name)}
            />
          </m.li>
        ))}
      </m.ul>
    </LayoutGroup>
  );
}

function SocialItem({
  social,
  reduce,
  pill,
  ...events
}: {
  social: SocialLink;
  reduce: boolean;
  pill: ReactNode;
  onPointerEnter: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <m.a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${social.name} (opens in a new tab)`}
      {...events}
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : 'hover'}
      whileFocus={reduce ? undefined : 'hover'}
      whileTap={{ scale: 0.92 }}
      style={PILL}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary-ink focus-visible:text-primary-ink',
        focusRing,
      )}
    >
      {pill}
      <m.span variants={lift} className="relative inline-flex">
        <social.icon className="h-5 w-5" aria-hidden />
      </m.span>
    </m.a>
  );
}
