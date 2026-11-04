import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Skills } from '@/components/sections/skills';
import { Experience } from '@/components/sections/experience';
import { Education } from '@/components/sections/education';
import { Projects } from '@/components/sections/projects';
import { Contact } from '@/components/sections/contact';
import { getSiteConfig } from '@/lib/site-config';

// Prerendered, and rebuilt in the background at most once a minute so Global Config edits
// (status, location, résumé, timezone) show up without a deploy.
export const revalidate = 60;

export default async function Home() {
  const config = await getSiteConfig();
  return (
    <div className="flex min-h-screen flex-col">
      <Header config={config} />
      <main className="grow">
        <Hero config={config} />
        <Experience />
        <Skills />
        <Projects />
        <Education />
        <Contact config={config} />
      </main>
      <Footer />
    </div>
  );
}
