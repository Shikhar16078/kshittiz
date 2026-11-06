# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git rules

- **Commit locally when a piece of work is done and verified** (typecheck and build pass, behaviour checked), without waiting to be asked. Split it into multiple logical commits rather than one big one. Don't commit half-finished or unverified work.
- **Never push**, force-push, rebase or amend unless the user asks for that specific action. Pushing publishes to `origin` and triggers a Vercel deployment.
- Commit messages use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): imperative summary` (≤ 72 chars), a blank line, then a body explaining what changed and why.
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
- **Experience** (`sections/experience.tsx`, a server component) renders two layouts and CSS picks one. From lg up, `experience/pinned-story.tsx` is a sticky scroll story with one chapter per role, a progress rail, and a "Full details" panel. Below lg, `experience/stacked-story.tsx` shows stacked cards with a sticky logo row. Both are in the server HTML; `MediaOnly` (`src/components/media-only.tsx`) drops the one the screen doesn't use after hydration (the Skills wall does the same with its desktop and phone rows). The wrapper uses `overflow-clip` (not `overflow-hidden`), so sticky still pins.
- **Skills**: `src/lib/skills.ts` is the skill list (category, icon, and "where used", derived from `workExperience[].stack` and `projects[].techStack` through an alias map). `skills/skill-wall.tsx` is the logo wall and explorer. Logos come from `simple-icons` as named imports only; brands it lacks (Microsoft/Azure, AWS, Java, OpenAI…) use monograms.
- **Cross-section links** (`src/lib/events.ts`): `showExperience(id)` and `showProjects({ tech, years })` dispatch window events that Experience and Projects listen for (used by the hero company strip, Skills details and Education cards).
- **Fit to screen**: on desktop every section must fit `100svh − 64px` at 1280×720, 1512×741, 1440×900 and 1920×1080. Use the height variants in `globals.css`: `short:` (≥ md and height ≤ 940px) and `shorter:` (≤ 780px). Phones scroll naturally.
- **UI primitives** in `src/components/ui/` are trimmed to the parts actually used. `motion-button.tsx` adds hover and press feedback to buttons. Add pieces back only when needed.
- **Brand icons** (GitHub, LinkedIn, YouTube) are in `src/components/icons/brand-icons.ts`, because lucide-react v1 dropped brand icons.
- **Theme**: next-themes with five themes set as a class on `<html>`: `dark` (Midnight Gold, the default and the brand), `light` (Ivory), `rose` (Obsidian Rose), `emerald` (Emerald Noir) and `sapphire`, plus a System choice that follows the OS. Tokens are CSS variables in `src/app/globals.css`; Tailwind v4 is configured there (no tailwind.config). `--primary` is the fill colour and `--primary-ink` is for accent text and thin strokes on the page background (`text-primary-ink`); `--glow-2` is the second ambient hue, `--pattern` the cover-art colour and `--success` the live/current green. The `dark:` variant covers every dark-family theme; `sapphire:` is only for its hero photo (the beach photo; every other theme uses the café photo). Adding a theme means a token block in `globals.css`, an entry in `THEMES` and `THEME_BACKGROUND` in `src/lib/themes.ts` (the layout's `themes` prop and the phone browser's `theme-color` read them), and a swatch entry in `ui/theme-toggle-button.tsx`. Use the accent sparingly: primary buttons, active states, key numbers and beams; labels, eyebrows and chips stay neutral.
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
  - `useFinePointer`: mouse/trackpad. Gates pointer effects, scroll-linked JS movement, and the GPU-heavy extras (beam halos, the 3D Skills tilt, the header blur, the hero dot-grid drift).
- **Motion tier** (`src/lib/motion-tier.ts`): `full` or `lite`, decided per device at runtime, not by device type. Browser hints (Data Saver, very low memory/CPU) or two slow frame probes in a row (median frame over 28 ms or many 50 ms hitches) step it down to `lite` for the session; it never steps back up. `useAmbientMotion()` is true when the tier is `full` and reduced motion is off: gate every endless loop on it (plus being on screen). `lite` keeps reveals, hovers and taps and stops ambient loops. Mirrored on `<html data-motion>`.
- Scroll reveals use `Reveal`, `RevealGroup` and `RevealItem` from `src/components/reveal.tsx`, built on `useScrollReveal`, animating the GPU `rise()` variants. On mouse/trackpad they are reversible (content sinks back out when scrolled back below the trigger line); on touch screens they trigger just below the screen and reveal once. They stagger in on-screen order. Mark a clipping container with `data-reveal-clip` (the carousel viewport has it). Content near the very end of the page passes `margin={REVEAL_MARGIN_PAGE_END}`.
- Anything that starts hidden must carry `data-reveal`, so the `<noscript>` rule in `layout.tsx` and the 4s failsafe in `globals.css` can show it without JS.
- The hero name and photo must never start at opacity 0 or be masked (it delays Largest Contentful Paint); they only move into place.
- Animate only `transform` and `opacity`. The exceptions are height in the `collapse` variants and the back-to-top ring's SVG `pathLength`. Never animate `box-shadow`, `filter` or `background-position`; animate the opacity or transform of a separate layer instead.
- **GPU vs main thread.** Motion runs `transform` (the full string) and `opacity` in the browser (WAAPI), on the GPU at the display's refresh rate, even while the main thread is busy. The shorthands (`x`, `y`, `scale`, `rotate`) are computed in JS every frame. So:
  - Endless loops and anything that enters on scroll or on load use `transform` strings: `gpuKeyframes()`/`GPU_REST` and `rise(reduce)` in `src/lib/motion.ts`, or `animate(el, { transform: [...] })` with `repeat: Infinity` (speed changes via the controls' `speed`, never by restarting).
  - Always give a `transform` animation an explicit `initial`; from the browser's `none` Motion starts at `scale(0)`.
  - `reducedMotion="user"` doesn't suppress `transform` strings: gate loops on `useAmbientMotion()` and pass `reduce` into `rise()`.
  - One-off interaction feedback (hover, tap, dialogs, layout) may use the shorthands, which reduced motion does suppress.
- Continuous effects never use React state per frame or per pointermove. Every loop pauses off screen, with reduced motion, and on the `lite` tier.
- Components that differ with reduced motion must render the same markup on the server and the first client render (hide or skip after mount) to avoid hydration errors.
- Every interactive element needs hover/focus and press feedback (cursor `pointer` is set globally in `globals.css`). Touch users must get everything without hover; tap targets are at least 44px.
- Radix overlays (dialog, sheet, dropdown) track their open state through `useControllableOpen` and render with `forceMount` inside `AnimatePresence`, so exit animations play before unmounting. Dialog and sheet return focus without scrolling (`src/lib/return-focus.ts`). On phones the dialog is a bottom sheet.
- Full-screen sections use `svh`, never `dvh`.
