import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
      // Image sitemap entry: helps the profile photo show up in image search.
      images: [`${siteUrl}/images/profile_dark.jpeg`],
    },
  ];
}
