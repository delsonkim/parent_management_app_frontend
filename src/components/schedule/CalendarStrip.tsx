import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Rows3 } from "lucide-react"
import type { Subject } from "@/data/types"
import { classes } from "@/data/classes"

const subjectDotColor: Record<Subject, string> = {
  math: "bg-subject-math-text",
  chinese: "bg-subject-chinese-text",
  english: "bg-subject-english-text",
  science: "bg-subject-science-text",
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function startOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  out.setDate(d.getDate() - d.getDay())
  return out
}

function firstOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function defaultDotsForDay(d: Date): Subject[] {
  const seen = new Set<Subject>()
  for (const cls of classes) {
    const s = new Date(cls.startsAt)
    if (sameDay(s, d)) seen.add(cls.subject)
  }
  return Array.from(seen)
}

// Always returns 42 days (6 weeks) starting from the Sunday before/on the first of the month.
function monthGridDays(monthStart: Date): Date[] {
  const firstDay = firstOfMonth(monthStart)
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstDay.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"]
const WEEKS_BEHIND = 1
const WEEKS_AHEAD = 26
const MONTHS_BEHIND = 1
const MONTHS_AHEAD = 11

interface Props {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  dotsForDay?: (d: Date) => Subject[]
  availabilityForDay?: (d: Date) => boolean
}

export default function CalendarStrip({
  selectedDate,
  onSelectDate,
  dotsForDay = defaultDotsForDay,
  availabilityForDay,
}: Props) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [expanded, setExpanded] = useState(false)
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() =>
    firstOfMonth(selectedDate),
  )

  useEffect(() => {
    if (!expanded) setDisplayedMonth(firstOfMonth(selectedDate))
  }, [selectedDate, expanded])

  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(today)
    const firstWeekStart = new Date(currentWeekStart)
    firstWeekStart.setDate(currentWeekStart.getDate() - WEEKS_BEHIND * 7)
    return Array.from({ length: WEEKS_BEHIND + WEEKS_AHEAD + 1 }, (_, wi) => {
      const weekStart = new Date(firstWeekStart)
      weekStart.setDate(firstWeekStart.getDate() + wi * 7)
      return Array.from({ length: 7 }, (_, di) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + di)
        return d
      })
    })
  }, [today])

  const months = useMemo(() => {
    const todayMonth = firstOfMonth(today)
    const start = new Date(
      todayMonth.getFullYear(),
      todayMonth.getMonth() - MONTHS_BEHIND,
      1,
    )
    return Array.from(
      { length: MONTHS_BEHIND + MONTHS_AHEAD + 1 },
      (_, i) =>
        new Date(start.getFullYear(), start.getMonth() + i, 1),
    )
  }, [today])

  const weekRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const monthRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const monthScrollerRef = useRef<HTMLDivElement>(null)
  const weekScrollerRef = useRef<HTMLDivElement>(null)

  // Snap collapsed week strip to the week containing the selected date.
  // Skip if the strip is already on that week — otherwise we'd fight the
  // user's in-flight swipe gesture.
  useEffect(() => {
    if (expanded) return
    const targetIdx = weeks.findIndex((w) =>
      w.some((d) => sameDay(d, selectedDate)),
    )
    if (targetIdx === -1) return
    const scroller = weekScrollerRef.current
    if (scroller && scroller.clientWidth > 0) {
      const currentIdx = Math.round(
        scroller.scrollLeft / scroller.clientWidth,
      )
      if (currentIdx === targetIdx) return
    }
    weekRefs.current.get(targetIdx)?.scrollIntoView({
      behavior: "auto",
      inline: "start",
      block: "nearest",
    })
  }, [expanded, selectedDate, weeks])

  // As the user swipes the week strip, move the selected date to the same
  // weekday in the newly-visible week (iOS Calendar behaviour).
  const handleWeekScroll = () => {
    if (expanded) return
    const scroller = weekScrollerRef.current
    if (!scroller || scroller.clientWidth === 0) return
    const idx = Math.round(scroller.scrollLeft / scroller.clientWidth)
    if (idx < 0 || idx >= weeks.length) return
    const week = weeks[idx]
    const target = week[selectedDate.getDay()]
    if (!sameDay(target, selectedDate)) onSelectDate(target)
  }

  // When entering month view, scroll to the displayed month.
  useEffect(() => {
    if (!expanded) return
    const idx = months.findIndex((m) => sameMonth(m, displayedMonth))
    if (idx === -1) return
    monthRefs.current.get(idx)?.scrollIntoView({
      behavior: "auto",
      inline: "start",
      block: "nearest",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  // Track displayed month as user swipes between months.
  const handleMonthScroll = () => {
    const scroller = monthScrollerRef.current
    if (!scroller) return
    const idx = Math.round(scroller.scrollLeft / scroller.clientWidth)
    if (idx < 0 || idx >= months.length) return
    const newMonth = months[idx]
    if (!sameMonth(newMonth, displayedMonth)) setDisplayedMonth(newMonth)
  }

  const monthLabel = (expanded ? displayedMonth : selectedDate).toLocaleDateString(
    "en-SG",
    { year: "numeric", month: "long" },
  )

  const handleSelect = (d: Date) => {
    onSelectDate(d)
    if (expanded) setExpanded(false)
  }

  const shiftMonth = (delta: number) => {
    const idx = months.findIndex((m) => sameMonth(m, displayedMonth))
    const targetIdx = idx + delta
    if (targetIdx < 0 || targetIdx >= months.length) return
    monthRefs.current.get(targetIdx)?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    })
  }

  return (
    <header className="bg-surface px-5 pt-5 pb-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{monthLabel}</h1>
        <div className="flex items-center gap-1">
          {expanded && (
            <>
              <button
                onClick={() => shiftMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 active:bg-surface-dim"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 active:bg-surface-dim"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`flex h-8 w-8 items-center justify-center rounded-full active:bg-surface-dim ${
              expanded
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600"
            }`}
            aria-label={expanded ? "Switch to week view" : "Switch to month view"}
            aria-pressed={expanded}
          >
            {expanded ? (
              <Rows3 className="h-4 w-4" />
            ) : (
              <CalendarDays className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3">
          <div className="grid grid-cols-7 gap-1 pb-1">
            {WEEKDAY_LETTERS.map((l, idx) => (
              <span
                key={idx}
                className="text-center text-[11px] font-medium uppercase text-gray-400"
              >
                {l}
              </span>
            ))}
          </div>
          <div
            ref={monthScrollerRef}
            onScroll={handleMonthScroll}
            className="flex snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {months.map((monthStart, mi) => {
              const grid = monthGridDays(monthStart)
              return (
                <div
                  key={mi}
                  ref={(el) => {
                    if (el) monthRefs.current.set(mi, el)
                    else monthRefs.current.delete(mi)
                  }}
                  className="grid w-full shrink-0 snap-start snap-always grid-cols-7 gap-1"
                >
                  {grid.map((d) => {
                    const isToday = sameDay(d, today)
                    const isSelected = sameDay(d, selectedDate)
                    const inMonth = d.getMonth() === monthStart.getMonth()
                    const dots = dotsForDay(d)
                    let cellStyle = inMonth ? "text-gray-900" : "text-gray-300"
                    if (isSelected)
                      cellStyle = "bg-primary-600 text-white font-semibold"
                    else if (isToday)
                      cellStyle = "border border-primary-400 text-gray-900"

                    const available = availabilityForDay?.(d) ?? false
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => handleSelect(d)}
                        className="flex flex-col items-center gap-1 py-1"
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${cellStyle}`}
                        >
                          {d.getDate()}
                        </span>
                        <span
                          className={`h-0.5 w-4 rounded-full ${
                            available ? "bg-primary-500" : "bg-transparent"
                          }`}
                        />
                        <div className="flex h-1.5 gap-0.5">
                          {dots.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className={`h-1.5 w-1.5 rounded-full ${subjectDotColor[s]}`}
                            />
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div
          ref={weekScrollerRef}
          onScroll={handleWeekScroll}
          className="mt-4 flex snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {weeks.map((week, wi) => {
            return (
              <div
                key={wi}
                ref={(el) => {
                  if (el) weekRefs.current.set(wi, el)
                  else weekRefs.current.delete(wi)
                }}
                className="grid w-full shrink-0 snap-start snap-always grid-cols-7 gap-1"
              >
                {week.map((d) => {
                  const isToday = sameDay(d, today)
                  const isSelected = sameDay(d, selectedDate)
                  const dots = dotsForDay(d)
                  const available = availabilityForDay?.(d) ?? false

                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => handleSelect(d)}
                      className="flex flex-col items-center gap-1 py-1"
                    >
                      <span
                        className={`text-[11px] font-medium uppercase ${
                          isSelected ? "text-primary-700" : "text-gray-400"
                        }`}
                      >
                        {WEEKDAY_LETTERS[d.getDay()]}
                      </span>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                          isSelected
                            ? "bg-primary-600 text-white font-semibold"
                            : isToday
                            ? "border border-primary-400 text-gray-900"
                            : "text-gray-900"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      <span
                        className={`h-0.5 w-4 rounded-full ${
                          available ? "bg-primary-500" : "bg-transparent"
                        }`}
                      />
                      <div className="flex h-1.5 gap-0.5">
                        {dots.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className={`h-1.5 w-1.5 rounded-full ${subjectDotColor[s]}`}
                          />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </header>
  )
}

export { startOfWeek, sameDay }
