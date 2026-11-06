import { education, personalData, workExperience } from '@/lib/data';
import { siteUrl } from '@/lib/site-url';

/**
 * JSON-LD for search engines and AI crawlers: the site, the profile page and the person it's
 * about (current role, employer, schools, skills and social profiles), all derived from
 * `data.ts`, so it always matches what the page shows. Rendered once on the home page.
 * Validate with https://validator.schema.org or Google's Rich Results Test.
 */
export function StructuredData() {
  const current = workExperience[0];
  const person = {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: personalData.name,
    url: siteUrl,
    image: `${siteUrl}/images/profile_dark.jpeg`,
    description: personalData.tagline,
    email: `mailto:${personalData.contact.email}`,
    ...(current && {
      jobTitle: current.role,
      worksFor: { '@type': 'Organization', name: current.company },
    }),
    alumniOf: education.map((edu) => ({
      '@type': 'CollegeOrUniversity',
      name: edu.institution,
    })),
    // Case-insensitive de-duplication ("Distributed systems" is both a role and a stack item).
    knowsAbout: [
      ...new Map(
        [...personalData.roles, ...(current?.stack ?? [])].map((s) => [s.toLowerCase(), s]),
      ).values(),
    ],
    sameAs: personalData.contact.social.map((s) => s.url),
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: personalData.name,
        inLanguage: 'en',
        publisher: { '@id': `${siteUrl}/#person` },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/#profile`,
        url: siteUrl,
        name: personalData.name,
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntity: { '@id': `${siteUrl}/#person` },
      },
      person,
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Static data from data.ts, serialised with `<` escaped so no string can close the tag
      // (the pattern recommended in Next's JSON-LD guide).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  );
}
