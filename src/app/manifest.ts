import type { MetadataRoute } from 'next';
import { personalData } from '@/lib/data';
import { THEME_BACKGROUND } from '@/lib/themes';

// Web app manifest (/manifest.webmanifest): name, colours and icons for "Add to Home Screen" and
// install prompts. Colours are the default theme's background, so the splash screen matches.
export default function manifest(): MetadataRoute.Manifest {
  const [first] = personalData.name.split(' ');
  return {
    name: personalData.name,
    short_name: first,
    description: personalData.tagline,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: THEME_BACKGROUND.dark,
    theme_color: THEME_BACKGROUND.dark,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
