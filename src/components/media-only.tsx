'use client';

import type { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * For layouts that exist in two versions switched by CSS (e.g. the pinned desktop Experience and
 * the stacked phone cards). Both are in the server HTML, so the first paint is right on any screen
 * with no layout swap; right after hydration the version this screen doesn't use is dropped, so its
 * observers, animations and DOM stop costing anything. Crossing the breakpoint (rotating a tablet,
 * resizing a window) brings it back.
 */
export function MediaOnly({ query, children }: { query: string; children: ReactNode }) {
  // True for the server render and hydration, so the HTML always contains both versions.
  return useMediaQuery(query, true) ? children : null;
}
