import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  Clock,
  RefreshCw,
  User,
} from "lucide-react"
import type { Class, Subject } from "@/data/types"
import {
  attendanceStats,
  classes,
  pastLessonsForClass,
} from "@/data/classes"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"
import { child } from "@/data/parent"
import { attendanceStatusPill } from "@/components/attendance/attendanceStatus"

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

const subjectAccent: Record<Subject, string> = {
  math: "bg-subject-math-text",
  chinese: "bg-subject-chinese-text",
  english: "bg-subject-english-text",
  science: "bg-subject-science-text",
}

const subjectTint: Record<Subject, string> = {
  math: "bg-subject-math-bg",
  chinese: "bg-subject-chinese-bg",
  english: "bg-subject-english-bg",
  science: "bg-subject-science-bg",
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatDateLine(iso: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)

  if (target.getTime() === today.getTime()) return "Today"
  if (target.getTime() === tomorrow.getTime()) return "Tomorrow"
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
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

export default function ClassDetailPage() {
  const navigate = useNavigate()
  const { centreId, classCode } = useParams<{
    centreId: string
    classCode: string
  }>()

  const series: Class[] = classes
    .filter((c) => c.centreId === centreId && c.classCode === classCode)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )

  if (series.length === 0 || !centreId || !classCode) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500">Class not found</p>
        <Link to="/schedule" className="mt-3 text-sm text-primary-700">
          Back to schedule
        </Link>
      </div>
    )
  }

  const sample = series[0]
  const centre = centreById(sample.centreId)
  const tutor = tutorById(sample.tutorId)

  const today = startOfToday()
  const upcoming = series.filter(
    (c) => new Date(c.startsAt).getTime() >= today,
  )

  const past = pastLessonsForClass(centreId, classCode, child.id)
  const stats = attendanceStats(past)
  const ratePct = Math.round(stats.rate * 100)

  return (
    <div className="flex h-full flex-col pb-6">
      <div className={`${subjectTint[sample.subject]} px-5 pt-4 pb-6`}>
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 text-sm text-gray-700 active:bg-white/40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          {subjectLabel[sample.subject]}
        </h1>
        <p className="mt-1 text-sm text-gray-700">
          {centre?.name ?? "Unknown centre"} · {sample.level}
        </p>
        {tutor && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
            <User className="h-3.5 w-3.5" />
            {tutor.name}
          </p>
        )}
      </div>

      <section className="px-5 pt-5">
        <h2 className="text-base font-semibold text-gray-900">
          Upcoming lessons
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          {upcoming.length} {upcoming.length === 1 ? "lesson" : "lessons"}{" "}
          scheduled
        </p>

        {upcoming.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-8 text-center text-sm text-gray-500">
            No upcoming lessons in this class
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {upcoming.map((lesson) => (
              <div
                key={lesson.id}
                className="flex overflow-hidden rounded-xl bg-surface shadow-sm"
              >
                <div
                  className={`w-1.5 shrink-0 ${subjectAccent[lesson.subject]}`}
                />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {formatDateLine(lesson.startsAt)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {formatTimeRange(lesson.startsAt, lesson.endsAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 active:bg-surface-dim"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Attendance history
          </h2>
          {stats.total > 0 && (
            <span className="text-xs font-medium text-gray-600">
              {stats.attended}/{stats.total} attended · {ratePct}%
            </span>
          )}
        </div>

        {past.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-8 text-center text-sm text-gray-500">
            No past lessons yet
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl bg-surface shadow-sm">
            {past.map((lesson, idx) => {
              const pill = attendanceStatusPill[lesson.status]
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    idx > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatShortDate(lesson.startsAt)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatTimeRange(lesson.startsAt, lesson.endsAt)}
                    </p>
                  </div>
                  {pill && (
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${pill.className}`}
                    >
                      {pill.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
