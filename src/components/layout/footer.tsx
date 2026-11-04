'use client';

import { m } from 'motion/react';
import { ChevronsUp } from 'lucide-react';
import { personalData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { REVEAL_MARGIN_PAGE_END, springSnappy } from '@/lib/motion';

export function Footer() {
  const scrollToTop = () => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="relative border-t bg-background">
      {/* The footer can never scroll above the default trigger line, so it uses the page end. */}
      <Reveal
        margin={REVEAL_MARGIN_PAGE_END}
        className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8"
      >
        <Button asChild variant="ghost" size="icon">
          <m.button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.92 }}
          >
            <m.span
              variants={{ rest: { y: 0 }, hover: { y: -3 } }}
              transition={springSnappy}
              className="inline-flex"
            >
              <ChevronsUp className="h-6 w-6" />
            </m.span>
          </m.button>
        </Button>
        <p className="text-sm text-muted-foreground">
          &copy;{new Date().getFullYear()} {personalData.name}. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          {personalData.contact.social.map((social) => (
            <m.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              whileHover={{ scale: 1.15, transition: springSnappy }}
              whileTap={{ scale: 0.95 }}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <social.icon className="h-5 w-5" />
            </m.a>
          ))}
        </div>
      </Reveal>
    </footer>
  );
}
