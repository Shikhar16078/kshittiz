"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { AnimatePresence, m } from "motion/react"

import { cn } from "@/lib/utils"
import { popIn } from "@/lib/motion"
import { useControllableOpen } from "@/lib/use-controllable-open"

const DropdownMenuOpenContext = React.createContext(false)

function DropdownMenu({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const [open, setOpen] = useControllableOpen(
    openProp,
    defaultOpen,
    onOpenChange,
  )
  return (
    <DropdownMenuOpenContext.Provider value={open}>
      <DropdownMenuPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        {...props}
      />
    </DropdownMenuOpenContext.Provider>
  )
}

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const open = React.useContext(DropdownMenuOpenContext)
  return (
    <AnimatePresence>
      {open && (
        <DropdownMenuPrimitive.Portal forceMount key="dropdown">
          <DropdownMenuPrimitive.Content
            forceMount
            asChild
            sideOffset={sideOffset}
            {...props}
          >
            <m.div
              className={cn(
                "z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                className,
              )}
              style={{
                transformOrigin:
                  "var(--radix-dropdown-menu-content-transform-origin)",
              }}
              variants={popIn}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {children}
            </m.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
