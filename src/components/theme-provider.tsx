'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps,
} from 'next-themes';
import { THEME_BACKGROUND, type ThemeName } from '@/lib/themes';

/**
 * Keeps <meta name="theme-color"> (the phone browser's bar) on the theme actually shown. The
 * static tag from layout.tsx is the default theme's; the saved theme is only known in the browser.
 */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  React.useEffect(() => {
    const color = THEME_BACKGROUND[resolvedTheme as ThemeName];
    if (!color) return;
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute('content', color);
    }
  }, [resolvedTheme]);
  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
