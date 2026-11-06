import { workExperience } from '@/lib/data';
import { SectionWrapper } from '@/components/layout/section-wrapper';
import { PinnedStory } from '@/components/experience/pinned-story';
import { StackedStory } from '@/components/experience/stacked-story';
import { MediaOnly } from '@/components/media-only';

/**
 * Experience as an impact-first scroll story. From `lg` the stage pins under the header while the
 * page scrolls through one chapter per role; below `lg` the roles are stacked cards. Both are
 * rendered and switched by CSS, so the server HTML is already right for the screen (no layout
 * swap after hydration); the hidden one is `display: none` and out of the accessibility tree, and
 * `MediaOnly` drops it after hydration so it costs nothing.
 *
 * The wrapper's padding is dropped from `lg` so the pinned track starts at the section top (a nav
 * jump lands with the whole stage framed), and `overflow-clip` replaces `overflow-hidden`, which
 * would make the section a scroll container and stop `position: sticky` from pinning.
 */
export function Experience() {
  return (
    <SectionWrapper
      id="experience"
      glow="left"
      className="justify-start overflow-clip lg:py-0!"
    >
      <MediaOnly query="(min-width: 1024px)">
        <PinnedStory jobs={workExperience} />
      </MediaOnly>
      <MediaOnly query="(max-width: 1023.98px)">
        <StackedStory jobs={workExperience} />
      </MediaOnly>
    </SectionWrapper>
  );
}
