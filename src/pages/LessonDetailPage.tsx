import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Quote,
  RefreshCw,
  User,
} from "lucide-react"
import type { Subject } from "@/data/types"
import { classes } from "@/data/classes"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"
import { invoiceForLesson } from "@/data/invoices"
import {
  pendingRescheduleForClass,
  rescheduleForClass,
} from "@/data/reschedules"
import { attendanceStatusPill } from "@/components/attendance/attendanceStatus"

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

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SG", {
    month: "long",
    year: "numeric",
  })
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

  const now = Date.now()
  const isPast = new Date(lesson.startsAt).getTime() < now
  const statusPill = attendanceStatusPill[lesson.status]

  const pendingReschedule =
    lesson.status === "scheduled"
      ? pendingRescheduleForClass(lesson.id)
      : undefined
  const relatedReschedule =
    lesson.status === "rescheduled-out"
      ? rescheduleForClass(lesson.id)
      : undefined

  const invoice = isPast ? invoiceForLesson(lesson) : undefined

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
        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">
              {subjectLabel[lesson.subject]}
            </h1>
            <p className="mt-1 text-sm text-gray-700">{lesson.level}</p>
          </div>
          {statusPill && (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusPill.className}`}
            >
              {statusPill.label}
            </span>
          )}
        </div>
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

        {/* Future scheduled lesson with a pending reschedule */}
        {lesson.status === "scheduled" && pendingReschedule && (
          <Link
            to={`/schedule/reschedule/${pendingReschedule.id}`}
            className="mt-4 flex items-center justify-between rounded-xl bg-warning-bg px-4 py-3 text-sm text-warning-text shadow-sm active:opacity-90"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">Reschedule pending</span> ·
                tap to view request
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        )}

        {/* Future scheduled lesson with no pending request — show CTA */}
        {lesson.status === "scheduled" && !pendingReschedule && (
          <button
            type="button"
            onClick={() => navigate(`/schedule/lesson/${lesson.id}/reschedule`)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm active:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Request reschedule
          </button>
        )}

        {/* Attended */}
        {lesson.status === "present" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Aiden attended this lesson.</span>
          </div>
        )}

        {lesson.status === "present" && lesson.attendanceNote && (
          <div className="mt-3 rounded-xl bg-surface px-4 py-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
              <Quote className="h-3.5 w-3.5" />
              From the tutor
            </p>
            <p className="mt-2 text-sm text-gray-700">
              {lesson.attendanceNote}
            </p>
          </div>
        )}

        {/* Absent */}
        {lesson.status === "absent" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-error-bg px-4 py-3 text-sm text-error-text">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Marked absent</p>
              <p className="mt-0.5 text-xs">
                Aiden didn't attend this lesson. Next time, submit a
                reschedule request from the lesson page before the start time.
              </p>
            </div>
          </div>
        )}

        {/* Rescheduled-out (student missed because they got moved) */}
        {lesson.status === "rescheduled-out" && (
          <div className="mt-4 rounded-xl bg-warning-bg px-4 py-3 text-sm text-warning-text">
            <p className="flex items-center gap-2 font-medium">
              <RefreshCw className="h-4 w-4 shrink-0" />
              Aiden missed this lesson — rescheduled
            </p>
            {relatedReschedule && (
              <Link
                to={`/schedule/reschedule/${relatedReschedule.id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline"
              >
                View reschedule details
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        {/* Rescheduled-in (makeup attended) */}
        {lesson.status === "rescheduled-in" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Makeup attended</p>
              <p className="mt-0.5 text-xs">
                Aiden attended this as a replacement for a missed lesson.
              </p>
            </div>
          </div>
        )}

        {/* Cancelled */}
        {lesson.status === "cancelled" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>This lesson was cancelled by the centre.</span>
          </div>
        )}

        <Link
          to={seriesUrl}
          className="mt-3 flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm text-gray-700 shadow-sm active:bg-surface-dim"
        >
          <span>See all {subjectLabel[lesson.subject]} lessons</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>

        {invoice && (
          <Link
            to={`/payments/${invoice.id}`}
            className="mt-2 flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm text-gray-700 shadow-sm active:bg-surface-dim"
          >
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-gray-400">
                Part of invoice
              </span>
              <span className="mt-0.5 block truncate font-medium text-gray-900">
                {invoice.invoiceNumber} · {centre?.name ?? "centre"}{" "}
                {formatMonthYear(invoice.billingPeriodStart)}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          </Link>
        )}
      </section>
    </div>
  )
}
