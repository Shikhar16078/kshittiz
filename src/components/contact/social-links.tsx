'use client';

import { m } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { SocialLink } from '@/lib/types';
import { RevealGroup, RevealItem } from '@/components/reveal';
import { springSnappy } from '@/lib/motion';
import { BorderGlow } from '@/components/motion/border-glow';

const hostOf = (url: string) => {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname.replace(/^www\./, '')}${pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
};

// The card lifts, its border lights under the cursor and the arrow nudges toward where the link goes. Hover only fires for mouse and
// pen; on touch the arrow is simply visible, so nothing is lost.
const card = { rest: { y: 0 }, hover: { y: -3, transition: springSnappy } };
const arrow = {
  rest: { x: 0, y: 0, transition: springSnappy },
  hover: { x: 3, y: -3, transition: springSnappy },
};

/** Social profiles as large tappable cards: icon, name, handle and an arrow. */
export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (!links.length) return null;
  return (
    <RevealGroup className="grid w-full gap-3 sm:grid-cols-3">
      {links.map(({ name, url, icon: Icon }) => (
        <RevealItem key={name} className="min-w-0">
          <m.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            variants={card}
            className="group relative flex min-h-16 items-center gap-4 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {/* The border lights up around the cursor (mouse/trackpad); touch keeps the colour change. */}
            <BorderGlow size={200} />
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col text-left">
              <span className="font-headline text-base font-semibold text-foreground">
                {name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {hostOf(url)}
              </span>
            </span>
            <m.span
              variants={arrow}
              className="inline-flex text-muted-foreground transition-colors group-hover:text-primary-ink"
            >
              <ArrowUpRight className="h-5 w-5" aria-hidden />
            </m.span>
            <span className="sr-only">(opens in a new tab)</span>
          </m.a>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
