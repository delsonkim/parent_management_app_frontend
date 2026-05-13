import { Link } from "react-router-dom"
import { BookOpen, Clock } from "lucide-react"
import type { Class, Subject } from "@/data/types"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"

const accentBarBySubject: Record<Subject, string> = {
  math: "bg-subject-math-text",
  chinese: "bg-subject-chinese-text",
  english: "bg-subject-english-text",
  science: "bg-subject-science-text",
}

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

function splitTime(iso: string): { primary: string; meridiem: string } {
  const parts = new Date(iso)
    .toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .split(" ")
  return { primary: parts[0], meridiem: parts[1] ?? "" }
}

function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

interface Props {
  cls: Class
}

export default function ClassCard({ cls }: Props) {
  const centre = centreById(cls.centreId)
  const tutor = tutorById(cls.tutorId)
  const { primary, meridiem } = splitTime(cls.startsAt)

  return (
    <Link
      to={`/schedule/lesson/${cls.id}`}
      className="flex overflow-hidden rounded-xl bg-surface shadow-sm transition-colors active:bg-surface-dim"
    >
      <div className={`w-1.5 shrink-0 ${accentBarBySubject[cls.subject]}`} />
      <div className="flex w-20 shrink-0 flex-col items-center justify-center py-4">
        <span className="text-2xl font-semibold leading-none text-gray-900">
          {primary}
        </span>
        {meridiem && (
          <span className="mt-1 text-xs font-medium text-gray-500">
            {meridiem}
          </span>
        )}
      </div>
      <div className="w-px shrink-0 self-stretch bg-gray-100" />
      <div className="min-w-0 flex-1 px-4 py-3">
        <p className="truncate text-sm font-semibold text-gray-900">
          {centre?.name ?? "Unknown centre"}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{subjectLabel[cls.subject]}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600">
          <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{formatTimeRange(cls.startsAt, cls.endsAt)}</span>
        </p>
        {tutor && (
          <span className="mt-2 inline-flex rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
            {tutor.name}
          </span>
        )}
      </div>
    </Link>
  )
}
