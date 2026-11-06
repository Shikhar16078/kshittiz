'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * True on mouse/trackpad devices. Pointer-driven effects (tilt, magnetic, spotlight) and
 * scroll-linked JS movement are limited to these: on touch screens they either can't trigger
 * or lag behind native scrolling. False during server render and hydration.
 */
export function useFinePointer() {
  return useMediaQuery(FINE_POINTER_QUERY);
}
