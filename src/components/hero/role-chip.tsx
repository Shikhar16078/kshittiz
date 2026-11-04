'use client';

import Image from 'next/image';
import { workExperience } from '@/lib/data';
import { LiveDot } from '@/components/live-dot';
import { cn } from '@/lib/utils';

const current = workExperience[0];

/**
 * The current role as a compact chip under the name: a live dot, the title and the company with
 * its logo. Static apart from the dot's ping (which runs only on screen, never with reduced motion).
 */
export function RoleChip({ className }: { className?: string }) {
  if (!current) return null;
  return (
    <h2
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1.5 pl-3 pr-2 font-headline text-sm font-medium text-foreground/90 shadow-sm sm:gap-2.5 sm:text-base',
        className,
      )}
    >
      <LiveDot className="size-2" />
      <span className="whitespace-nowrap">{current.role}</span>
      <span aria-hidden className="text-muted-foreground">
        ·
      </span>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-background/70 py-0.5 pl-1 pr-2.5">
        {current.logo && (
          <Image
            src={current.logo}
            alt=""
            width={20}
            height={20}
            className="size-4 object-contain sm:size-[1.125rem]"
          />
        )}
        {current.company}
      </span>
    </h2>
  );
}
