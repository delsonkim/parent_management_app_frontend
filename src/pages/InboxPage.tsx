import { centres } from "@/data/centres"

interface Thread {
  id: string
  centreId: string
  preview: string
  timeLabel: string
  unread: boolean
}

const threads: Thread[] = [
  {
    id: "msg_1",
    centreId: "ctr_mvp",
    preview:
      "Reminder: term break next week — Aiden's Wed class moves to Thu 9am.",
    timeLabel: "2h ago",
    unread: true,
  },
  {
    id: "msg_2",
    centreId: "ctr_bm",
    preview:
      "Mock paper marked. Aiden scored 38/50 — feedback notes attached.",
    timeLabel: "Yesterday",
    unread: true,
  },
  {
    id: "msg_3",
    centreId: "ctr_lh",
    preview:
      "Thanks for confirming the reschedule for 14 May. See you then!",
    timeLabel: "3 days ago",
    unread: false,
  },
  {
    id: "msg_4",
    centreId: "ctr_mvp",
    preview: "Term 2 fees invoice issued — please review on the Payments tab.",
    timeLabel: "1 week ago",
    unread: false,
  },
]

function centreNameById(id: string): string {
  return centres.find((c) => c.id === id)?.name ?? "Centre"
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function InboxPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="bg-surface px-5 pt-5 pb-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
        <p className="mt-1 text-sm text-gray-500">
          Messages from your child's centres
        </p>
      </header>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="mx-5 mt-6 rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-10 text-center text-sm text-gray-500">
            No messages yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {threads.map((t) => {
              const centreName = centreNameById(t.centreId)
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 bg-surface px-5 py-4 text-left active:bg-surface-dim"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                      {initialsFromName(centreName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            t.unread
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {centreName}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {t.timeLabel}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 line-clamp-2 text-sm ${
                          t.unread ? "text-gray-700" : "text-gray-500"
                        }`}
                      >
                        {t.preview}
                      </p>
                    </div>
                    {t.unread && (
                      <span
                        aria-label="Unread"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600"
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
