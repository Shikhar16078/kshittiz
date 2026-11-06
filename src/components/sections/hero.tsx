'use client';

import type { SiteConfig } from '@/lib/site-config';

import { m, useReducedMotion, type Variants } from 'motion/react';
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { personalData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { HeroPhoto } from '@/components/hero-photo';
import { HeroScrollAway } from '@/components/hero-scroll-away';
import { Aurora } from '@/components/hero/aurora';
import { CompanyStrip } from '@/components/hero/company-strip';
import { HeroName } from '@/components/hero/name';
import { RoleChip } from '@/components/hero/role-chip';
import { ScrambleRole } from '@/components/hero/scramble-role';
import { HeroStats } from '@/components/hero/stats';
import { ScrollCue } from '@/components/hero/scroll-cue';
import { Magnetic } from '@/components/motion/magnetic';
import { Shine } from '@/components/motion/shine';
import { scrollToSection } from '@/lib/scroll-to-section';
import { cn } from '@/lib/utils';
import {
  DURATION,
  EASE_OUT,
  rise,
  springSnappy,
  staggerChildren,
} from '@/lib/motion';

// The photo is the largest image on screen, so it never starts at opacity 0 and is never masked
// (either would delay Largest Contentful Paint): it only settles. The name does the same (see
// HeroName); everything else fades up after them.
const photoSettle: Variants = {
  hidden: { scale: 0.94 },
  show: { scale: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

const focusRing =
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function Hero({ config }: { config: SiteConfig }) {
  // GPU entrance (transform + opacity): it plays while the page is still starting up, when
  // main-thread animation would stutter.
  const fadeUp = rise(useReducedMotion());
  const { status, location, resume } = config;

  return (
    // The header above is sticky and 4rem tall, so the hero fills exactly the rest of the screen.
    // overflow-x-clip: the aurora and glow layers reach past the screen edge; clip them sideways
    // (no scroll container is created, unlike overflow: hidden).
    <section
      id="about"
      className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-x-clip"
    >
      <Aurora />
      <div className="container mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-10 short:pb-6 short:pt-8 shorter:pb-5 shorter:pt-5">
        <HeroScrollAway>
          <m.div
            initial="hidden"
            animate="show"
            variants={staggerChildren(0.09, 0.1)}
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 short:gap-8"
          >
            <m.div
              variants={photoSettle}
              className="flex justify-center lg:order-2"
            >
              <HeroPhoto status={status} />
            </m.div>

            <div className="flex min-w-0 flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
              <HeroName name={personalData.name} />

              <m.div data-reveal="" variants={fadeUp} className="mt-5 max-w-full shorter:mt-3.5">
                <RoleChip />
              </m.div>

              <m.p
                data-reveal=""
                variants={fadeUp}
                className="mt-5 max-w-[41rem] text-[length:clamp(1.0625rem,0.6vw+0.85rem,1.25rem)] leading-relaxed text-foreground/80 short:mt-4 shorter:mt-3"
              >
                {personalData.tagline}
              </m.p>

              <m.div
                data-reveal=""
                variants={fadeUp}
                className="mt-4 flex flex-col items-center gap-x-5 gap-y-2 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start shorter:mt-3"
              >
                <ScrambleRole
                  roles={personalData.roles}
                  className="justify-center text-base sm:text-lg lg:justify-start"
                />
                {location && (
                  <p className="flex items-center gap-1.5 text-[0.9375rem] text-muted-foreground">
                    <MapPin aria-hidden className="h-4 w-4 shrink-0 text-primary-ink" />
                    {location}
                  </p>
                )}
              </m.div>

              <m.div
                data-reveal=""
                variants={fadeUp}
                className="mt-7 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start short:mt-6 shorter:mt-5"
              >
                <div
                  className={cn(
                    'grid w-full gap-3 sm:flex sm:w-auto',
                    resume ? 'grid-cols-2' : 'grid-cols-1',
                  )}
                >
                  <Magnetic className="w-full sm:w-auto">
                    <Button
                      asChild
                      size="lg"
                      className="relative h-12 w-full overflow-hidden rounded-full px-7 text-base sm:w-auto"
                    >
                      <m.a
                        href="#contact"
                        onClick={scrollToSection}
                        whileHover={{ y: -2, transition: springSnappy }}
                        whileTap={{ scale: 0.97 }}
                        className="group"
                      >
                        <Shine every={5} delay={2.2} />
                        Contact Me
                        <ArrowRight
                          aria-hidden
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        />
                      </m.a>
                    </Button>
                  </Magnetic>
                  {resume && (
                    <Magnetic className="w-full sm:w-auto">
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="relative h-12 w-full overflow-hidden rounded-full border-border/80 bg-background/60 px-7 text-base sm:w-auto"
                      >
                        <m.a
                          href={resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ y: -2, transition: springSnappy }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* Offset from Contact Me so the two never sweep together. */}
                          <Shine every={5} delay={3.6} opacity={0.18} />
                          Résumé
                          <ArrowUpRight aria-hidden className="h-4 w-4" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </m.a>
                      </Button>
                    </Magnetic>
                  )}
                </div>
                <ul className="flex items-center gap-1">
                  {personalData.contact.social.map((social) => (
                    <li key={social.name}>
                      <Magnetic strength={0.4}>
                        <m.a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${social.name} (opens in a new tab)`}
                          whileHover={{ scale: 1.1, transition: springSnappy }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'inline-flex h-12 w-12 items-center justify-center rounded-full text-foreground/70 outline-hidden transition-colors hover:bg-accent hover:text-primary-ink',
                            focusRing,
                          )}
                        >
                          <social.icon aria-hidden className="h-6 w-6" />
                        </m.a>
                      </Magnetic>
                    </li>
                  ))}
                </ul>
              </m.div>

              <m.div data-reveal="" variants={fadeUp} className="mt-6 short:mt-5 shorter:mt-4">
                <CompanyStrip className="justify-center lg:justify-start" />
              </m.div>
            </div>
          </m.div>

          <HeroStats
            stats={personalData.stats}
            className="mt-14 lg:mt-[clamp(2rem,9svh-1rem,5rem)]"
          />
        </HeroScrollAway>
      </div>
      {/* Only where there's room to spare under the stats. */}
      <div className="hidden justify-center pb-6 sm:flex [@media(max-height:860px)]:hidden">
        <ScrollCue />
      </div>
    </section>
  );
}
