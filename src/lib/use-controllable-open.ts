'use client';

import { useCallback, useState } from 'react';

/**
 * Open state for Radix roots that works controlled or uncontrolled. The UI wrappers need to know
 * whether they're open so Motion's AnimatePresence can play the exit before Radix unmounts.
 */
export function useControllableOpen(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  return [open, setOpen] as const;
}
