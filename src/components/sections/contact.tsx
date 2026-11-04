'use client';

import { m } from 'motion/react';
import { Mail } from 'lucide-react';
import { personalData } from '@/lib/data';
import {
  SectionWrapper,
  SectionTitle,
} from '@/components/layout/section-wrapper';
import { Button } from '@/components/ui/button';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { springSnappy } from '@/lib/motion';

export function Contact() {
  return (
    <SectionWrapper id="contact" className="bg-card">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="mx-auto max-w-lg text-center">
        <Reveal>
          <p className="mt-4 text-lg text-muted-foreground">
            Have an interesting idea or just want to say hi?
          </p>
        </Reveal>
        <RevealGroup className="mt-8 flex flex-col items-center gap-6">
          <RevealItem>
            <Button asChild size="lg">
              <m.a
                href={`mailto:${personalData.contact.email}`}
                whileHover={{ y: -2, transition: springSnappy }}
                whileTap={{ scale: 0.97 }}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Me
              </m.a>
            </Button>
          </RevealItem>
          <div className="flex items-center gap-6">
            {personalData.contact.social.map((social) => (
              <RevealItem key={social.name}>
                <Button
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
                    <social.icon className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
                  </m.a>
                </Button>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </SectionWrapper>
  );
}
