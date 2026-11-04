"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"
import { MotionButton } from "@/components/ui/motion-button"
import { springSnappy } from "@/lib/motion"
import { useFinePointer } from "@/hooks/use-fine-pointer"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  /** Autoplay interval in ms (turns on looping). Off with reduced motion. */
  autoplay?: number
  /** Holds autoplay from outside, e.g. while a dialog opened from a slide is up. */
  paused?: boolean
  /** Slides scale down and dim as they move out of the visible area (horizontal only). */
  depth?: boolean
}

type SlideMotion = { scale: MotionValue<number>; opacity: MotionValue<number> }

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  scrollSnaps: number[]
  scrollTo: (index: number) => void
  /** True when autoplay is configured and allowed (not reduced motion). */
  autoplayEnabled: boolean
  /** 0 → 1 over one autoplay interval; drives the active pill's fill. */
  progress: MotionValue<number>
  registerSlide: (node: HTMLElement, values: SlideMotion) => () => void
  layoutId: string
} & Omit<CarouselProps, "setApi" | "plugins" | "paused">

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

/** How much a slide may shrink and fade once it is fully out of the visible area. */
const DEPTH_SCALE = 0.08
const DEPTH_FADE = 0.4

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      autoplay,
      paused = false,
      depth = false,
      className,
      children,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        loop: !!autoplay,
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
    const layoutId = `carousel-dot-${React.useId()}`

    const rootRef = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

    // Autoplay pauses for anything suggesting the viewer is engaged with (or can't see) it.
    // These flip rarely, so plain state is fine; the per-frame fill is a motion value.
    const reduce = useReducedMotion()
    const inView = useInView(rootRef, { amount: 0.4 })
    const [hovered, setHovered] = React.useState(false)
    const [focused, setFocused] = React.useState(false)
    const [dragging, setDragging] = React.useState(false)
    const [docHidden, setDocHidden] = React.useState(false)
    const autoplayEnabled = !!autoplay && !reduce
    const playing =
      autoplayEnabled &&
      inView &&
      !hovered &&
      !focused &&
      !dragging &&
      !docHidden &&
      !paused
    const progress = useMotionValue(0)

    const onSelect = React.useCallback(
      (api: CarouselApi) => {
        if (!api) {
          return
        }
        // Reset synchronously, before React renders the new active pill, so it never
        // flashes the previous slide's full fill.
        progress.set(0)
        setSelectedIndex(api.selectedScrollSnap())
        setCanScrollPrev(api.canScrollPrev())
        setCanScrollNext(api.canScrollNext())
      },
      [progress],
    )

    const scrollTo = React.useCallback(
      (index: number) => {
        api?.scrollTo(index)
      },
      [api],
    )

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        // React events bubble through portals: ignore keys from a dialog opened from a slide.
        if (!event.currentTarget.contains(event.target as Node)) {
          return
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext],
    )

    React.useEffect(() => {
      if (!api) {
        return
      }

      const onReInit = (api: CarouselApi) => {
        setScrollSnaps(api?.scrollSnapList() ?? [])
        onSelect(api)
      }
      const onPointerDown = () => setDragging(true)
      const onPointerUp = () => setDragging(false)

      onReInit(api)
      api.on("reInit", onReInit)
      api.on("select", onSelect)
      api.on("pointerDown", onPointerDown)
      api.on("pointerUp", onPointerUp)

      return () => {
        api.off("reInit", onReInit)
        api.off("select", onSelect)
        api.off("pointerDown", onPointerDown)
        api.off("pointerUp", onPointerUp)
      }
    }, [api, onSelect])

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!autoplayEnabled) {
        return
      }
      const onVisibility = () => setDocHidden(document.hidden)
      onVisibility()
      document.addEventListener("visibilitychange", onVisibility)
      return () =>
        document.removeEventListener("visibilitychange", onVisibility)
    }, [autoplayEnabled])

    // Fill the active pill over the remaining part of the interval, then advance. Pausing
    // stops the tween where it is, so resuming continues rather than starting over; a slide
    // change resets it to 0 (in onSelect) and restarts it.
    React.useEffect(() => {
      if (!playing || !api || !autoplay) {
        return
      }
      const remaining = Math.max(0, 1 - progress.get()) * autoplay
      const controls = animate(progress, 1, {
        duration: remaining / 1000,
        ease: "linear",
        onComplete: () => {
          if (api.canScrollNext()) api.scrollNext()
          else api.scrollTo(0)
        },
      })
      return () => controls.stop()
    }, [playing, api, autoplay, progress, selectedIndex])

    // Depth: per-slide motion values written from Embla's scroll event (no React renders per
    // frame). Positions come from Embla's cached measurements, so nothing reads layout here.
    const slideMotion = React.useRef(new Map<HTMLElement, SlideMotion>())
    const registerSlide = React.useCallback(
      (node: HTMLElement, values: SlideMotion) => {
        slideMotion.current.set(node, values)
        return () => {
          slideMotion.current.delete(node)
        }
      },
      [],
    )

    React.useEffect(() => {
      if (!api || !depth || orientation !== "horizontal") {
        return
      }
      // The slide gutter (CarouselItem's pl-4, offset by the container's -ml-4) sits outside
      // the viewport, so the visible window starts that far into the container.
      let gutter = 0
      const measure = () => {
        const engine = api.internalEngine()
        gutter = Math.max(
          0,
          engine.containerRect.width - api.rootNode().offsetWidth,
        )
      }
      const update = () => {
        const engine = api.internalEngine()
        const view = engine.containerRect.width
        const location = engine.offsetLocation.get()
        // Looping moves slides from one end to the other with their own translate.
        const shifts = new Map<number, number>()
        if (engine.options.loop) {
          for (const point of engine.slideLooper.loopPoints) {
            shifts.set(point.index, point.target())
          }
        }
        api.slideNodes().forEach((node, index) => {
          const values = slideMotion.current.get(node)
          const rect = engine.slideRects[index]
          if (!values || !rect) return
          const offset =
            location + (shifts.get(index) ?? 0) - engine.containerRect.left
          const start = rect.left + gutter + offset
          const end = rect.right + offset
          const size = Math.max(1, end - start)
          // 0 = fully visible, 1 = fully outside the viewport.
          const out = Math.min(
            1,
            Math.max(0, gutter - start, end - view) / size,
          )
          values.scale.set(reduce ? 1 : 1 - DEPTH_SCALE * out)
          values.opacity.set(1 - DEPTH_FADE * out)
        })
      }
      measure()
      update()
      api.on("reInit", measure)
      api.on("reInit", update)
      api.on("scroll", update)
      api.on("slideFocus", update)
      return () => {
        api.off("reInit", measure)
        api.off("reInit", update)
        api.off("scroll", update)
        api.off("slideFocus", update)
        slideMotion.current.forEach((values) => {
          values.scale.set(1)
          values.opacity.set(1)
        })
      }
    }, [api, depth, orientation, reduce])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
          scrollTo,
          autoplay,
          autoplayEnabled,
          progress,
          depth,
          registerSlide,
          layoutId,
        }}
      >
        <div
          ref={rootRef}
          onKeyDownCapture={handleKeyDown}
          onPointerEnter={(e) => {
            // Hover only means something for a mouse or pen; a tap also fires pointerenter.
            if (e.pointerType !== "touch") setHovered(true)
            onPointerEnter?.(e)
          }}
          onPointerLeave={(e) => {
            setHovered(false)
            onPointerLeave?.(e)
          }}
          onFocus={(e) => {
            // Keyboard focus pauses; a mouse click on the arrows shouldn't leave it stuck.
            setFocused(e.target.matches(":focus-visible"))
            onFocus?.(e)
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocused(false)
            }
            onBlur?.(e)
          }}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  },
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden" data-reveal-clip="">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "-ml-4 [touch-action:pan-y_pinch-zoom]"
            : "-mt-4 flex-col [touch-action:pan-x_pinch-zoom]",
          className,
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { orientation, depth, registerSlide } = useCarousel()
  const nodeRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => nodeRef.current as HTMLDivElement)
  const scale = useMotionValue(1)
  const opacity = useMotionValue(1)

  React.useLayoutEffect(() => {
    const node = nodeRef.current
    if (!node || !depth) return
    return registerSlide(node, { scale, opacity })
  }, [depth, registerSlide, scale, opacity])

  return (
    <div
      ref={nodeRef}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    >
      {/* Embla translates the slide itself when looping, so depth goes on an inner layer. */}
      {depth ? (
        <m.div className="flex h-full w-full" style={{ scale, opacity }}>
          {children}
        </m.div>
      ) : (
        children
      )}
    </div>
  )
})
CarouselItem.displayName = "CarouselItem"

const navButtonClass = "h-11 w-11 shrink-0 rounded-full [&_svg]:h-4 [&_svg]:w-4"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof MotionButton>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <MotionButton
      ref={ref}
      feel="pop"
      variant={variant}
      size={size}
      className={cn(navButtonClass, className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </MotionButton>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof MotionButton>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <MotionButton
      ref={ref}
      feel="pop"
      variant={variant}
      size={size}
      className={cn(navButtonClass, className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </MotionButton>
  )
})
CarouselNext.displayName = "CarouselNext"

// Fully rounded at any size, so Motion can correct the radius while layout-scaling.
const PILL_RADIUS = { borderRadius: 999 }

const CarouselPagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { selectedIndex, scrollSnaps, scrollTo, autoplayEnabled, progress, layoutId } =
    useCarousel()
  const fine = useFinePointer()

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {scrollSnaps.map((_, index) => {
        const active = index === selectedIndex
        // With autoplay the active dot widens into a pill that fills over the interval.
        // The width change is a layout animation, so Motion runs it as a transform.
        const dot = (
          <m.span
            layout
            transition={springSnappy}
            style={PILL_RADIUS}
            className={cn(
              "relative block h-1.5 bg-primary/25 transition-colors group-hover:bg-primary/45",
              active && autoplayEnabled ? "w-5" : "w-1.5",
            )}
          >
            {/* One indicator that slides between dots as the carousel moves. */}
            {active && (
              <m.span
                layoutId={layoutId}
                transition={springSnappy}
                style={PILL_RADIUS}
                className={cn(
                  "absolute inset-0 overflow-hidden",
                  autoplayEnabled ? "bg-primary/35" : "bg-primary",
                )}
              >
                {autoplayEnabled && (
                  <m.span
                    aria-hidden
                    className="absolute inset-0 origin-left bg-primary"
                    style={{ scaleX: progress }}
                  />
                )}
              </m.span>
            )}
          </m.span>
        )
        // On touch screens a dozen dots can't each get a 44 px target in a phone-wide row, so
        // they are a progress indicator only; swiping and the 44 px prev/next buttons navigate.
        if (!fine) {
          return (
            <span key={index} aria-hidden className="flex h-11 items-center px-1">
              {dot}
            </span>
          )
        }
        return (
          <button
            key={index}
            type="button"
            className="group flex h-11 items-center rounded-full px-[9px] ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-current={active}
            onClick={() => scrollTo(index)}
          >
            {dot}
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        )
      })}
    </div>
  )
})
CarouselPagination.displayName = "CarouselPagination"

export {
  type CarouselApi,
  useCarousel,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselPagination,
}
