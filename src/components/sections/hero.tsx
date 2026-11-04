'use client';

import Image from 'next/image';
import { m, type Variants } from 'motion/react';
import { personalData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { HeroPhoto } from '@/components/hero-photo';
import { HeroScrollAway } from '@/components/hero-scroll-away';
import { scrollToSection } from '@/lib/scroll-to-section';
import {
  DURATION,
  EASE_OUT,
  fadeUp,
  RISE,
  springSnappy,
  staggerChildren,
} from '@/lib/motion';

// The name and photo are the largest elements on screen, so they never start at opacity 0
// (that would delay Largest Contentful Paint): they only settle into place. Everything else
// fades up after them, one after another.
const settle: Variants = {
  hidden: { y: RISE },
  show: { y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

const photoSettle: Variants = {
  hidden: { scale: 0.94 },
  show: { scale: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

export function Hero() {
  return (
    <section id="about" className="flex min-h-svh flex-col py-16 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroScrollAway>
          <m.div
            initial="hidden"
            animate="show"
            variants={staggerChildren(0.09, 0.1)}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
          >
            <div className="order-2 lg:order-1">
              <m.h1
                variants={settle}
                className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              >
                <span className="text-primary">{personalData.name}</span>
              </m.h1>
              <m.div data-reveal="" variants={fadeUp} className="mt-2">
                <h2 className="flex flex-wrap items-center gap-2 font-headline text-2xl font-medium text-foreground/80 sm:text-3xl">
                  Senior Software Engineer @
                  <span className="inline-flex items-center gap-1">
                    <span className="whitespace-nowrap">Microsoft</span>
                    <Image
                      src="/images/microsoft.png"
                      alt="Microsoft logo"
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                    />
                  </span>
                </h2>
                <p className="font-headline text-xl text-foreground/70">
                  FactSet | PayPal | Aricent (Capgemini)
                </p>
              </m.div>
              <m.p
                data-reveal=""
                variants={fadeUp}
                className="mt-6 max-w-xl text-lg text-foreground/70"
              >
                {personalData.bio[0]}
              </m.p>
              <m.div
                data-reveal=""
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Button asChild size="lg" className="w-auto px-8">
                  <m.a
                    href="#contact"
                    onClick={scrollToSection}
                    whileHover={{ y: -2, transition: springSnappy }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Contact Me
                  </m.a>
                </Button>
                <div className="flex items-center gap-4">
                  {personalData.contact.social.map((social) => (
                    <Button
                      key={social.name}
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <m.a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        whileHover={{ scale: 1.1, transition: springSnappy }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <social.icon className="h-6 w-6 text-foreground/70 transition-colors hover:text-primary" />
                      </m.a>
                    </Button>
                  ))}
                </div>
              </m.div>
            </div>
            <m.div
              variants={photoSettle}
              className="order-1 flex justify-center lg:order-2 lg:justify-end"
            >
              <HeroPhoto />
            </m.div>
          </m.div>
        </HeroScrollAway>
      </div>
    </section>
  );
}
