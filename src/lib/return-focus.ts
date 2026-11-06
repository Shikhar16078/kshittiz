import { useRef } from 'react';

type AutoFocusHandler = (event: Event) => void;

/**
 * Radix dialogs hand focus back to the button that opened them, but without `preventScroll`.
 * For a button in the sticky header the browser then scrolls the page to "reveal" it, so closing
 * a dialog or sheet could jump the page. This keeps the focus return for keyboard and
 * screen-reader users but stops the scroll. A handler passed by the caller runs first and can
 * take over by calling `event.preventDefault()`.
 */
export function useReturnFocusWithoutScroll(
  onOpenAutoFocus?: AutoFocusHandler,
  onCloseAutoFocus?: AutoFocusHandler,
) {
  const opener = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (event: Event) => {
      // Radix fires this before moving focus in, so the active element is still the opener.
      opener.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      const el = opener.current;
      opener.current = null;
      if (el?.isConnected) el.focus({ preventScroll: true });
    },
  };
}
