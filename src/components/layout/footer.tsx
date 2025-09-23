'use client';

import { personalData } from '@/lib/data';
import { ChevronsUp } from 'lucide-react';
import { Button } from '../ui/button';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="group"
        >
          <ChevronsUp className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
        </Button>
        <p className="text-sm text-muted-foreground">
          &copy;{new Date().getFullYear()} {personalData.name}. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          {personalData.contact.social.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <social.icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
