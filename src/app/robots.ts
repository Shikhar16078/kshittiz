import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

// Only the production deployment is indexed. Preview and development deployments (their own
// *.vercel.app URLs, localhost) tell crawlers to stay out, so duplicates never compete with the
// real site in search results.
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
