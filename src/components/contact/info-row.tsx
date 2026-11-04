'use client';

import type { ReactNode } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { RevealGroup, RevealItem } from '@/components/reveal';
import { useLocalTime } from '@/components/contact/local-time';
import { LiveDot } from '@/components/live-dot';
import { REVEAL_MARGIN_PAGE_END } from '@/lib/motion';

function Item({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <RevealItem className="flex min-h-11 items-center gap-2.5 rounded-full border border-border bg-card/50 px-4 text-sm text-muted-foreground">
      {icon}
      <span className="text-foreground">{children}</span>
    </RevealItem>
  );
}

/** Local time, location and availability from the site config; each only when set. */
export function InfoRow({
  timezone,
  location,
  status,
}: {
  timezone?: string;
  location?: string;
  status?: string;
}) {
  const time = useLocalTime(timezone);
  if (!timezone && !location && !status) return null;

  return (
    // The last row of a screen-sized section: it may sit below the usual trigger line.
    <RevealGroup
      margin={REVEAL_MARGIN_PAGE_END}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {status && (
        <Item icon={<LiveDot className="size-2.5" />}>
          <span className="sr-only">Status: </span>
          {status}
        </Item>
      )}
      {location && (
        <Item icon={<MapPin className="h-4 w-4 text-primary" aria-hidden />}>
          <span className="sr-only">Based in </span>
          {location}
        </Item>
      )}
      {/* Rendered after mount only, so the server and client markup always match. */}
      {timezone && time && (
        <Item icon={<Clock className="h-4 w-4 text-primary" aria-hidden />}>
          <span className="sr-only">Local time: </span>
          <time className="tabular-nums">{time}</time>
        </Item>
      )}
    </RevealGroup>
  );
}
