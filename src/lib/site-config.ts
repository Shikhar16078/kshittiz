import 'server-only';
import { createClient } from '@vercel/global-config';

// Values that live only in the Vercel Global Config store connected to the project (the
// GLOBAL_CONFIG connection string), so they can change without a deploy. They're read when the
// page is built and on each refresh (see `revalidate` in src/app/page.tsx).
// Each one is optional: if its key is missing or empty, or the store can't be reached, whatever
// it feeds is not rendered at all. There is deliberately no fallback in data.ts.
export type SiteConfig = {
  status?: string; // availability, e.g. "Open to work" (dot on the hero photo)
  location?: string; // e.g. "Seattle, WA" (pin line in the hero and contact section)
  resume?: string; // résumé link, https only (header and hero buttons)
  timezone?: string; // IANA zone, e.g. "America/Los_Angeles" (live local time in contact)
};

const KEYS = [
  'status',
  'location',
  'resume',
  'timezone',
] as const satisfies readonly (keyof SiteConfig)[];

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!process.env.GLOBAL_CONFIG) return {};
  try {
    // force-cache keeps the page static; it's refreshed on the page's revalidate interval.
    const store = createClient(process.env.GLOBAL_CONFIG, {
      cache: 'force-cache',
    });
    const items = await store.getAll<Record<string, unknown>>([...KEYS]);
    const config: SiteConfig = {};
    for (const key of KEYS) {
      const raw = items[key];
      const value = typeof raw === 'string' ? raw.trim() : '';
      if (value) config[key] = value;
    }
    if (config.resume && !isHttpsUrl(config.resume)) delete config.resume;
    if (config.timezone && !isTimeZone(config.timezone)) delete config.timezone;
    return config;
  } catch (error) {
    console.error('Global Config could not be read; its items are hidden', error);
    return {};
  }
}
