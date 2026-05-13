import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle2, Info } from "lucide-react"
import type { Subject } from "@/data/types"
import { classes } from "@/data/classes"
import { centreById } from "@/data/centres"

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
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
  requestId?: string
  clashClassId?: string
}

export default function RescheduleConfirmedPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState | null) ?? {}

  const clashClass = state.clashClassId
    ? classes.find((c) => c.id === state.clashClassId)
    : undefined
  const clashCentre = clashClass ? centreById(clashClass.centreId) : undefined

  return (
    <div className="flex h-full flex-col pb-6">
      <div className="px-5 pt-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <CheckCircle2 className="h-7 w-7 text-success-text" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Request sent
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          The centre will review and respond — you'll see the status on Home.
        </p>
      </div>

      {clashClass && (
        <div className="mt-6 px-5">
          <div className="rounded-2xl bg-warning-bg p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning-text" />
              <p className="text-sm text-warning-text">
                <span className="font-semibold">
                  {subjectLabel[clashClass.subject]} is still scheduled
                </span>{" "}
                on {formatShortDateTime(clashClass.startsAt)} at{" "}
                {clashCentre?.name ?? "the centre"} — and clashes with your new
                slot. Reschedule it too so Aiden doesn't miss the lesson.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(`/schedule/lesson/${clashClass.id}/reschedule`)
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-warning-text px-4 py-3 text-sm font-semibold text-white shadow-sm active:opacity-90"
            >
              Reschedule {subjectLabel[clashClass.subject]}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto px-5 pt-8">
        <Link
          to="/"
          className="block w-full rounded-xl bg-surface px-4 py-3 text-center text-sm font-medium text-gray-700 shadow-sm active:bg-surface-dim"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
