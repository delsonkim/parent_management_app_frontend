import { Link } from "react-router-dom"
import ClassCard from "./ClassCard"
import SectionEmptyState from "./SectionEmptyState"
import { upcomingClasses } from "@/data/classes"
import type { Class } from "@/data/types"

const VISIBLE_LIMIT = 3

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabel(iso: string): string {
  const target = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (dayKey(target.toISOString()) === dayKey(today.toISOString())) return "Today"
  if (dayKey(target.toISOString()) === dayKey(tomorrow.toISOString()))
    return "Tomorrow"
  return target.toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function groupByDay(items: Class[]): { label: string; items: Class[] }[] {
  const groups: { label: string; items: Class[] }[] = []
  for (const cls of items) {
    const label = dayLabel(cls.startsAt)
    const existing = groups.find((g) => g.label === label)
    if (existing) existing.items.push(cls)
    else groups.push({ label, items: [cls] })
  }
  return groups
}

interface Props {
  skipFirst?: boolean
}

export default function UpcomingClasses({ skipFirst = false }: Props) {
  const all = upcomingClasses()
  const pool = skipFirst ? all.slice(1) : all
  const visible = pool.slice(0, VISIBLE_LIMIT)
  const showSeeAll = pool.length > VISIBLE_LIMIT
  const groups = groupByDay(visible)
  const heading = skipFirst ? "Later this week" : "Upcoming classes"

  if (skipFirst && pool.length === 0) return null

  return (
    <section className="px-5 pb-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-gray-900">{heading}</h2>
        {showSeeAll && (
          <Link
            to="/schedule"
            className="text-sm font-medium text-primary-700"
          >
            See all
          </Link>
        )}
      </div>
      {visible.length === 0 ? (
        <SectionEmptyState message="No upcoming classes this week" />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-sm font-medium text-primary-800">
                {group.label}
              </h3>
              <div className="flex flex-col gap-2">
                {group.items.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
