"use client"

import { useRef, useSyncExternalStore, type MouseEvent } from "react"
import { Moon, Sparkles, Sun, type LucideIcon } from "lucide-react"
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
  type ThemeName,
} from "@/lib/theme-transition"

const THEME_META: Record<ThemeName, { label: string; icon: LucideIcon }> = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  fresh: { label: "Fresh", icon: Sparkles },
}

const isTheme = (value: string | undefined): value is ThemeName =>
  !!value && (THEMES as readonly string[]).includes(value)

const noopSubscribe = () => () => {}

/** The active theme once known in the browser; undefined during server render and hydration. */
function useActiveTheme() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const active = mounted && isTheme(resolvedTheme) ? resolvedTheme : undefined
  return { active, setTheme }
}

export function ThemeToggleButton({
  onOpenChange,
  className,
}: {
  onOpenChange?: (open: boolean) => void
  className?: string
}) {
  const { active, setTheme } = useActiveTheme()
  const trigger = useRef<HTMLButtonElement>(null)
  const Icon = active ? THEME_META[active].icon : null

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
                key={active}
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
            Change theme{active ? ` (current: ${THEME_META[active].label})` : ""}
          </span>
        </MotionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup
          value={active ?? ""}
          onValueChange={(value) => {
            // The trigger stays mounted while the menu closes, so its centre is the origin.
            if (isTheme(value) && value !== active) {
              switchTheme(value, setTheme, centreOf(trigger.current))
            }
          }}
        >
          {THEMES.map((theme) => {
            const { label, icon: ItemIcon } = THEME_META[theme]
            return (
              <DropdownMenuRadioItem key={theme} value={theme}>
                <ItemIcon />
                {label}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Segmented Light / Dark / Fresh control (mobile menu); the circle grows from the tapped option. */
export function ThemeSwitcherRow({ className }: { className?: string }) {
  const { active, setTheme } = useActiveTheme()

  const choose = (theme: ThemeName) => (e: MouseEvent<HTMLButtonElement>) => {
    if (theme !== active) switchTheme(theme, setTheme, centreOf(e.currentTarget))
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn("grid grid-cols-3 gap-1 rounded-full border bg-muted/40 p-1", className)}
    >
      {THEMES.map((theme) => {
        const { label, icon: ItemIcon } = THEME_META[theme]
        const checked = theme === active
        return (
          <m.button
            key={theme}
            type="button"
            whileTap={{ scale: 0.95 }}
            aria-pressed={checked}
            onClick={choose(theme)}
            className={cn(
              "relative flex min-h-11 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              checked ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {checked && (
              <m.span
                layoutId="theme-row-active"
                transition={springSnappy}
                className="absolute inset-0 rounded-full bg-background shadow-sm"
              />
            )}
            <ItemIcon className="relative h-4 w-4" />
            <span className="relative">{label}</span>
          </m.button>
        )
      })}
    </div>
  )
}
