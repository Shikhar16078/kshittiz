'use client';

import type { ComponentProps } from 'react';
import { m } from 'motion/react';
import { hoverLift } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Lifts its card a little under the mouse (Motion's hover never fires for touch). */
export function HoverLift({
  className,
  ...props
}: ComponentProps<typeof m.div>) {
  return (
    <m.div
      whileHover={hoverLift}
      className={cn('h-full', className)}
      {...props}
    />
  );
}
