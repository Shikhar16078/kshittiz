"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, m, type PanInfo } from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DURATION, EASE_IN, EASE_OUT, springSnappy } from "@/lib/motion"
import { useControllableOpen } from "@/lib/use-controllable-open"
import { useReturnFocusWithoutScroll } from "@/lib/return-focus"

type SheetState = { open: boolean; setOpen: (open: boolean) => void }
const SheetStateContext = React.createContext<SheetState>({
  open: false,
  setOpen: () => {},
})

function Sheet({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [open, setOpen] = useControllableOpen(
    openProp,
    defaultOpen,
    onOpenChange,
  )
  const state = React.useMemo(() => ({ open, setOpen }), [open, setOpen])
  return (
    <SheetStateContext.Provider value={state}>
      <SheetPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </SheetStateContext.Provider>
  )
}

const SheetTrigger = SheetPrimitive.Trigger

/** Past this drag distance (px) or flick speed (px/s), letting go dismisses the sheet. */
const DISMISS_OFFSET = 80
const DISMISS_VELOCITY = 500

/**
 * Slides in from the right edge and can be dragged back out to the right. Radix stays mounted
 * (forceMount) while the exit plays; the exit continues from wherever the drag let go.
 */
function SheetContent({
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  const { open, setOpen } = React.useContext(SheetStateContext)
  const focus = useReturnFocusWithoutScroll(onOpenAutoFocus, onCloseAutoFocus)

  const onDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.x > DISMISS_OFFSET || info.velocity.x > DISMISS_VELOCITY) {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <SheetPrimitive.Portal forceMount key="sheet">
          <SheetPrimitive.Overlay forceMount asChild>
            {/* Static blur; only the overlay's opacity animates. */}
            <m.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: DURATION.base } }}
              exit={{ opacity: 0, transition: { duration: DURATION.exit } }}
            />
          </SheetPrimitive.Overlay>
          <SheetPrimitive.Content forceMount asChild {...focus} {...props}>
            <m.div
              className={cn(
                "fixed inset-y-0 right-0 z-50 flex h-full w-[85%] max-w-sm flex-col border-l bg-background p-6 shadow-lg",
                className,
              )}
              initial={{ x: "100%" }}
              animate={{
                x: 0,
                transition: { duration: DURATION.slow, ease: EASE_OUT },
              }}
              exit={{
                x: "100%",
                transition: { duration: DURATION.exit, ease: EASE_IN },
              }}
              // Rightwards only, with some give; vertical swipes still scroll (pan-y).
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.7 }}
              onDragEnd={onDragEnd}
              style={{ touchAction: "pan-y" }}
            >
              {children}
              <SheetPrimitive.Close asChild>
                <m.button
                  type="button"
                  whileHover={{ scale: 1.06, rotate: 90, transition: springSnappy }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </m.button>
              </SheetPrimitive.Close>
            </m.div>
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

export { Sheet, SheetTrigger, SheetContent, SheetTitle }
