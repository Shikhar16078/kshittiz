'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AnimatePresence, m } from 'motion/react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DURATION, EASE_OUT } from '@/lib/motion';

export function ThemeToggleButton() {
  const { setTheme, resolvedTheme } = useTheme();
  // The theme is only known in the browser; until then render an empty slot of the same size.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <AnimatePresence mode="wait" initial={false}>
            {mounted && (
              <m.span
                key={resolvedTheme}
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{
                  rotate: 0,
                  scale: 1,
                  opacity: 1,
                  transition: { duration: DURATION.base, ease: EASE_OUT },
                }}
                exit={{
                  rotate: 90,
                  scale: 0,
                  opacity: 0,
                  transition: { duration: DURATION.fast },
                }}
                className="inline-flex"
              >
                <Icon className="h-[1.2rem] w-[1.2rem]" />
              </m.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('fresh')}>
          Fresh
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
