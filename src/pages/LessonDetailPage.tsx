import { Link, useNavigate, useParams } from "react-router-dom"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, RefreshCw, User } from "lucide-react"
import type { Subject } from "@/data/types"
import { classes } from "@/data/classes"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

const subjectTint: Record<Subject, string> = {
  math: "bg-subject-math-bg",
  chinese: "bg-subject-chinese-bg",
  english: "bg-subject-english-bg",
  science: "bg-subject-science-bg",
}

const subjectAccent: Record<Subject, string> = {
  math: "bg-subject-math-text",
  chinese: "bg-subject-chinese-text",
  english: "bg-subject-english-text",
  science: "bg-subject-science-text",
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

function formatTimeRange(startIso: string, endIso: string): string {
  const t = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  return `${t(startIso)} – ${t(endIso)}`
}

export default function LessonDetailPage() {
  const navigate = useNavigate()
  const { classId } = useParams<{ classId: string }>()

  const lesson = classes.find((c) => c.id === classId)

  if (!lesson) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500">Lesson not found</p>
        <Link to="/schedule" className="mt-3 text-sm text-primary-700">
          Back to schedule
        </Link>
      </div>
    )
  }

  const centre = centreById(lesson.centreId)
  const tutor = tutorById(lesson.tutorId)
  const seriesUrl = `/schedule/class/${lesson.centreId}/${lesson.classCode}`

  return (
    <div className="flex h-full flex-col pb-6">
      <div className={`${subjectTint[lesson.subject]} px-5 pt-4 pb-5`}>
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 text-sm text-gray-700 active:bg-white/40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${subjectAccent[lesson.subject]}`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Lesson
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">
          {subjectLabel[lesson.subject]}
        </h1>
        <p className="mt-1 text-sm text-gray-700">{lesson.level}</p>
      </div>

      <section className="px-5 pt-5">
        <div className="rounded-xl bg-surface px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {formatDateLine(lesson.startsAt)}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(lesson.startsAt).toLocaleDateString("en-SG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3 text-sm text-gray-700">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            {formatTimeRange(lesson.startsAt, lesson.endsAt)}
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            {centre?.name ?? "Unknown centre"}
          </div>
          {tutor && (
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
              <User className="h-4 w-4 shrink-0 text-gray-400" />
              {tutor.name}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/schedule/lesson/${lesson.id}/reschedule`)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm active:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          Request reschedule
        </button>

        <Link
          to={seriesUrl}
          className="mt-3 flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm text-gray-700 shadow-sm active:bg-surface-dim"
        >
          <span>See all {subjectLabel[lesson.subject]} lessons</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
      </section>
    </div>
  )
}
