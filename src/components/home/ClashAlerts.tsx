import { Link } from "react-router-dom"
import { AlertTriangle, ChevronRight } from "lucide-react"
import type { Subject } from "@/data/types"
import { pendingClashes } from "@/data/conflicts"

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

export default function ClashAlerts() {
  const clashes = pendingClashes()
  if (clashes.length === 0) return null

  return (
    <section className="px-5 pb-4">
      <div className="rounded-2xl bg-warning-bg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning-text" />
          <p className="text-sm font-semibold text-warning-text">
            Action needed
          </p>
        </div>
        <p className="mt-1 text-xs text-warning-text/80">
          You have {clashes.length === 1 ? "a class" : "classes"} clashing with
          a pending reschedule. Reschedule{" "}
          {clashes.length === 1 ? "it" : "them"} so Aiden doesn't miss the
          lesson.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {clashes.map(({ clashClass }) => (
            <Link
              key={clashClass.id}
              to={`/schedule/lesson/${clashClass.id}/reschedule`}
              className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 shadow-sm active:bg-surface-dim"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  Reschedule {subjectLabel[clashClass.subject]}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {formatShortDateTime(clashClass.startsAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
