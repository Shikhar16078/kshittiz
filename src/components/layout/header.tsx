'use client';

import { useEffect, useState } from 'react';
import {
  m,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type Variants,
} from 'motion/react';
import { Menu, FileText } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SummaryDialog } from '@/components/sections/summary-dialog';

type NavigateHandler = (e: React.MouseEvent<HTMLAnchorElement>) => void;

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

function DesktopNav({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: NavigateHandler;
}) {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => {
        const isActive = link.href === active;
        return (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <a
                href={link.href}
                onClick={onNavigate}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative flex items-center rounded-md p-2 transition-colors hover:text-primary',
                  isActive ? 'text-primary' : 'text-foreground/70',
                )}
              >
                {/* One highlight that slides to whichever section is in view. */}
                {isActive && (
                  <m.span
                    layoutId="nav-active"
                    transition={springSnappy}
                    className="absolute inset-0 rounded-md bg-accent"
                  />
                )}
                <link.icon className="relative h-5 w-5" />
                <span className="sr-only">{link.label}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{link.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
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
      initial="hidden"
      animate="show"
      variants={staggerChildren(0.05, 0.15)}
      className="mt-8 flex flex-col gap-2"
    >
      {navLinks.map((link) => {
        const isActive = link.href === active;
        return (
          <m.a
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            variants={mobileLink}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:text-primary',
              isActive ? 'text-primary' : 'text-foreground/70',
            )}
          >
            {isActive && (
              <m.span
                layoutId="mobile-nav-active"
                transition={springSnappy}
                className="absolute inset-0 rounded-lg bg-primary/10"
              />
            )}
            <link.icon className="relative h-5 w-5" />
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

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const active = useActiveSection();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setIsScrolled(y > 10));
  useEffect(() => setIsScrolled(window.scrollY > 10), []);

  const handleLinkClick: NavigateHandler = (e) => {
    scrollToSection(e);
    setIsSheetOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-[background-color,border-color] duration-300',
        isScrolled
          ? 'border-border bg-background/80 backdrop-blur-xs'
          : 'border-transparent bg-transparent',
      )}
    >
      <TooltipProvider>
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SummaryDialog>
            <Button variant="ghost">
              <FileText className="mr-2 h-5 w-5" />
              Summary
            </Button>
          </SummaryDialog>

          <DesktopNav active={active} onNavigate={handleLinkClick} />

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent aria-describedby={undefined}>
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <MobileNav active={active} onNavigate={handleLinkClick} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </TooltipProvider>
      <ScrollProgress />
    </header>
  );
}
