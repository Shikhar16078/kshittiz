import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { MotionProvider } from '@/components/motion-provider';
import { cn } from '@/lib/utils';
import { personalData, workExperience } from '@/lib/data';
import { siteUrl } from '@/lib/site-url';
import { THEME_BACKGROUND, THEMES } from '@/lib/themes';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Self-hosted at build time: no runtime requests to Google Fonts.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const isProduction = process.env.VERCEL_ENV === 'production';

const [currentRole, ...previous] = personalData.title.split(' | ');
const siteTitle = `${personalData.name} — ${currentRole.replace(/ at .*$/, '')}`;
const siteDescription = `${personalData.name} is a ${currentRole}${
  previous.length ? `, previously at ${previous.join(' and ')}` : ''
}. ${personalData.bio[0].split('. ')[0]}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s — ${personalData.name}`,
  },
  description: siteDescription,
  applicationName: personalData.name,
  authors: [{ name: personalData.name, url: siteUrl }],
  creator: personalData.name,
  alternates: { canonical: '/' },
  // The image comes from app/opengraph-image.tsx; Twitter falls back to it.
  openGraph: {
    type: 'profile',
    url: '/',
    siteName: personalData.name,
    title: siteTitle,
    description: siteDescription,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  // Icons and the manifest come from the file conventions in app/ (favicon.ico, icon.png,
  // apple-icon.png, manifest.ts).
  keywords: [
    personalData.name,
    'software engineer',
    ...personalData.roles,
    ...workExperience.map((job) => job.company),
  ],
  category: 'technology',
  // Production is indexed with large image previews; previews and local builds are not (robots.ts
  // says the same for crawlers that read robots.txt first).
  robots: isProduction
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    : { index: false, follow: false },
  // Stop iOS from turning numbers (years, stats) into phone links.
  formatDetection: { telephone: false, email: false, address: false },
  // Opened from the home screen: a solid status bar, so the sticky header isn't drawn under it.
  appleWebApp: { title: personalData.name.split(' ')[0], statusBarStyle: 'black' },
};

// The default theme's --background, so the browser chrome blends in on first paint (not per OS
// scheme: the default is dark either way). ThemeColorSync updates it to the saved theme.
export const viewport: Viewport = {
  themeColor: THEME_BACKGROUND.dark,
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, spaceGrotesk.variable)}
    >
      <head>
        {/* Reveals start hidden and are animated in by JS; without JS, just show them. */}
        <noscript>
          <style>
            {'[data-reveal]{opacity:1!important;transform:none!important}'}
          </style>
        </noscript>
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          themes={[...THEMES]}
          enableSystem
        >
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
        {/* Vercel Web Analytics and Speed Insights: reported only from Vercel deployments. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
