
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { navLinks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Menu, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { ThemeToggleButton } from '../ui/theme-toggle-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SummaryDialog } from '../sections/summary-dialog';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetId = e.currentTarget.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      if (targetId === '#about') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setIsSheetOpen(false);
  };

  const NavLinkItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) =>
        mobile ? (
          <a
            key={link.href}
            href={link.href}
            onClick={handleLinkClick}
            className="flex items-center gap-2 text-lg font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </a>
        ) : (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <a
                href={link.href}
                onClick={handleLinkClick}
                className="flex items-center rounded-md p-2 text-foreground/70 transition-colors hover:bg-accent hover:text-primary"
              >
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.label}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{link.label}</p>
            </TooltipContent>
          </Tooltip>
        )
      )}
    </>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b bg-background/80 backdrop-blur-sm'
          : 'bg-transparent'
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

          <nav className="hidden items-center gap-1 md:flex">
            <NavLinkItems />
          </nav>

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
                <SheetContent side="right">
                  <nav className="mt-8 flex flex-col gap-6">
                    <NavLinkItems mobile />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
}
