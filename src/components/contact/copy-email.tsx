'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Check, Copy } from 'lucide-react';
import { DURATION, EASE_IN, EASE_OUT, springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';

type State = 'idle' | 'copied' | 'failed';

const RESET_MS = 2000;

// The icons swap with a small rotate-and-scale, so the change reads as one morphing glyph.
const iconSwap = {
  initial: { opacity: 0, scale: 0.5, rotate: -45 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { ...springSnappy },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    rotate: 45,
    transition: { duration: DURATION.fast, ease: EASE_IN },
  },
};

/**
 * Shows the address and copies it on click. If the Clipboard API is missing or refused
 * (insecure context, permissions), the address is selected instead so it can be copied by hand.
 */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const [state, setState] = useState<State>('idle');
  const textRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const settle = (next: State) => {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), RESET_MS);
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unavailable');
      await navigator.clipboard.writeText(email);
      settle('copied');
    } catch {
      const el = textRef.current;
      const selection = window.getSelection();
      if (el && selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      settle('failed');
    }
  };

  const copied = state === 'copied';
  const label =
    state === 'copied' ? 'Copied' : state === 'failed' ? 'Selected' : 'Copy';

  return (
    <>
      <m.button
        type="button"
        onClick={copy}
        whileHover={{ y: -2, transition: springSnappy }}
        whileTap={{ scale: 0.97 }}
        aria-label={`Copy email address ${email}`}
        className={cn(
          'group inline-flex min-h-12 max-w-full items-center gap-3 rounded-full border border-border bg-card/60 py-2 pl-5 pr-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      >
        <span ref={textRef} className="min-w-0 truncate select-all">
          {email}
        </span>
        <span
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs transition-colors',
            copied
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground group-hover:text-primary-ink',
          )}
        >
          <span className="relative inline-flex h-4 w-4">
            <AnimatePresence initial={false}>
              <m.span
                key={copied ? 'check' : 'copy'}
                variants={iconSwap}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 inline-flex"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
              </m.span>
            </AnimatePresence>
          </span>
          <AnimatePresence initial={false} mode="wait">
            <m.span
              key={label}
              initial={{ opacity: 0, y: 4 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: DURATION.fast, ease: EASE_OUT },
              }}
              exit={{
                opacity: 0,
                y: -4,
                transition: { duration: 0.12, ease: EASE_IN },
              }}
              aria-hidden
              className="inline-block w-14 text-left"
            >
              {label}
            </m.span>
          </AnimatePresence>
        </span>
      </m.button>
      {/* Outside the button: its aria-label would otherwise mask the announcement. */}
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied'
          ? 'Email address copied to clipboard'
          : state === 'failed'
            ? 'Copying is unavailable; the address is selected so you can copy it'
            : ''}
      </span>
    </>
  );
}
