// Canonical origin for metadata, the sitemap and robots.txt. Vercel sets the production domain
// at build time; everywhere else (local dev, `next start`) it falls back to the dev server.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:9002';
