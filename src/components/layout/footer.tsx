'use client';

import { personalData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/profile.jpg"
            alt="Kshittiz profile photo"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-headline text-lg font-bold">Kshittiz Kumar</span>
        </Link>
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
