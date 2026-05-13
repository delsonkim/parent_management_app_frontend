import { useEffect, useRef, useState, type ReactNode } from "react"

interface Props {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  renderDay: (date: Date) => ReactNode
}

const COMMIT_THRESHOLD_RATIO = 0.2
const VELOCITY_THRESHOLD = 0.4
const TRANSITION_MS = 220
const WHEEL_COMMIT_RATIO = 0.22
const WHEEL_HARD_LOCKOUT_MS = 320
const WHEEL_FILTER_DURATION_MS = 750
const WHEEL_FILTER_MAGNITUDE = 32
const WHEEL_IDLE_SNAP_MS = 110

function addDays(date: Date, delta: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function SwipeableDayView({
  selectedDate,
  onSelectDate,
  renderDay,
}: Props) {
  const [dragX, setDragX] = useState(0)
  const [animating, setAnimating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)

  // Pointer state
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const startTime = useRef<number>(0)
  const lastX = useRef<number>(0)
  const axisLocked = useRef<"x" | "y" | null>(null)
  const pointerId = useRef<number | null>(null)
  const widthRef = useRef<number>(0)

  // Wheel/trackpad state
  const wheelAcc = useRef(0)
  const wheelEndTimer = useRef<number | null>(null)
  const wheelHardLockUntil = useRef(0)
  const wheelFilterUntil = useRef(0)

  // Refs mirroring state for stable callbacks
  const animatingRef = useRef(false)
  const selectedDateRef = useRef(selectedDate)
  const onSelectDateRef = useRef(onSelectDate)

  useEffect(() => {
    animatingRef.current = animating
  }, [animating])
  useEffect(() => {
    selectedDateRef.current = selectedDate
  }, [selectedDate])
  useEffect(() => {
    onSelectDateRef.current = onSelectDate
  }, [onSelectDate])

  const prevDate = addDays(selectedDate, -1)
  const nextDate = addDays(selectedDate, 1)

  const getWidth = () =>
    widthRef.current || panelsRef.current?.clientWidth || 0

  const commitDirection = (direction: 1 | -1) => {
    const w = getWidth()
    setAnimating(true)
    setDragX(direction === 1 ? -w : w)
    window.setTimeout(() => {
      const current = selectedDateRef.current
      const target = addDays(current, direction)
      setAnimating(false)
      setDragX(0)
      onSelectDateRef.current(target)
    }, TRANSITION_MS)
  }

  const snapBack = () => {
    setAnimating(true)
    setDragX(0)
    window.setTimeout(() => setAnimating(false), TRANSITION_MS)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animating) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    pointerId.current = e.pointerId
    startX.current = e.clientX
    startY.current = e.clientY
    lastX.current = e.clientX
    startTime.current = performance.now()
    axisLocked.current = null
    widthRef.current = panelsRef.current?.clientWidth ?? 0
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return
    if (startX.current === null || startY.current === null) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (axisLocked.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      axisLocked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
      if (axisLocked.current === "x") {
        containerRef.current?.setPointerCapture(e.pointerId)
      }
    }

    if (axisLocked.current === "x") {
      lastX.current = e.clientX
      const w = getWidth()
      const clamped = Math.max(-w, Math.min(w, dx))
      setDragX(clamped)
    }
  }

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return
    const locked = axisLocked.current
    const dx = lastX.current - (startX.current ?? lastX.current)
    pointerId.current = null
    startX.current = null
    startY.current = null
    axisLocked.current = null

    if (locked !== "x") return

    const w = getWidth() || 1
    const elapsed = performance.now() - startTime.current
    const velocity = Math.abs(dx) / Math.max(1, elapsed)
    const passedDistance = Math.abs(dx) > w * COMMIT_THRESHOLD_RATIO
    const passedVelocity = velocity > VELOCITY_THRESHOLD && Math.abs(dx) > 30

    if (passedDistance || passedVelocity) {
      commitDirection(dx < 0 ? 1 : -1)
    } else {
      snapBack()
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return
      if (e.deltaX === 0) return

      e.preventDefault()

      const now = performance.now()

      // Hard lockout right after a commit (covers the slide animation).
      // Fixed window — events during this window NEVER extend the lockout.
      if (now < wheelHardLockUntil.current) return
      if (animatingRef.current) return

      // Magnitude filter window — runs after the hard lockout. Decaying
      // inertia events have small |deltaX| and get swallowed here, so
      // they can't accumulate past the commit threshold. A strong event
      // (≥ WHEEL_FILTER_MAGNITUDE) means the user is actively swiping
      // again — break out of the filter immediately.
      if (now < wheelFilterUntil.current) {
        if (Math.abs(e.deltaX) < WHEEL_FILTER_MAGNITUDE) return
        wheelFilterUntil.current = 0
        wheelAcc.current = 0
      }

      const w = panelsRef.current?.clientWidth ?? 0
      if (w === 0) return
      widthRef.current = w

      wheelAcc.current -= e.deltaX
      if (wheelAcc.current > w) wheelAcc.current = w
      if (wheelAcc.current < -w) wheelAcc.current = -w

      const threshold = w * WHEEL_COMMIT_RATIO
      if (Math.abs(wheelAcc.current) >= threshold) {
        const dir: 1 | -1 = wheelAcc.current < 0 ? 1 : -1
        wheelAcc.current = 0
        wheelHardLockUntil.current = now + WHEEL_HARD_LOCKOUT_MS
        wheelFilterUntil.current =
          now + WHEEL_HARD_LOCKOUT_MS + WHEEL_FILTER_DURATION_MS
        if (wheelEndTimer.current) {
          window.clearTimeout(wheelEndTimer.current)
          wheelEndTimer.current = null
        }
        commitDirection(dir)
        return
      }

      setDragX(wheelAcc.current)

      if (wheelEndTimer.current) window.clearTimeout(wheelEndTimer.current)
      wheelEndTimer.current = window.setTimeout(() => {
        wheelEndTimer.current = null
        if (Math.abs(wheelAcc.current) < 1) return
        wheelAcc.current = 0
        snapBack()
      }, WHEEL_IDLE_SNAP_MS)
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      el.removeEventListener("wheel", handleWheel)
      if (wheelEndTimer.current) window.clearTimeout(wheelEndTimer.current)
    }
  }, [])

  useEffect(() => {
    setDragX(0)
    setAnimating(false)
  }, [selectedDate])

  const transitionStyle = animating
    ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
    : "none"

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      className="flex flex-1 flex-col overflow-hidden touch-pan-y select-none"
    >
      <div ref={panelsRef} className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            transform: `translate3d(calc(-100% + ${dragX}px), 0, 0)`,
            transition: transitionStyle,
            willChange: "transform",
          }}
        >
          <div className="h-full w-full shrink-0 overflow-y-auto">
            {renderDay(prevDate)}
          </div>
          <div className="h-full w-full shrink-0 overflow-y-auto">
            {renderDay(selectedDate)}
          </div>
          <div className="h-full w-full shrink-0 overflow-y-auto">
            {renderDay(nextDate)}
          </div>
        </div>
      </div>
    </div>
  )
}
