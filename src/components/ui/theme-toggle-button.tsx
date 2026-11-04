"use client"

import { useEffect, useRef, useSyncExternalStore, type MouseEvent } from "react"
import {
  Flower2,
  Gem,
  Monitor,
  Moon,
  Sun,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { AnimatePresence, m } from "motion/react"

import { MotionButton } from "@/components/ui/motion-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DURATION, EASE_OUT, springSnappy } from "@/lib/motion"
import { cn } from "@/lib/utils"
import {
  centreOf,
  switchTheme,
  THEMES,
  type Origin,
  type ThemeName,
} from "@/lib/theme-transition"

type Choice = ThemeName | "system"

// Swatches preview *other* themes, so they can't use the current theme's tokens: these are the
// fixed background / accent colours of each theme (keep in sync with globals.css).
const META: Record<
  Choice,
  { label: string; short: string; icon: LucideIcon; bg: string; accent: string }
> = {
  dark: { label: "Midnight Gold", short: "Gold", icon: Moon, bg: "#09090b", accent: "#ffc31a" },
  light: { label: "Ivory", short: "Ivory", icon: Sun, bg: "#f8f7f6", accent: "#ef9a06" },
  rose: { label: "Obsidian Rose", short: "Rose", icon: Flower2, bg: "#0c0909", accent: "#e3a38f" },
  emerald: { label: "Emerald Noir", short: "Emerald", icon: Gem, bg: "#080c0a", accent: "#39c68a" },
  sapphire: { label: "Sapphire", short: "Sapphire", icon: Waves, bg: "#0c1220", accent: "#bccfe4" },
  system: { label: "System", short: "System", icon: Monitor, bg: "", accent: "" },
}

const CHOICES: Choice[] = [...THEMES, "system"]

const isChoice = (value: string | undefined): value is Choice =>
  !!value && (CHOICES as string[]).includes(value)

const noopSubscribe = () => () => {}

/**
 * The selected choice (a theme or "system") and the theme actually shown, once known in the
 * browser; both undefined during server render and hydration.
 */
function useThemeChoice() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

  // "fresh" was retired for "sapphire"; move anyone who had it saved.
  useEffect(() => {
    if (theme === "fresh") setTheme("sapphire")
  }, [theme, setTheme])

  const choice = mounted && isChoice(theme) ? theme : undefined
  const shown =
    mounted && resolvedTheme && (THEMES as readonly string[]).includes(resolvedTheme)
      ? (resolvedTheme as ThemeName)
      : undefined

  // System follows the OS: sweep to whatever it resolves to, but store "system".
  const choose = (next: Choice, origin?: Origin) => {
    if (next === choice) return
    if (next === "system") {
      const target: ThemeName = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      if (target === shown) setTheme("system")
      else switchTheme(target, () => setTheme("system"), origin)
      return
    }
    if (next === shown) setTheme(next)
    else switchTheme(next, setTheme, origin)
  }

  return { choice, shown, choose }
}

/** A small preview dot of a theme: its background with its accent inside. */
function Swatch({ choice, className }: { choice: Choice; className?: string }) {
  if (choice === "system") {
    return (
      <span
        aria-hidden
        className={cn(
          "relative inline-block size-5 shrink-0 overflow-hidden rounded-full ring-1 ring-border",
          className,
        )}
        style={{
          background: `linear-gradient(135deg, ${META.light.bg} 50%, ${META.dark.bg} 50%)`,
        }}
      />
    )
  }
  const { bg, accent } = META[choice]
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-5 shrink-0 items-center justify-center rounded-full ring-1 ring-border",
        className,
      )}
      style={{ background: bg }}
    >
      <span className="size-2 rounded-full" style={{ background: accent }} />
    </span>
  )
}

export function ThemeToggleButton({
  onOpenChange,
  className,
}: {
  onOpenChange?: (open: boolean) => void
  className?: string
}) {
  const { choice, shown, choose } = useThemeChoice()
  const trigger = useRef<HTMLButtonElement>(null)
  const iconKey = choice === "system" ? "system" : shown
  const Icon = iconKey ? META[iconKey].icon : null

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <MotionButton
          ref={trigger}
          feel="pop"
          variant="ghost"
          size="icon"
          className={cn("size-11 rounded-full", className)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {Icon && (
              <m.span
                key={iconKey}
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{
                  rotate: 0,
                  scale: 1,
                  opacity: 1,
                  transition: { duration: DURATION.base, ease: EASE_OUT },
                }}
                exit={{
                  rotate: 90,
                  scale: 0,
                  opacity: 0,
                  transition: { duration: DURATION.fast },
                }}
                className="inline-flex"
              >
                <Icon className="h-[1.2rem] w-[1.2rem]" />
              </m.span>
            )}
          </AnimatePresence>
          <span className="sr-only">
            Change theme{choice ? ` (current: ${META[choice].label})` : ""}
          </span>
        </MotionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuRadioGroup
          value={choice ?? ""}
          onValueChange={(value) => {
            // The trigger stays mounted while the menu closes, so its centre is the origin.
            if (isChoice(value)) choose(value, centreOf(trigger.current))
          }}
        >
          {CHOICES.map((c) => (
            <DropdownMenuRadioItem key={c} value={c}>
              <Swatch choice={c} />
              {META[c].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Theme picker grid for the mobile menu; the circle grows from the tapped option. */
export function ThemeSwitcherRow({ className }: { className?: string }) {
  const { choice, choose } = useThemeChoice()

  const pick = (c: Choice) => (e: MouseEvent<HTMLButtonElement>) =>
    choose(c, centreOf(e.currentTarget))

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn("grid grid-cols-3 gap-1 rounded-2xl border bg-muted/40 p-1", className)}
    >
      {CHOICES.map((c) => {
        const checked = c === choice
        return (
          <m.button
            key={c}
            type="button"
            whileTap={{ scale: 0.95 }}
            aria-pressed={checked}
            aria-label={META[c].label}
            onClick={pick(c)}
            className={cn(
              "relative flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-1 text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              checked ? "text-primary-ink" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {checked && (
              <m.span
                layoutId="theme-row-active"
                transition={springSnappy}
                className="absolute inset-0 rounded-xl bg-background shadow-sm"
              />
            )}
            <Swatch choice={c} className="relative size-4" />
            <span className="relative">{META[c].short}</span>
          </m.button>
        )
      })}
    </div>
  )
}
