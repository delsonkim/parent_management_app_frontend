import { Link } from "react-router-dom"
import { RefreshCw } from "lucide-react"
import type { RescheduleStatus, Subject } from "@/data/types"
import { activeReschedule } from "@/data/reschedules"
import { classes } from "@/data/classes"

const statusMeta: Record<RescheduleStatus, { label: string; accent: string; pill: string }> = {
  pending: {
    label: "Pending",
    accent: "bg-warning-text",
    pill: "bg-warning-bg text-warning-text",
  },
  approved: {
    label: "Approved",
    accent: "bg-success-text",
    pill: "bg-success-bg text-success-text",
  },
  declined: {
    label: "Declined",
    accent: "bg-error-text",
    pill: "bg-error-bg text-error-text",
  },
}

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

export default function RescheduleSummaryTile() {
  const request = activeReschedule()
  const originalClass = request
    ? classes.find((c) => c.id === request.originalClassId)
    : undefined

  if (!request || !originalClass) {
    return (
      <Link
        to="/schedule"
        className="flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-sm transition-colors active:bg-surface-dim"
      >
        <div className="h-1.5 bg-gray-200" />
        <div className="flex flex-1 flex-col px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
            <RefreshCw className="h-3.5 w-3.5" />
            Reschedule
          </div>
          <p className="mt-3 text-sm text-gray-500">No active requests</p>
        </div>
      </Link>
    )
  }

  const meta = statusMeta[request.status]

  return (
    <Link
      to={`/schedule/reschedule/${request.id}`}
      className="flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-sm transition-colors active:bg-surface-dim"
    >
      <div className={`h-1.5 ${meta.accent}`} />
      <div className="flex flex-1 flex-col px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
          <RefreshCw className="h-3.5 w-3.5" />
          Reschedule
        </div>
        <p className="mt-2 truncate text-base font-semibold text-gray-900">
          {subjectLabel[originalClass.subject]}
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {new Date(originalClass.startsAt).toLocaleDateString("en-SG", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </p>
        <span
          className={`mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.pill}`}
        >
          {meta.label}
        </span>
      </div>
    </Link>
  )
}
