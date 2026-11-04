"use client"

import * as React from "react"
import { m } from "motion/react"

import { Button } from "@/components/ui/button"
import { springSnappy } from "@/lib/motion"

const MotionButtonBase = m.create(Button)

// The site's two button feels: pill buttons rise a little and press in; icon buttons grow a
// touch and press in further. Hover never fires for touch, so phones get the press only.
const feels = {
  lift: {
    whileHover: { y: -2, transition: springSnappy },
    whileTap: { scale: 0.97 },
  },
  pop: {
    whileHover: { scale: 1.06, transition: springSnappy },
    whileTap: { scale: 0.92 },
  },
} as const

type MotionButtonProps = React.ComponentProps<typeof MotionButtonBase> & {
  feel?: keyof typeof feels
}

/**
 * `Button` with hover and press feedback on springs (transform only, so reduced motion drops
 * it). Works with `asChild` and as a Radix trigger: the ref and handlers reach the DOM node.
 */
const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ feel = "lift", ...props }, ref) => (
    <MotionButtonBase ref={ref} {...feels[feel]} {...props} />
  ),
)
MotionButton.displayName = "MotionButton"

export { MotionButton }
