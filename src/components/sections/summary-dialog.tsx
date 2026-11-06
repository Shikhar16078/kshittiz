'use client';

import { m } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { personalData } from '@/lib/data';
import { fadeUp, staggerChildren } from '@/lib/motion';
import { MotionButton } from '@/components/ui/motion-button';

// Opened only from JS, so the hidden start state needs no data-reveal.
const content = staggerChildren(0.06, 0.12);

export function SummaryDialog({ children }: { children: React.ReactNode }) {
  const initials = personalData.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <m.div
          initial="hidden"
          animate="show"
          variants={content}
          className="flex flex-col gap-5 pt-2 sm:pt-0"
        >
          <m.div variants={fadeUp} className="flex items-center gap-4 pr-10">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-headline text-lg font-bold text-primary-ink"
            >
              {initials}
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="font-headline text-2xl leading-tight">
                {personalData.name}
              </DialogTitle>
              <DialogDescription className="text-sm leading-snug">
                {personalData.title}
              </DialogDescription>
            </div>
          </m.div>

          <m.div
            variants={fadeUp}
            aria-hidden
            className="h-px w-full bg-linear-to-r from-primary/50 via-border to-transparent"
          />

          {personalData.bio.map((paragraph, i) => (
            <m.p
              key={i}
              variants={fadeUp}
              className="max-w-prose text-[15px] leading-relaxed text-muted-foreground sm:text-base"
            >
              {paragraph}
            </m.p>
          ))}

          <m.div variants={fadeUp} className="flex justify-end pt-1">
            <DialogClose asChild>
              <MotionButton
                type="button"
                variant="secondary"
                className="h-11 w-full rounded-full sm:w-auto sm:px-6"
              >
                Close
              </MotionButton>
            </DialogClose>
          </m.div>
        </m.div>
      </DialogContent>
    </Dialog>
  );
}
