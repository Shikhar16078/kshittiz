# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git rules

- **Never commit unless the user explicitly asks for a commit.** Finishing a task, passing a build or being told to "make changes" is not a request to commit. Leave changes in the working tree and say they are uncommitted.
- Never push, force-push, rebase or amend unless the user asks for that specific action.
- When asked to commit, group changes into logical commits and use [Conventional Commits](https://www.conventionalcommits.org/) messages: `type(scope): imperative summary` (≤ 72 chars), a blank line, then a body explaining what changed and why.
- Day-to-day work happens on the `Development` branch, which tracks `origin/Development`. `main` is the release branch.

## Commands

```bash
npm run dev        # dev server on http://localhost:9002 (Turbopack)
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

There are no tests and no linter configured. Verify changes with `npm run typecheck` and `npm run build`.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI primitives in the shadcn/ui pattern, Embla Carousel, next-themes, lucide-react, Motion, and Vercel Analytics, Speed Insights and Global Config. Deployed on Vercel.

Next 16 has breaking changes from older versions. Before writing Next.js code, read the matching guide in `node_modules/next/dist/docs/` and heed deprecation notices (e.g. `next/image` uses `preload`, not `priority`). `agentRules: false` in `next.config.ts` stops `next dev` from generating an AGENTS.md; this section replaces it.

## Architecture

- **Content** lives only in `src/lib/data.ts` (typed by `src/lib/types.ts`): personal data (roles, bio, stats, socials), experience (with `logo` and `impact`), education, projects and `navLinks`. Changing what the site says means editing that file, not the components.
- **Live config** (`src/lib/site-config.ts`): `status`, `location`, `resume` (https only) and `timezone` (IANA) come from the Vercel Global Config store via the `GLOBAL_CONFIG` connection string, so they change without a deploy. A missing or invalid key renders nothing; there is no fallback in `data.ts`. Locally, `npx vercel env pull .env.local` provides `GLOBAL_CONFIG`. To add a key, extend `SiteConfig` and `KEYS` and pass it down from `config`.
- **Page** (`src/app/page.tsx`): a server component that reads the config and renders `Header`, the sections in `src/components/sections/` (hero, experience, skills, projects, education, contact) and `Footer`. `revalidate = 60` keeps it prerendered and refreshed in the background. Section `id`s match the `href`s in `navLinks`, which drive the header nav, the footer nav and the active-section indicator.
- **Sections** use `SectionWrapper` and `SectionTitle` (`src/components/layout/section-wrapper.tsx`). Each section is at least one screen tall below the 64px header (`min-h-[calc(100svh-4rem)]`) with centred content, so a nav jump frames exactly one section. Section-specific pieces live in `src/components/{hero,experience,skills,projects,education,contact,footer}/`.
- **Experience** (`sections/experience.tsx`, a server component) renders two layouts and CSS picks one. From lg up, `experience/pinned-story.tsx` is a sticky scroll story with one chapter per role, a progress rail, and a "Full details" panel. Below lg, `experience/stacked-story.tsx` shows stacked cards with a sticky logo row. The wrapper uses `overflow-clip` (not `overflow-hidden`), so sticky still pins.
- **Skills**: `src/lib/skills.ts` is the skill list (category, icon, and "where used", derived from `workExperience[].stack` and `projects[].techStack` through an alias map). `skills/skill-wall.tsx` is the logo wall and explorer. Logos come from `simple-icons` as named imports only; brands it lacks (Microsoft/Azure, AWS, Java, OpenAI…) use monograms.
- **Cross-section links** (`src/lib/events.ts`): `showExperience(id)` and `showProjects({ tech, years })` dispatch window events that Experience and Projects listen for (used by the hero company strip, Skills details and Education cards).
- **Fit to screen**: on desktop every section must fit `100svh − 64px` at 1280×720, 1512×741, 1440×900 and 1920×1080. Use the height variants in `globals.css`: `short:` (≥ md and height ≤ 940px) and `shorter:` (≤ 780px). Phones scroll naturally.
- **UI primitives** in `src/components/ui/` are trimmed to the parts actually used. `motion-button.tsx` adds hover and press feedback to buttons. Add pieces back only when needed.
- **Brand icons** (GitHub, LinkedIn, YouTube) are in `src/components/icons/brand-icons.ts`, because lucide-react v1 dropped brand icons.
- **Theme**: next-themes with `light`, `dark` (default) and `fresh`, set as a class on `<html>`. Tokens are CSS variables in `src/app/globals.css`; Tailwind v4 is configured in CSS (no tailwind.config). The `dark:` and `fresh:` variants match only their theme. The hero photo is the café photo in light and dark and the beach photo in fresh, chosen by CSS.
- **Theme switch** (`src/lib/theme-transition.ts`, `src/app/view-transitions.css`): the new theme spreads from the toggle as a soft-edged circle using the View Transitions API. Nothing is named out of the root snapshot, so the circle reveals the photo too. Browsers without the API and reduced motion get an instant switch.
- **Fonts**: Inter and Space Grotesk are self-hosted through `next/font` in `layout.tsx` (exposed as `font-body` and `font-headline`).
- **SEO**: metadata and viewport are in `layout.tsx`. `opengraph-image.tsx`, `sitemap.ts` and `robots.ts` use `siteUrl` from `src/lib/site-url.ts` (`VERCEL_PROJECT_PRODUCTION_URL`, else localhost).
- **Security headers** (CSP, HSTS, frame and referrer policies) are set in `next.config.ts`. The CSP allows only same-origin resources (plus the Vercel analytics CDN in development), so anything loaded from a new origin must be added there.

## Animation

The site should feel alive and smooth, like it's running on a 240Hz screen. Motion (`motion/react`) is the only animation library. Do not add CSS keyframe animations, `tw-animate-css` or framer-motion. The exceptions are: plain CSS `transition-colors` / `transition-opacity` for colour hovers, the 4s reveal failsafe, and the theme switch's `element.animate()` on View Transition pseudo-elements, which Motion can't target.

- `MotionProvider` (`src/components/motion-provider.tsx`) wraps the app in `LazyMotion` (strict) and `MotionConfig reducedMotion="user"`. Use `m.*` components, never `motion.*`.
- Shared easing, durations and variants live in `src/lib/motion.ts` (`springSnappy`, `fadeUp`, `popIn`, `collapse`, `hoverLift`, `staggerChildren()`, `cappedInterval()`). Use them so everything moves as one system.
- **Effect primitives** (`src/components/motion/`):
  - `BorderBeam`: a travelling light arc on a card border.
  - `BorderGlow`: border light that follows the cursor.
  - `Shine`: a periodic light sweep.
  - `Spotlight`: a glow inside the card that follows the cursor.
  - `Tilt`, `Magnetic`.
  - `Marquee`: optional `boost` motion value, e.g. scroll velocity.
  - `WaveLetters`: letters lift around the cursor.

  Budget: BorderBeam only on featured or active cards; hover-triggered light elsewhere.
- **Hooks** (`src/hooks/`):
  - `useMediaQuery`.
  - `useFinePointer`: mouse/trackpad. Gates pointer effects and scroll-linked JS movement.
  - `useFrameLoop`: a per-frame callback that only runs while on screen and motion is allowed. Use it instead of a bare `useAnimationFrame`.
- Scroll reveals use `Reveal`, `RevealGroup` and `RevealItem` from `src/components/reveal.tsx`, built on `useScrollReveal`. They are reversible (content sinks back out when scrolled back below the trigger line) and stagger in on-screen order. Mark a clipping container with `data-reveal-clip` (the carousel viewport has it). Content near the very end of the page passes `margin={REVEAL_MARGIN_PAGE_END}`.
- Anything that starts hidden must carry `data-reveal`, so the `<noscript>` rule in `layout.tsx` and the 4s failsafe in `globals.css` can show it without JS.
- The hero name and photo must never start at opacity 0 or be masked (it delays Largest Contentful Paint); they only move into place.
- Animate only `transform` and `opacity`, using Motion's shorthands (`x`, `y`, `scale`, `rotate`), since `reducedMotion="user"` only suppresses those. The exceptions are height in the `collapse` variants and the back-to-top ring's SVG `pathLength`. Never animate `box-shadow`, `filter` or `background-position`; animate the opacity or transform of a separate layer instead.
- Continuous effects use motion values and springs, never React state per frame or per pointermove. Every loop pauses off screen and with reduced motion.
- Components that differ with reduced motion must render the same markup on the server and the first client render (hide or skip after mount) to avoid hydration errors.
- Every interactive element needs hover/focus and press feedback (cursor `pointer` is set globally in `globals.css`). Touch users must get everything without hover; tap targets are at least 44px.
- Radix overlays (dialog, sheet, dropdown) track their open state through `useControllableOpen` and render with `forceMount` inside `AnimatePresence`, so exit animations play before unmounting. Dialog and sheet return focus without scrolling (`src/lib/return-focus.ts`). On phones the dialog is a bottom sheet.
- Full-screen sections use `svh`, never `dvh`.
