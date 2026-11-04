import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// Static site: everything is served from our own origin.
// 'unsafe-inline' for scripts is required by Next.js hydration and the
// next-themes anti-flash script on a statically rendered page (nonces
// would force dynamic rendering). External scripts are still blocked.
const contentSecurityPolicy = [
  "default-src 'self'",
  // In development the Vercel Analytics/Speed Insights debug scripts load from their CDN;
  // in production they're served from this origin (/_vercel/*).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  // Don't generate AGENTS.md on `next dev`; CLAUDE.md covers it.
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
