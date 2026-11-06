"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  AnimatePresence,
  m,
  useDragControls,
  type PanInfo,
  type Variants,
} from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DURATION, EASE_IN, EASE_OUT, springSnappy } from "@/lib/motion"
import { useControllableOpen } from "@/lib/use-controllable-open"
import { useReturnFocusWithoutScroll } from "@/lib/return-focus"
import { useMediaQuery } from "@/hooks/use-media-query"

type DialogState = { open: boolean; setOpen: (open: boolean) => void }
const DialogStateContext = React.createContext<DialogState>({
  open: false,
  setOpen: () => {},
})

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
  const state = React.useMemo(() => ({ open, setOpen }), [open, setOpen])
  return (
    <DialogStateContext.Provider value={state}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </DialogStateContext.Provider>
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogClose = DialogPrimitive.Close

/** sm and up. Dialogs only render once opened in the browser, so the server value never shows. */
const useIsSmUp = () => useMediaQuery("(min-width: 640px)", true)

// Centred card on sm+: a small scale-and-fade.
const centred: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: DURATION.fast, ease: EASE_IN },
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
}

// Bottom sheet on phones: slides up from the bottom edge, no fade (it's opaque and edge-anchored).
const bottomSheet: Variants = {
  hidden: { y: "100%", transition: { duration: DURATION.exit, ease: EASE_IN } },
  show: { y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
}

/** Past this drag distance (px) or flick speed (px/s), letting go dismisses the sheet. */
const DISMISS_OFFSET = 100
const DISMISS_VELOCITY = 500

// Radix keeps the nodes mounted (forceMount) while AnimatePresence plays the exit.
function DialogContent({
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const { open, setOpen } = React.useContext(DialogStateContext)
  const smUp = useIsSmUp()
  const dragControls = useDragControls()
  const focus = useReturnFocusWithoutScroll(onOpenAutoFocus, onCloseAutoFocus)

  const onDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount key="dialog">
          <DialogPrimitive.Overlay forceMount asChild>
            {/* Static blur; only the overlay's opacity animates. */}
            <m.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: DURATION.fast } }}
              exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content forceMount asChild {...focus} {...props}>
            <m.div
              className={cn(
                // Phones: bottom sheet. sm+: centred card (translate composes with Motion's transform).
                "fixed inset-x-0 bottom-0 z-50 grid max-h-[85svh] w-full gap-4 overflow-y-auto overflow-x-hidden overscroll-contain rounded-t-2xl border-t bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-0 shadow-lg",
                "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:p-6",
                className,
              )}
              variants={smUp ? centred : bottomSheet}
              initial="hidden"
              animate="show"
              exit="hidden"
              drag={smUp ? false : "y"}
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
            >
              {!smUp && (
                // Drag starts only from the handle strip, so the content can still scroll. -mx-5
                // matches the default px-5; overflow-x-hidden clips it (still centred) when a
                // caller drops the padding, so the sheet never scrolls sideways.
                <div
                  aria-hidden
                  onPointerDown={(e) => dragControls.start(e)}
                  className="sticky top-0 z-10 -mx-5 flex h-7 cursor-grab touch-none items-center justify-center bg-background active:cursor-grabbing"
                >
                  <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
                </div>
              )}
              {children}
              <DialogPrimitive.Close asChild>
                <m.button
                  type="button"
                  whileHover={{ scale: 1.06, rotate: 90, transition: springSnappy }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute right-2 top-2 z-20 inline-flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground/80 shadow-sm ring-offset-background transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none sm:right-3 sm:top-3"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </m.button>
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
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
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
