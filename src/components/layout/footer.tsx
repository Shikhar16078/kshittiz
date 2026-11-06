'use client';

import { personalData, navLinks } from '@/lib/data';
import { Reveal } from '@/components/reveal';
import { BackToTop } from '@/components/footer/back-to-top';
import { Wordmark } from '@/components/footer/wordmark';
import { FooterNav, FooterSocials } from '@/components/footer/nav-links';
import { REVEAL_MARGIN_PAGE_END } from '@/lib/motion';

export function Footer() {
  const { name, contact } = personalData;

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 pt-12 sm:px-6 md:pt-16 lg:px-8">
        {/* The footer can never scroll above the default trigger line, so it uses the page end. */}
        <Reveal
          margin={REVEAL_MARGIN_PAGE_END}
          className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between"
        >
          <FooterNav links={navLinks} />

          <div className="flex items-center justify-between gap-4 md:justify-end">
            <FooterSocials links={contact.social} />
            <BackToTop />
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-2 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <p>Designed &amp; built by {name.split(' ')[0]}.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Wordmark text={name} />
      </div>
    </footer>
  );
}
