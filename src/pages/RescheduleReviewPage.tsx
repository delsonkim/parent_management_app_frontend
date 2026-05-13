import { useEffect } from "react"
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"
import { AlertTriangle, ChevronLeft } from "lucide-react"
import type { RescheduleReason, Subject } from "@/data/types"
import { classes } from "@/data/classes"
import { centreById } from "@/data/centres"
import { child } from "@/data/parent"
import { replacementSlotById } from "@/data/replacementSlots"
import { findClashForSlot } from "@/data/conflicts"
import { createReschedule } from "@/data/reschedules"

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

function formatShortDateTime(iso: string): string {
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

interface LocationState {
  slotId?: string
  reason?: RescheduleReason
  note?: string
}

export default function RescheduleReviewPage() {
  const { classId } = useParams<{ classId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState | null) ?? {}

  const original = classes.find((c) => c.id === classId)
  const slot = state.slotId ? replacementSlotById(state.slotId) : undefined
  const reason = state.reason
  const note = state.note

  useEffect(() => {
    if ((!slot || !reason) && classId) {
      navigate(`/schedule/lesson/${classId}/reschedule`, { replace: true })
    }
  }, [slot, reason, classId, navigate])

  if (!original || !slot || !reason) {
    return (
      <Navigate
        to={classId ? `/schedule/lesson/${classId}` : "/schedule"}
        replace
      />
    )
  }

  const centre = centreById(original.centreId)
  const clash = findClashForSlot(child.id, slot, original.id)

  const handleSubmit = () => {
    const request = createReschedule({
      originalClassId: original.id,
      replacement: {
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      },
      reason,
      note,
    })
    navigate(`/schedule/lesson/${classId}/reschedule/confirmed`, {
      replace: true,
      state: {
        requestId: request.id,
        clashClassId: clash?.id,
      },
    })
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
        <h1 className="mt-3 text-xl font-semibold text-gray-900">
          Review your request
        </h1>
        <p className="mt-1 text-sm text-gray-700">
          The centre will approve or decline this.
        </p>
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
          <div className="my-3 h-px bg-gray-100" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-700">
              New replacement
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {subjectLabel[slot.subject]}
            </p>
            <p className="text-sm text-gray-600">
              {formatDateLong(slot.startsAt)} ·{" "}
              {formatTimeRange(slot.startsAt, slot.endsAt)}
            </p>
            <p className="text-xs text-gray-500">
              {centre?.name ?? "Unknown centre"}
            </p>
          </div>
          <div className="my-3 h-px bg-gray-100" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Reason
            </p>
            <p className="mt-1 text-sm text-gray-900">{reasonLabel[reason]}</p>
            {note && (
              <p className="mt-2 rounded-md bg-surface-dim px-3 py-2 text-sm text-gray-700">
                {note}
              </p>
            )}
          </div>
        </div>

        {clash && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-warning-bg px-3 py-3 text-xs text-warning-text">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold">Heads up — </span>this clashes
              with {subjectLabel[clash.subject]} on{" "}
              {formatShortDateTime(clash.startsAt)}. The{" "}
              {subjectLabel[clash.subject]} lesson stays scheduled — you'll be
              offered to reschedule it next.
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto px-5 pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm active:bg-primary-700"
        >
          Submit request
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-2 w-full text-center text-xs text-gray-500"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
