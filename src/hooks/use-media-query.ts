'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether `query` matches, kept in sync with changes. `serverValue` is used for the server render
 * and hydration, so the first client render always matches the HTML.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}
