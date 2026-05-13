import { Link } from "react-router-dom"
import { Clock, MapPin } from "lucide-react"
import type { Class, Subject } from "@/data/types"
import { upcomingClasses } from "@/data/classes"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"

const heroStyles: Record<
  Subject,
  { bg: string; accent: string; eyebrow: string }
> = {
  math: {
    bg: "bg-subject-math-bg",
    accent: "bg-subject-math-text",
    eyebrow: "text-subject-math-text",
  },
  chinese: {
    bg: "bg-subject-chinese-bg",
    accent: "bg-subject-chinese-text",
    eyebrow: "text-subject-chinese-text",
  },
  english: {
    bg: "bg-subject-english-bg",
    accent: "bg-subject-english-text",
    eyebrow: "text-subject-english-text",
  },
  science: {
    bg: "bg-subject-science-bg",
    accent: "bg-subject-science-text",
    eyebrow: "text-subject-science-text",
  },
}

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

function relativeStart(iso: string): string {
  const start = new Date(iso)
  const now = new Date()
  const diffMs = start.getTime() - now.getTime()
  const diffMin = Math.round(diffMs / 60000)
  const diffHr = Math.round(diffMs / (60 * 60 * 1000))

  if (diffMin < 60) {
    if (diffMin <= 1) return "Starting now"
    return `in ${diffMin} min`
  }
  if (diffHr < 24 && start.getDate() === now.getDate()) {
    return `in ${diffHr} ${diffHr === 1 ? "hour" : "hours"}`
  }

  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const timeLabel = start.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  if (start.toDateString() === tomorrow.toDateString())
    return `tomorrow at ${timeLabel}`

  const sixDaysOut = new Date(now)
  sixDaysOut.setDate(now.getDate() + 6)
  if (start <= sixDaysOut)
    return `${start.toLocaleDateString("en-SG", { weekday: "long" })} at ${timeLabel}`

  return `${start.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })} at ${timeLabel}`
}

function formatTimeRange(startIso: string, endIso: string): string {
  const t = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  return `${t(startIso)} – ${t(endIso)}`
}

export default function NextUpHero({ cls }: { cls: Class }) {
  const centre = centreById(cls.centreId)
  const tutor = tutorById(cls.tutorId)
  const style = heroStyles[cls.subject]

  return (
    <section className="px-5 pb-4">
      <Link
        to={`/schedule/lesson/${cls.id}`}
        className={`block overflow-hidden rounded-2xl ${style.bg} shadow-sm transition-transform active:scale-[0.99]`}
      >
        <div className="flex items-center gap-2 px-5 pt-4">
          <span className={`h-1.5 w-1.5 rounded-full ${style.accent}`} />
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${style.eyebrow}`}
          >
            Next up · {relativeStart(cls.startsAt)}
          </span>
        </div>
        <div className="px-5 pb-5 pt-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            {subjectLabel[cls.subject]}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            {centre?.name ?? "Unknown centre"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-700">
            <Clock className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            {formatTimeRange(cls.startsAt, cls.endsAt)}
          </p>
          {tutor && (
            <span className="mt-3 inline-flex rounded-full bg-surface px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
              {tutor.name}
            </span>
          )}
        </div>
      </Link>
    </section>
  )
}

export function pickNextUp(): Class | undefined {
  return upcomingClasses(1)[0]
}
