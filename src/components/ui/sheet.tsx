"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, m } from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DURATION, EASE_IN, EASE_OUT } from "@/lib/motion"
import { useControllableOpen } from "@/lib/use-controllable-open"

const SheetOpenContext = React.createContext(false)

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
  return (
    <SheetOpenContext.Provider value={open}>
      <SheetPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </SheetOpenContext.Provider>
  )
}

const SheetTrigger = SheetPrimitive.Trigger

/** Slides in from the right edge; Radix stays mounted (forceMount) while the exit plays. */
function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  const open = React.useContext(SheetOpenContext)
  return (
    <AnimatePresence>
      {open && (
        <SheetPrimitive.Portal forceMount key="sheet">
          <SheetPrimitive.Overlay forceMount asChild>
            <m.div
              className="fixed inset-0 z-50 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: DURATION.base } }}
              exit={{ opacity: 0, transition: { duration: DURATION.exit } }}
            />
          </SheetPrimitive.Overlay>
          <SheetPrimitive.Content forceMount asChild {...props}>
            <m.div
              className={cn(
                "fixed inset-y-0 right-0 z-50 h-full w-3/4 gap-4 border-l bg-background p-6 shadow-lg sm:max-w-sm",
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
            >
              {children}
              <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
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
