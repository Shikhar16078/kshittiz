'use client';

import type { SiteConfig } from '@/lib/site-config';

import { m } from 'motion/react';
import { ArrowRight, Mail } from 'lucide-react';
import { personalData } from '@/lib/data';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import { Button } from '@/components/ui/button';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { Magnetic } from '@/components/motion/magnetic';
import { Shine } from '@/components/motion/shine';
import { Headline } from '@/components/contact/headline';
import { CopyEmail } from '@/components/contact/copy-email';
import { SocialLinks } from '@/components/contact/social-links';
import { InfoRow } from '@/components/contact/info-row';
import { springSnappy } from '@/lib/motion';

export function Contact({ config }: { config: SiteConfig }) {
  const { email, social } = personalData.contact;

  return (
    <SectionWrapper id="contact" glow="left">
      <SectionTitle number="05">Get in Touch</SectionTitle>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center md:gap-12 short:gap-8 shorter:gap-6">
        <div className="flex flex-col items-center gap-5">
          <Headline text="Let's build something great together." accent={2} />
          <Reveal>
            <p className="mx-auto max-w-prose text-base text-muted-foreground md:text-lg">
              Have a role, a project or a hard problem in mind? My inbox is
              open, and I usually reply within a day or two.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <RevealItem className="w-full sm:w-auto">
            <Magnetic strength={0.25} className="w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="relative h-12 w-full overflow-hidden rounded-full px-7 text-base sm:w-auto"
              >
                <m.a
                  href={`mailto:${email}`}
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.97 }}
                >
                  <Shine every={4.5} delay={1.5} />
                  <Mail className="h-5 w-5" aria-hidden />
                  Email me
                  <m.span
                    variants={{ rest: { x: 0 }, hover: { x: 3 } }}
                    transition={springSnappy}
                    className="inline-flex"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </m.span>
                </m.a>
              </Button>
            </Magnetic>
          </RevealItem>
          <RevealItem className="flex w-full justify-center sm:w-auto">
            <CopyEmail email={email} className="w-full justify-between sm:w-auto" />
          </RevealItem>
        </RevealGroup>

        <SocialLinks links={social} />

        <InfoRow
          timezone={config.timezone}
          location={config.location}
          status={config.status}
        />
      </div>
    </SectionWrapper>
  );
}
