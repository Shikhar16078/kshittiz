"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { AnimatePresence, m } from "motion/react"

import { cn } from "@/lib/utils"
import { popIn } from "@/lib/motion"
import { useControllableOpen } from "@/lib/use-controllable-open"

const TooltipProvider = TooltipPrimitive.Provider

const TooltipOpenContext = React.createContext(false)

function Tooltip({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [open, setOpen] = useControllableOpen(
    openProp,
    defaultOpen,
    onOpenChange,
  )
  return (
    <TooltipOpenContext.Provider value={open}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </TooltipOpenContext.Provider>
  )
}

const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const open = React.useContext(TooltipOpenContext)
  return (
    <AnimatePresence>
      {open && (
        <TooltipPrimitive.Portal forceMount key="tooltip">
          <TooltipPrimitive.Content
            forceMount
            asChild
            sideOffset={sideOffset}
            {...props}
          >
            <m.div
              className={cn(
                "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
                className,
              )}
              style={{
                transformOrigin:
                  "var(--radix-tooltip-content-transform-origin)",
              }}
              variants={popIn}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {children}
            </m.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
