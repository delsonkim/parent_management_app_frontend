import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, Clock, MapPin, Receipt, RefreshCw } from "lucide-react"
import type { Class, RescheduleStatus, Subject } from "@/data/types"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"
import { upcomingClasses } from "@/data/classes"
import { outstandingInvoices } from "@/data/invoices"
import { activeReschedule } from "@/data/reschedules"
import { classes } from "@/data/classes"

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

const centrePill: Record<string, string> = {
  ctr_mvp: "bg-info-text text-white",
  ctr_bm: "bg-warning-text text-white",
  ctr_lh: "bg-subject-social-text text-white",
}

const rescheduleMeta: Record<
  RescheduleStatus,
  { label: string; pill: string; accent: string }
> = {
  pending: {
    label: "Pending centre approval",
    pill: "bg-warning-bg text-warning-text",
    accent: "bg-warning-text",
  },
  approved: {
    label: "Approved",
    pill: "bg-success-bg text-success-text",
    accent: "bg-success-text",
  },
  declined: {
    label: "Declined",
    pill: "bg-error-bg text-error-text",
    accent: "bg-error-text",
  },
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

function NextUpSlide({ cls }: { cls: Class }) {
  const centre = centreById(cls.centreId)
  const tutor = tutorById(cls.tutorId)
  const style = heroStyles[cls.subject]

  return (
    <Link
      to={`/schedule/lesson/${cls.id}`}
      className={`block h-full overflow-hidden rounded-2xl ${style.bg} shadow-sm transition-transform active:scale-[0.99]`}
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
        <span
          className={`mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            centrePill[cls.centreId] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{centre?.name ?? "Unknown centre"}</span>
        </span>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-700">
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
  )
}

function BillsSlide() {
  const items = outstandingInvoices()
  const total = items.reduce((sum, inv) => sum + inv.amount, 0)
  const overdueCount = items.filter((i) => i.status === "overdue").length
  const hasOverdue = overdueCount > 0
  const to =
    items.length === 1 ? `/payments/${items[0].id}` : "/payments"

  return (
    <Link
      to={to}
      className={`block h-full overflow-hidden rounded-2xl ${
        hasOverdue ? "bg-error-bg" : "bg-warning-bg"
      } shadow-sm transition-transform active:scale-[0.99]`}
    >
      <div className="flex items-center gap-2 px-5 pt-4">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            hasOverdue ? "bg-error-text" : "bg-warning-text"
          }`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            hasOverdue ? "text-error-text" : "text-warning-text"
          }`}
        >
          {hasOverdue ? "Action needed · Bills overdue" : "Bills to pay"}
        </span>
      </div>
      <div className="px-5 pb-5 pt-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          ${total.toFixed(0)}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
          <Receipt className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          {items.length} {items.length === 1 ? "invoice" : "invoices"} outstanding
        </p>
        {hasOverdue && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-medium text-error-text shadow-sm">
            <AlertCircle className="h-3 w-3" />
            {overdueCount} overdue
          </span>
        )}
      </div>
    </Link>
  )
}

function RescheduleSlide() {
  const request = activeReschedule()
  if (!request) return null
  const originalClass = classes.find((c) => c.id === request.originalClassId)
  if (!originalClass) return null

  const meta = rescheduleMeta[request.status]

  return (
    <Link
      to={`/schedule/reschedule/${request.id}`}
      className="block h-full overflow-hidden rounded-2xl bg-surface-dim shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center gap-2 px-5 pt-4">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.accent}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          Reschedule · {meta.label}
        </span>
      </div>
      <div className="px-5 pb-5 pt-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          {subjectLabel[originalClass.subject]}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
          <RefreshCw className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          {new Date(originalClass.startsAt).toLocaleDateString("en-SG", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </p>
        <span
          className={`mt-3 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${meta.pill}`}
        >
          {meta.label}
        </span>
      </div>
    </Link>
  )
}

export default function HomeCarousel() {
  const slides: { key: string; node: React.ReactNode }[] = []

  const next = upcomingClasses(1)[0]
  if (next) slides.push({ key: "next", node: <NextUpSlide cls={next} /> })

  if (outstandingInvoices().length > 0) {
    slides.push({ key: "bills", node: <BillsSlide /> })
  }

  if (activeReschedule()) {
    slides.push({ key: "reschedule", node: <RescheduleSlide /> })
  }

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  if (slides.length === 0) return null

  const handleScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeIdx) setActiveIdx(idx)
  }

  return (
    <section className="pb-4">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <div
            key={slide.key}
            className="w-full shrink-0 snap-start snap-always px-5"
          >
            {slide.node}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <span
              key={slide.key}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIdx
                  ? "w-4 bg-primary-600"
                  : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function hasNextUp(): boolean {
  return upcomingClasses(1).length > 0
}
