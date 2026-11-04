'use client';

import type { SiteConfig } from '@/lib/site-config';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type Transition,
  type Variants,
} from 'motion/react';
import { Menu, FileText, FileDown } from 'lucide-react';
import { navLinks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { scrollToSection } from '@/lib/scroll-to-section';
import {
  DURATION,
  EASE_OUT,
  RISE,
  springSnappy,
  staggerChildren,
} from '@/lib/motion';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { MotionButton } from '@/components/ui/motion-button';
import {
  ThemeSwitcherRow,
  ThemeToggleButton,
} from '@/components/ui/theme-toggle-button';
import { SummaryDialog } from '@/components/sections/summary-dialog';
import { Magnetic } from '@/components/motion/magnetic';

type NavigateHandler = (e: React.MouseEvent<HTMLAnchorElement>) => void;

const focusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Tracks which section is under the middle of the screen. */
function useActiveSection() {
  const [active, setActive] = useState(navLinks[0]?.href ?? '');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const link of navLinks) {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return active;
}

// Scroll distance (px) in one direction before the header hides / comes back. Accumulated, so a
// slow scroll still counts, while jitter from momentum or rubber-banding doesn't.
const HIDE_AFTER = 24;
const SHOW_AFTER = 12;
/** Always shown this close to the top. */
const TOP_ZONE = 96;
// Input that means the user is scrolling by hand again (ends the pin set by a nav click).
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

const slide: Transition = { type: 'spring', stiffness: 420, damping: 42, mass: 0.8 };

/**
 * True while the header should be tucked away: scrolling down past the top zone. Only flips on a
 * direction change, so it's a handful of renders, not one per scroll frame.
 */
function useHideOnScroll() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);
  const travel = useRef(0);
  // Set by a nav click: the jump (and the settled section) keeps the header shown, so the section
  // top stays framed under it (scroll-margin-top: 4rem) instead of leaving a 64 px gap. It's
  // released by the next real user input, not a timer, since smooth scrolls vary in length.
  const pinned = useRef(false);
  // True while a region marked `data-keep-header` (the pinned Experience story) is on screen:
  // tucking the nav away there made the long pinned track feel like a trap with no way out.
  const keep = useRef(false);

  useEffect(() => {
    const regions = document.querySelectorAll('[data-keep-header]');
    if (!regions.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      keep.current = visible.size > 0;
      if (keep.current) setHidden(false);
    });
    regions.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 10);
    const delta = y - last.current;
    last.current = y;
    // Reset the run whenever the direction flips.
    travel.current =
      Math.sign(delta) === Math.sign(travel.current) ? travel.current + delta : delta;

    if (y < TOP_ZONE || pinned.current || keep.current) setHidden(false);
    else if (travel.current > HIDE_AFTER) setHidden(true);
    else if (travel.current < -SHOW_AFTER) setHidden(false);
  });

  useEffect(() => {
    last.current = window.scrollY;
    setScrolled(window.scrollY > 10);
    const release = () => {
      pinned.current = false;
    };
    for (const type of USER_SCROLL_EVENTS) {
      window.addEventListener(type, release, { passive: true, capture: true });
    }
    return () => {
      for (const type of USER_SCROLL_EVENTS) {
        window.removeEventListener(type, release, { capture: true });
      }
    };
  }, []);

  const pin = () => {
    pinned.current = true;
    travel.current = 0;
    setHidden(false);
  };

  return { hidden, setHidden, scrolled, pin };
}

function DesktopNav({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: NavigateHandler;
}) {
  // Hovered or keyboard-focused item: its label expands alongside the active one's.
  const [peek, setPeek] = useState<string | null>(null);

  return (
    <LayoutGroup id="desktop-nav">
      <nav
        aria-label="Sections"
        className="hidden items-center gap-0.5 md:flex"
        onPointerLeave={() => setPeek(null)}
      >
        {navLinks.map((link) => {
          const isActive = link.href === active;
          const expanded = isActive || peek === link.href;
          return (
            // `layout` (a transform-based FLIP) lets each pill grow and its neighbours make room
            // without animating width.
            <m.a
              key={link.href}
              layout
              transition={springSnappy}
              href={link.href}
              onClick={onNavigate}
              onPointerEnter={() => setPeek(link.href)}
              onFocus={() => setPeek(link.href)}
              onBlur={() => setPeek((p) => (p === link.href ? null : p))}
              aria-current={isActive ? 'true' : undefined}
              style={{ borderRadius: 9999 }}
              className={cn(
                'relative flex h-10 items-center px-[11px] text-sm font-medium transition-colors',
                focusRing,
                isActive ? 'text-primary-ink' : 'text-foreground/70 hover:text-foreground',
              )}
            >
              {/* One highlight that slides to whichever section is in view. */}
              {isActive && (
                <m.span
                  layoutId="nav-active"
                  transition={springSnappy}
                  style={{ borderRadius: 9999 }}
                  className="absolute inset-0 bg-primary/10 ring-1 ring-primary/20"
                />
              )}
              <m.span layout="position" className="relative flex">
                <link.icon aria-hidden className="h-[18px] w-[18px]" />
              </m.span>
              {/* popLayout takes a leaving label out of the flow at once, so the pill shrinks
                  while the label fades instead of after. */}
              <AnimatePresence mode="popLayout" initial={false}>
                {expanded ? (
                  <m.span
                    key="label"
                    layout="position"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { duration: DURATION.fast, ease: EASE_OUT },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="relative whitespace-nowrap pl-1.5"
                  >
                    {link.label}
                  </m.span>
                ) : (
                  <span key="sr" className="sr-only">
                    {link.label}
                  </span>
                )}
              </AnimatePresence>
            </m.a>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}

const mobileLink: Variants = {
  hidden: { opacity: 0, x: RISE },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Mobile menu links slide in one after another each time the menu opens. */
function MobileNav({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: NavigateHandler;
}) {
  return (
    <m.nav
      aria-label="Sections"
      initial="hidden"
      animate="show"
      variants={staggerChildren(0.05, 0.15)}
      className="mt-6 flex flex-col gap-1"
    >
      {navLinks.map((link) => {
        const isActive = link.href === active;
        return (
          <m.a
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            variants={mobileLink}
            whileTap={{ scale: 0.98 }}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-lg font-medium transition-colors',
              focusRing,
              isActive ? 'text-primary-ink' : 'text-foreground/80 hover:text-foreground',
            )}
          >
            {isActive && (
              <m.span
                layoutId="mobile-nav-active"
                transition={springSnappy}
                className="absolute inset-0 rounded-xl bg-primary/10"
              />
            )}
            <link.icon aria-hidden className="relative h-5 w-5" />
            <span className="relative">{link.label}</span>
          </m.a>
        );
      })}
    </m.nav>
  );
}

/** Thin bar along the bottom of the header that fills as the page scrolls. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  return (
    <m.div
      aria-hidden
      style={{ scaleX }}
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
    />
  );
}

function ResumeLink({ href, className }: { href: string; className?: string }) {
  return (
    <MotionButton
      asChild
      className={cn('h-11 gap-2 rounded-full px-4', className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <FileDown aria-hidden className="h-4 w-4" />
        Résumé
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </MotionButton>
  );
}

const sheetFooter: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT, delay: 0.3 },
  },
};

export function Header({ config }: { config: SiteConfig }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const active = useActiveSection();
  const reduce = useReducedMotion();
  const { hidden, setHidden, scrolled, pin } = useHideOnScroll();

  // Never tucked away while something in it is open or focused; with reduced motion it stays put.
  const tucked = hidden && !reduce && !isSheetOpen && !isMenuOpen;

  const handleLinkClick: NavigateHandler = (e) => {
    scrollToSection(e);
    pin();
    setIsSheetOpen(false);
  };

  return (
    <m.header
      data-site-header
      initial={false}
      animate={{ y: tucked ? '-100%' : 0 }}
      transition={slide}
      // Keyboard users tabbing into a tucked-away header get it back.
      onFocusCapture={() => setHidden(false)}
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-[background-color,border-color] duration-300',
        scrolled
          ? 'border-border bg-background/80 backdrop-blur-xs'
          : 'border-transparent bg-transparent',
      )}
    >
      {/* Equal flex-1 sides keep the nav centred however wide the two groups are. */}
      <div className="container mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-start">
          <SummaryDialog>
            <MotionButton
              feel="pop"
              variant="ghost"
              className="size-11 gap-2 rounded-full p-0 md:w-auto md:px-3"
            >
              <FileText aria-hidden className="h-5 w-5" />
              {/* The accessible name on phones (icon only), the visible label from md. */}
              <span className="sr-only md:not-sr-only">Summary</span>
            </MotionButton>
          </SummaryDialog>
        </div>

        <DesktopNav active={active} onNavigate={handleLinkClick} />

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          {config.resume && (
            <Magnetic strength={0.25} className="hidden md:inline-flex">
              <ResumeLink href={config.resume} />
            </Magnetic>
          )}

          <ThemeToggleButton onOpenChange={setIsMenuOpen} />

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <MotionButton
                  feel="pop"
                  variant="ghost"
                  size="icon"
                  className="size-11 rounded-full"
                >
                  <Menu aria-hidden className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </MotionButton>
              </SheetTrigger>
              <SheetContent aria-describedby={undefined} className="overflow-y-auto">
                <SheetTitle className="flex h-11 items-center pr-12 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Menu
                </SheetTitle>
                <MobileNav active={active} onNavigate={handleLinkClick} />

                <m.div
                  initial="hidden"
                  animate="show"
                  variants={sheetFooter}
                  className="mt-auto flex flex-col gap-3 border-t pt-6"
                >
                  <div className="flex gap-2">
                    <SummaryDialog>
                      <MotionButton
                        variant="outline"
                        className="h-12 flex-1 gap-2 rounded-full"
                      >
                        <FileText aria-hidden className="h-4 w-4" />
                        Summary
                      </MotionButton>
                    </SummaryDialog>
                    {config.resume && (
                      <ResumeLink href={config.resume} className="h-12 flex-1" />
                    )}
                  </div>
                  <ThemeSwitcherRow />
                </m.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <ScrollProgress />
    </m.header>
  );
}
