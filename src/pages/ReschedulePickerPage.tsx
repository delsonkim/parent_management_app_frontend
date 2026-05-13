import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, Check, ChevronLeft, Info } from "lucide-react"
import type { Class, Subject } from "@/data/types"
import { classes } from "@/data/classes"
import { centreById } from "@/data/centres"
import { tutorById } from "@/data/tutors"
import { child } from "@/data/parent"
import {
  replacementSlotsFor,
  type ReplacementSlot,
} from "@/data/replacementSlots"
import { findClashForSlot } from "@/data/conflicts"

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

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function todayAtMidnight(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateLong(d: Date): string {
  const today = todayAtMidnight()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (sameDay(d, today)) return "Today"
  if (sameDay(d, tomorrow)) return "Tomorrow"
  return d.toLocaleDateString("en-SG", {
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

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

interface SlotGroup {
  key: string
  label: string
  items: ReplacementSlot[]
}

// Expects `slots` already sorted chronologically (which `replacementSlotsFor`
// returns) — a single linear pass produces ordered groups.
function groupSlotsByDay(slots: ReplacementSlot[]): SlotGroup[] {
  const groups: SlotGroup[] = []
  for (const slot of slots) {
    const startsAt = new Date(slot.startsAt)
    const key = dayKey(startsAt)
    const last = groups[groups.length - 1]
    if (last && last.key === key) {
      last.items.push(slot)
    } else {
      groups.push({ key, label: formatDateLong(startsAt), items: [slot] })
    }
  }
  return groups
}

function SlotRow({
  slot,
  selected,
  clash,
  onSelect,
}: {
  slot: ReplacementSlot
  selected: boolean
  clash: Class | undefined
  onSelect: () => void
}) {
  const tutor = tutorById(slot.tutorId)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border bg-surface px-4 py-3 text-left shadow-sm transition-colors ${
        selected
          ? "border-primary-600 ring-2 ring-primary-100"
          : "border-transparent active:bg-surface-dim"
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-primary-600 bg-primary-600 text-white"
            : "border-gray-300 bg-white"
        }`}
      >
        {selected && <Check className="h-3 w-3" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {formatTimeRange(slot.startsAt, slot.endsAt)}
        </p>
        {tutor && (
          <p className="mt-0.5 text-xs text-gray-500">{tutor.name}</p>
        )}
        {clash && (
          <p className="mt-2 inline-flex items-start gap-1.5 rounded-md bg-warning-bg px-2 py-1 text-xs text-warning-text">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              Clashes with {subjectLabel[clash.subject]} ·{" "}
              {formatShortDateTime(clash.startsAt)}
            </span>
          </p>
        )}
      </div>
    </button>
  )
}

export default function ReschedulePickerPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const original = classes.find((c) => c.id === classId)

  const allSlots = useMemo(() => {
    if (!original) return [] as ReplacementSlot[]
    return replacementSlotsFor(
      original.centreId,
      original.subject,
      original.startsAt,
    )
  }, [original])

  const groupedSlots = useMemo(() => groupSlotsByDay(allSlots), [allSlots])

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [showClashModal, setShowClashModal] = useState(false)

  const clashBySlotIdAll = useMemo(() => {
    const map = new Map<string, Class | undefined>()
    if (!original) return map
    for (const slot of allSlots) {
      map.set(slot.id, findClashForSlot(child.id, slot, original.id))
    }
    return map
  }, [allSlots, original])

  const selectedSlot = useMemo(
    () => allSlots.find((s) => s.id === selectedSlotId),
    [allSlots, selectedSlotId],
  )
  const selectedSlotClash = selectedSlotId
    ? clashBySlotIdAll.get(selectedSlotId)
    : undefined

  if (!original) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500">Lesson not found</p>
        <Link to="/schedule" className="mt-3 text-sm text-primary-700">
          Back to schedule
        </Link>
      </div>
    )
  }

  const centre = centreById(original.centreId)

  const proceedToReason = () => {
    if (!selectedSlotId) return
    navigate(`/schedule/lesson/${classId}/reschedule/reason`, {
      state: { slotId: selectedSlotId },
    })
  }

  const handleContinue = () => {
    if (!selectedSlotId) return
    if (selectedSlotClash) {
      setShowClashModal(true)
      return
    }
    proceedToReason()
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
          Pick a replacement slot
        </h1>
        <p className="mt-1 text-sm text-gray-700">
          Missing {subjectLabel[original.subject]} on{" "}
          {formatDateLong(new Date(original.startsAt))}
        </p>
      </div>

      <p className="mx-5 mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2 text-xs text-gray-600 shadow-sm">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span>
          Showing {subjectLabel[original.subject]} slots at{" "}
          {centre?.name ?? "the centre"}. Slots are grouped by day — pick any
          one to continue.
        </span>
      </p>

      <div className="mt-4 flex-1 overflow-y-auto">
        {groupedSlots.length === 0 ? (
          <div className="mx-5 rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-10 text-center text-sm text-gray-500">
            No replacement slots available right now. Please contact the
            centre.
          </div>
        ) : (
          groupedSlots.map((group) => (
            <section key={group.key} className="pb-3">
              <h2 className="sticky top-0 z-10 bg-background px-5 py-2 text-sm font-medium text-primary-800">
                {group.label}
              </h2>
              <div className="mt-1 flex flex-col gap-2 px-5">
                {group.items.map((slot) => (
                  <SlotRow
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlotId === slot.id}
                    clash={clashBySlotIdAll.get(slot.id)}
                    onSelect={() => setSelectedSlotId(slot.id)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="px-5 pt-6">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedSlotId}
          className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity active:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continue
        </button>
      </div>

      {showClashModal && selectedSlotClash && selectedSlot && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setShowClashModal(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-2xl bg-surface p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning-text" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  This time clashes with another class
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">
                    {subjectLabel[selectedSlotClash.subject]}
                  </span>{" "}
                  on {formatShortDateTime(selectedSlotClash.startsAt)}.
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  Submitting won't cancel it — the{" "}
                  {subjectLabel[selectedSlotClash.subject]} lesson stays on
                  your schedule. You'll be offered the option to reschedule it
                  after this request.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowClashModal(false)
                  proceedToReason()
                }}
                className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white active:bg-primary-700"
              >
                Continue with this slot
              </button>
              <button
                type="button"
                onClick={() => setShowClashModal(false)}
                className="w-full rounded-xl bg-surface-dim px-4 py-3 text-sm font-medium text-gray-700 active:bg-gray-200"
              >
                Pick another slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
