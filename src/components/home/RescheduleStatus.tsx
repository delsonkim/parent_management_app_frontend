import { Link } from "react-router-dom"
import { RefreshCw } from "lucide-react"
import type { RescheduleStatus as Status, Subject } from "@/data/types"
import { activeReschedule } from "@/data/reschedules"
import { classes } from "@/data/classes"

const statusStyles: Record<Status, { pill: string; accent: string; label: string }> = {
  pending: {
    pill: "bg-warning-bg text-warning-text border border-warning-border",
    accent: "bg-warning-text",
    label: "Pending",
  },
  approved: {
    pill: "bg-success-bg text-success-text border border-success-border",
    accent: "bg-success-text",
    label: "Approved",
  },
  declined: {
    pill: "bg-error-bg text-error-text border border-error-border",
    accent: "bg-error-text",
    label: "Declined",
  },
}

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })} · ${d.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`
}

export default function RescheduleStatus() {
  const request = activeReschedule()
  if (!request) return null

  const originalClass = classes.find((c) => c.id === request.originalClassId)
  if (!originalClass) return null

  const style = statusStyles[request.status]

  return (
    <section className="px-5 pb-4">
      <h2 className="mb-3 text-base font-semibold text-gray-900">
        Reschedule request
      </h2>
      <Link
        to={`/schedule/reschedule/${request.id}`}
        className="flex overflow-hidden rounded-xl bg-surface shadow-sm transition-colors active:bg-surface-dim"
      >
        <div className={`w-1.5 shrink-0 ${style.accent}`} />
        <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <RefreshCw className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              {subjectLabel[originalClass.subject]} reschedule
            </p>
            <p className="mt-1 text-sm text-gray-600">
              From {formatDateTime(originalClass.startsAt)}
            </p>
            {request.replacement && (
              <p className="text-sm text-gray-600">
                To {formatDateTime(request.replacement.startsAt)}
              </p>
            )}
            {request.status === "declined" && request.declineReason && (
              <p className="mt-1 text-xs text-error-text">
                {request.declineReason}
              </p>
            )}
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.pill}`}
          >
            {style.label}
          </span>
        </div>
      </Link>
    </section>
  )
}
