// The theme list, shared by the server layout and the client theme code (no browser APIs here).

/** Themes, set as a class on <html> by next-themes. Adding one: see CLAUDE.md (Theme). */
export const THEMES = ['dark', 'light', 'rose', 'emerald', 'sapphire'] as const;
export type ThemeName = (typeof THEMES)[number];

/**
 * Each theme's --background as hex (keep in sync with globals.css), for places that can't read
 * CSS variables: the browser's theme-color and the theme menu's swatches.
 */
export const THEME_BACKGROUND: Record<ThemeName, string> = {
  dark: '#09090b',
  light: '#f8f7f7',
  rose: '#0b090a',
  emerald: '#080c0b',
  sapphire: '#0c101d',
};
