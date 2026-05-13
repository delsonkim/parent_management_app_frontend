import { useMemo, useState } from "react"
import ClassCard from "@/components/home/ClassCard"
import CalendarStrip, {
  sameDay,
} from "@/components/schedule/CalendarStrip"
import SwipeableDayView from "@/components/schedule/SwipeableDayView"
import { classes } from "@/data/classes"

function todayAtMidnight(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function fullDateLabel(d: Date): string {
  const today = todayAtMidnight()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (sameDay(d, today)) return "Today"
  if (sameDay(d, tomorrow)) return "Tomorrow"
  return d.toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(todayAtMidnight())

  const classesByDay = useMemo(() => {
    const map = new Map<string, typeof classes>()
    for (const c of classes) {
      const d = new Date(c.startsAt)
      d.setHours(0, 0, 0, 0)
      const key = d.toISOString()
      const list = map.get(key) ?? []
      list.push(c)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
    }
    return map
  }, [])

  const renderDay = (date: Date) => {
    const key = (() => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.toISOString()
    })()
    const list = classesByDay.get(key) ?? []
    return (
      <section className="mt-4 px-5 pb-6">
        <h2 className="mb-2 text-sm font-medium text-primary-800">
          {fullDateLabel(date)}
        </h2>
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-10 text-center text-sm text-gray-500">
            No classes on this day
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <SwipeableDayView
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        renderDay={renderDay}
      />
    </div>
  )
}
