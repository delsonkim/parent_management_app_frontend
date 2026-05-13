import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ChevronLeft } from "lucide-react"
import type { RescheduleReason, RescheduleStatus, Subject } from "@/data/types"
import { cancelReschedule, rescheduleById } from "@/data/reschedules"
import { classes } from "@/data/classes"
import { centreById } from "@/data/centres"

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

const reasonLabel: Record<RescheduleReason, string> = {
  sick: "Sick",
  "school-event": "School event",
  family: "Family commitment",
  travel: "Travel",
  other: "Other",
}

const statusStyles: Record<
  RescheduleStatus,
  { pill: string; label: string; help: string }
> = {
  pending: {
    pill: "bg-warning-bg text-warning-text border border-warning-border",
    label: "Pending",
    help: "The centre will review your request and respond shortly.",
  },
  approved: {
    pill: "bg-success-bg text-success-text border border-success-border",
    label: "Approved",
    help: "Confirmed. Your child will attend the replacement slot below.",
  },
  declined: {
    pill: "bg-error-bg text-error-text border border-error-border",
    label: "Declined",
    help: "The centre declined this request — pick another slot to try again.",
  },
}

function formatDateLong(iso: string): string {
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

function formatRelativeExpiry(iso: string): string {
  const now = Date.now()
  const target = new Date(iso).getTime()
  const diffMs = target - now
  if (diffMs <= 0) return "expired"
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  if (hours >= 1) return `expires in ${hours}h`
  const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)))
  return `expires in ${mins}m`
}

export default function RescheduleDetailPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const request = requestId ? rescheduleById(requestId) : undefined
  const original = request
    ? classes.find((c) => c.id === request.originalClassId)
    : undefined

  if (!request || !original) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500">Request not found</p>
        <Link to="/" className="mt-3 text-sm text-primary-700">
          Back to home
        </Link>
      </div>
    )
  }

  const style = statusStyles[request.status]
  const centre = centreById(original.centreId)

  const handleCancel = () => {
    cancelReschedule(request.id)
    navigate("/", { replace: true })
  }

  const handlePickAnotherSlot = () => {
    navigate(`/schedule/lesson/${original.id}/reschedule`)
  }

  return (
    <div className="flex h-full flex-col pb-6">
      <div className={`${subjectTint[original.subject]} px-5 pt-4 pb-5`}>
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 text-sm text-gray-700 active:bg-white/40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mt-3 flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-gray-900">
            Reschedule request
          </h1>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.pill}`}
          >
            {style.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-700">{style.help}</p>
        {request.status === "pending" && (
          <p className="mt-1 text-xs text-gray-600">
            Submitted {new Date(request.submittedAt).toLocaleDateString("en-SG", { day: "numeric", month: "short" })} · {formatRelativeExpiry(request.expiresAt)}
          </p>
        )}
      </div>

      <div className="px-5 pt-4">
        <div className="rounded-xl bg-surface px-4 py-4 shadow-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Original lesson
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {subjectLabel[original.subject]}
            </p>
            <p className="text-sm text-gray-600">
              {formatDateLong(original.startsAt)} ·{" "}
              {formatTimeRange(original.startsAt, original.endsAt)}
            </p>
            <p className="text-xs text-gray-500">
              {centre?.name ?? "Unknown centre"}
            </p>
          </div>
          {request.replacement && (
            <>
              <div className="my-3 h-px bg-gray-100" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary-700">
                  Replacement slot
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {subjectLabel[original.subject]}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateLong(request.replacement.startsAt)} ·{" "}
                  {formatTimeRange(
                    request.replacement.startsAt,
                    request.replacement.endsAt,
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {centre?.name ?? "Unknown centre"}
                </p>
              </div>
            </>
          )}
          <div className="my-3 h-px bg-gray-100" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Reason
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {reasonLabel[request.reason]}
            </p>
            {request.note && (
              <p className="mt-2 rounded-md bg-surface-dim px-3 py-2 text-sm text-gray-700">
                {request.note}
              </p>
            )}
          </div>
          {request.status === "declined" && request.declineReason && (
            <>
              <div className="my-3 h-px bg-gray-100" />
              <div className="flex items-start gap-2 rounded-md bg-error-bg px-3 py-2 text-xs text-error-text">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-semibold">Centre's note: </span>
                  {request.declineReason}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-auto px-5 pt-6">
        {request.status === "pending" && (
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="w-full rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-error-text shadow-sm active:bg-surface-dim"
          >
            Cancel this request
          </button>
        )}
        {request.status === "declined" && (
          <button
            type="button"
            onClick={handlePickAnotherSlot}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm active:bg-primary-700"
          >
            Pick another slot
          </button>
        )}
      </div>

      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-2xl bg-surface p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Cancel this request?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              The original {subjectLabel[original.subject]} lesson on{" "}
              {formatDateLong(original.startsAt)} stays on Aiden's schedule.
              You can submit a new request later if you still need to.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-xl bg-error-text px-4 py-3 text-sm font-semibold text-white active:opacity-90"
              >
                Cancel request
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full rounded-xl bg-surface-dim px-4 py-3 text-sm font-medium text-gray-700 active:bg-gray-200"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
