'use client';

import { SectionWrapper, SectionTitle } from '../layout/section-wrapper';
import { Button } from '@/components/ui/button';
import { personalData } from '@/lib/data';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export function Contact() {
  const recipientEmail = 'kshittiz.k@gmail.com';

  return (
    <SectionWrapper id="contact" className="bg-card">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="mx-auto max-w-lg text-center">
        <p className="mt-4 text-lg text-muted-foreground">
          Have an interesting idea or just want to say hi?
        </p>
        <div className="mt-8 flex flex-col items-center gap-6">
          <Button asChild size="lg">
            <a href={`mailto:${recipientEmail}`}>
              <Mail className="mr-2 h-5 w-5" />
              Email Me
            </a>
          </Button>
          <div className="flex items-center gap-6">
            {personalData.contact.social.map((social) => (
              <Button
                key={social.name}
                asChild
                variant="ghost"
                size="icon"
                className="h-12 w-12"
              >
                <Link
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
