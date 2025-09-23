'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export function AnimatedGradient({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-r from-primary/50 via-secondary/50 to-accent/50',
        'bg-[length:200%_200%] animate-gradient-move',
        className
      )}
      {...props}
    />
  );
}
