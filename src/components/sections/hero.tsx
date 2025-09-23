'use client';

import Image from 'next/image';
import { personalData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Hero() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const profileImage =
    isMounted && theme === 'dark'
      ? '/images/profile_dark.jpeg'
      : '/images/profile.jpg';

  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-primary">{personalData.name}</span>
            </h1>
            <div className="mt-2">
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
            </div>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              {personalData.bio[0]}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="w-auto px-8">
                <Link href="#contact">Contact Me</Link>
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
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <social.icon className="h-6 w-6 text-foreground/70 transition-colors hover:text-primary" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative h-80 w-80">
              {isMounted && (
                <Image
                  src={profileImage}
                  alt="Profile Photo"
                  width={400}
                  height={400}
                  priority
                  className="relative h-full w-full rounded-full object-cover animate-breathing-neon"
                  data-ai-hint="professional headshot"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
