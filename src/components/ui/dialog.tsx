"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, m } from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DURATION, EASE_IN, EASE_OUT } from "@/lib/motion"
import { useControllableOpen } from "@/lib/use-controllable-open"

const DialogOpenContext = React.createContext(false)

function Dialog({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [open, setOpen] = useControllableOpen(
    openProp,
    defaultOpen,
    onOpenChange,
  )
  return (
    <DialogOpenContext.Provider value={open}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </DialogOpenContext.Provider>
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogClose = DialogPrimitive.Close

// Radix keeps the nodes mounted (forceMount) while AnimatePresence plays the exit.
function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const open = React.useContext(DialogOpenContext)
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount key="dialog">
          <DialogPrimitive.Overlay forceMount asChild>
            <m.div
              className="fixed inset-0 z-50 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: DURATION.fast } }}
              exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content forceMount asChild {...props}>
            <m.div
              className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
                className,
              )}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: DURATION.base, ease: EASE_OUT },
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 8,
                transition: { duration: DURATION.fast, ease: EASE_IN },
              }}
            >
              {children}
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </m.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
