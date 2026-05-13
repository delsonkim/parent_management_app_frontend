import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import type { Subject } from "@/data/types"
import {
  attendanceStats,
  pastLessonsForChild,
  perClassAttendance,
} from "@/data/classes"
import { centreById } from "@/data/centres"
import { parent, child } from "@/data/parent"

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

const subjectAccent: Record<Subject, string> = {
  math: "bg-subject-math-text",
  chinese: "bg-subject-chinese-text",
  english: "bg-subject-english-text",
  science: "bg-subject-science-text",
}

function initials(first: string, last?: string): string {
  return (first[0] + (last?.[0] ?? "")).toUpperCase()
}

function rateTone(rate: number): string {
  if (rate >= 0.9) return "text-success-text"
  if (rate >= 0.75) return "text-gray-900"
  return "text-warning-text"
}

export default function ProfilePage() {
  const allPast = pastLessonsForChild(child.id)
  const overallStats = attendanceStats(allPast)
  const overallPct = Math.round(overallStats.rate * 100)
  const perClass = perClassAttendance(child.id)

  return (
    <div className="flex h-full flex-col">
      <header className="bg-surface px-5 pt-6 pb-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-base font-semibold text-primary-700">
            {initials(parent.firstName, parent.lastName)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-gray-900">
              {parent.firstName} {parent.lastName}
            </h1>
            <p className="truncate text-sm text-gray-500">{parent.email}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        <section className="px-5 pt-5">
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            Children
          </h2>
          <div className="rounded-xl bg-surface px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                {initials(child.firstName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {child.firstName}
                </p>
                <p className="text-xs text-gray-500">{child.level}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            Attendance
          </h2>
          <div className="rounded-xl bg-surface px-4 py-4 shadow-sm">
            {overallStats.total === 0 ? (
              <p className="text-sm text-gray-500">
                No past lessons recorded yet.
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-gray-600">
                    Across all centres · last 8 weeks
                  </p>
                  <p
                    className={`text-2xl font-semibold ${rateTone(
                      overallStats.rate,
                    )}`}
                  >
                    {overallPct}%
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {overallStats.attended} attended ·{" "}
                  {overallStats.rescheduledOut} rescheduled ·{" "}
                  {overallStats.absent} absent
                </p>
                <div className="my-4 h-2 overflow-hidden rounded-full bg-surface-dim">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {perClass.length > 0 && (
          <section className="px-5 pt-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              By class
            </h3>
            <div className="flex flex-col gap-2">
              {perClass.map((summary) => {
                const centre = centreById(summary.centreId)
                const pct = Math.round(summary.stats.rate * 100)
                return (
                  <Link
                    key={`${summary.centreId}|${summary.classCode}`}
                    to={`/schedule/class/${summary.centreId}/${summary.classCode}`}
                    className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 shadow-sm transition-colors active:bg-surface-dim"
                  >
                    <div
                      className={`h-9 w-1.5 shrink-0 rounded-full ${subjectAccent[summary.subject]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {subjectLabel[summary.subject]}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {centre?.name ?? "Unknown centre"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-semibold ${rateTone(
                          summary.stats.rate,
                        )}`}
                      >
                        {pct}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {summary.stats.attended}/{summary.stats.total}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="px-5 pt-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            Settings
          </h2>
          <div className="overflow-hidden rounded-xl bg-surface shadow-sm">
            {[
              "Notification preferences",
              "Billing preferences",
              "Help & support",
              "Sign out",
            ].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-700 active:bg-surface-dim ${
                  idx < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span>{label}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
