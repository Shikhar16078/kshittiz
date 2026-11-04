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

Next.js 16 (App Router, statically prerendered), React 19, TypeScript, Tailwind CSS 4, Radix UI primitives in the shadcn/ui pattern, Embla Carousel, next-themes, lucide-react and Motion. Deployed on Vercel.

Next 16 has breaking changes from older versions. Before writing Next.js code, read the matching guide in `node_modules/next/dist/docs/` and heed deprecation notices (e.g. `next/image` uses `preload`, not `priority`). `agentRules: false` in `next.config.ts` stops `next dev` from generating an AGENTS.md; this section replaces it.

## Architecture

- **Content** lives only in `src/lib/data.ts` (typed by `src/lib/types.ts`). Changing what the site says means editing that file, not the components.
- **Page**: `src/app/page.tsx` renders `Header`, the sections in `src/components/sections/` (hero, experience, skills, projects, education, contact) and `Footer`. Section `id`s match the `href`s in `navLinks`, which drive the header nav and its active-section indicator.
- **UI primitives** in `src/components/ui/` are trimmed to the parts actually used. Add pieces back only when needed.
- **Brand icons** (GitHub, LinkedIn, YouTube) are in `src/components/icons/brand-icons.ts`, because lucide-react v1 dropped brand icons.
- **Theme**: next-themes with `light`, `dark` (default) and `fresh`, set as a class on `<html>`. Tokens are CSS variables in `src/app/globals.css`; Tailwind v4 is configured in CSS (no tailwind.config). The `dark:` variant matches only the `dark` theme.
- **Fonts**: Inter and Space Grotesk are self-hosted through `next/font` in `layout.tsx` (exposed as `font-body` and `font-headline`).
- **Security headers** (CSP, HSTS, frame and referrer policies) are set in `next.config.ts`. The CSP allows only same-origin resources, so anything loaded from a new origin (scripts, images, fonts, fetch) must be added there.

## Animation

Motion (`motion/react`) is the only animation library. Do not add CSS keyframe animations, `tw-animate-css` or framer-motion. Plain CSS `transition-colors` / `transition-opacity` for hover colour changes is fine.

- `MotionProvider` (`src/components/motion-provider.tsx`) wraps the app in `LazyMotion` (strict) and `MotionConfig reducedMotion="user"`. Use `m.*` components, never `motion.*`.
- Shared easing, durations and variants live in `src/lib/motion.ts`. Stagger with `staggerChildren()` from there (built on `delayChildren: stagger(...)`).
- Scroll reveals use `Reveal`, `RevealGroup` and `RevealItem` from `src/components/reveal.tsx`, built on `useScrollReveal`. They are reversible (content sinks back out when scrolled back below the trigger line) and stagger in on-screen order. Mark a clipping container with `data-reveal-clip` (the carousel viewport has it). Content at the very end of the page passes `margin={REVEAL_MARGIN_PAGE_END}`.
- Anything that starts hidden must carry `data-reveal`, so the `<noscript>` rule in `layout.tsx` and the 4s failsafe in `globals.css` can show it without JS.
- The hero name and photo must never start at opacity 0 (it delays Largest Contentful Paint); they only move into place.
- Animate only `transform` and `opacity`, using Motion's shorthands (`x`, `y`, `scale`, `rotate`), since `reducedMotion="user"` only suppresses those. The one exception is height in the `collapse` variants for expanding panels.
- Scroll-linked movement driven by JS (`useScroll` transforms: hero drift, timeline rail fill) is limited to fine pointers. On touch screens it lags behind native scrolling.
- Radix overlays (dialog, sheet, dropdown, tooltip) track their open state through `useControllableOpen` and render with `forceMount` inside `AnimatePresence`, so exit animations play before unmounting.
- Full-screen sections use `min-h-svh`, never `dvh`.
