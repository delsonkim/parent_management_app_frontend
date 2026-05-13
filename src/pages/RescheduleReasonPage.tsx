import { useEffect, useState } from "react"
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"
import { Check, ChevronLeft } from "lucide-react"
import type { RescheduleReason, Subject } from "@/data/types"
import { classes } from "@/data/classes"
import { replacementSlotById } from "@/data/replacementSlots"

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

const REASONS: { value: RescheduleReason; label: string }[] = [
  { value: "sick", label: "Sick" },
  { value: "school-event", label: "School event" },
  { value: "family", label: "Family commitment" },
  { value: "travel", label: "Travel" },
  { value: "other", label: "Other" },
]

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
}

export default function RescheduleReasonPage() {
  const { classId } = useParams<{ classId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState | null) ?? {}

  const [reason, setReason] = useState<RescheduleReason | null>(null)
  const [note, setNote] = useState("")

  const original = classes.find((c) => c.id === classId)
  const slot = state.slotId ? replacementSlotById(state.slotId) : undefined

  useEffect(() => {
    if (!state.slotId && classId) {
      navigate(`/schedule/lesson/${classId}/reschedule`, { replace: true })
    }
  }, [state.slotId, classId, navigate])

  if (!original || !slot) {
    return (
      <Navigate
        to={classId ? `/schedule/lesson/${classId}` : "/schedule"}
        replace
      />
    )
  }

  const handleContinue = () => {
    if (!reason) return
    navigate(`/schedule/lesson/${classId}/reschedule/review`, {
      state: { slotId: slot.id, reason, note: note.trim() || undefined },
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
          Why are you rescheduling?
        </h1>
        <p className="mt-1 text-sm text-gray-700">
          {subjectLabel[original.subject]} ·{" "}
          {formatShortDateTime(original.startsAt)}
        </p>
      </div>

      <div className="px-5 pt-4">
        <h2 className="text-sm font-medium text-primary-800">Reason</h2>
        <div className="mt-2 flex flex-col gap-2">
          {REASONS.map((r) => {
            const selected = reason === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={`flex w-full items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-left shadow-sm transition-colors ${
                  selected
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-transparent active:bg-surface-dim"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {r.label}
                </span>
              </button>
            )
          })}
        </div>

        <h2 className="mt-5 text-sm font-medium text-primary-800">
          Add a note <span className="font-normal text-gray-400">(optional)</span>
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Anything the centre should know"
          className="mt-2 w-full rounded-xl border border-gray-200 bg-surface px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-1 text-right text-[11px] text-gray-400">
          {note.length}/300
        </p>
      </div>

      <div className="mt-auto px-5 pt-6">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!reason}
          className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity active:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continue
        </button>
        <Link
          to={`/schedule/lesson/${classId}/reschedule`}
          className="mt-2 block text-center text-xs text-gray-500"
        >
          Change replacement slot
        </Link>
      </div>
    </div>
  )
}
