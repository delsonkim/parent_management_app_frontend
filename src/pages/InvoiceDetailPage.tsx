import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  Clock,
  Info,
  QrCode,
} from "lucide-react"
import type {
  InvoiceStatus,
  PaymentActivityEvent,
  PaymentActivityKind,
  Subject,
} from "@/data/types"
import {
  invoiceById,
  daysOverdue,
  lessonsForInvoice,
} from "@/data/invoices"
import { attendanceStats } from "@/data/classes"
import { centreById } from "@/data/centres"
import { child } from "@/data/parent"
import { attendanceStatusPill } from "@/components/attendance/attendanceStatus"

const subjectLabel: Record<Subject, string> = {
  math: "Mathematics",
  chinese: "Chinese",
  english: "English",
  science: "Science",
}

const statusStyles: Record<
  InvoiceStatus,
  { pill: string; label: string }
> = {
  outstanding: {
    pill: "bg-primary-50 text-primary-700 border border-primary-100",
    label: "Outstanding",
  },
  overdue: {
    pill: "bg-error-bg text-error-text border border-error-border",
    label: "Overdue",
  },
  pending: {
    pill: "bg-warning-bg text-warning-text border border-warning-border",
    label: "Pending",
  },
  paid: {
    pill: "bg-success-bg text-success-text border border-success-border",
    label: "Paid",
  },
}

const activityLabel: Record<PaymentActivityKind, string> = {
  issued: "Invoice issued",
  "paynow-generated": "Paynow code generated",
  paid: "Status changed to Paid",
  "reminder-sent": "Payment reminder sent",
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatBillingPeriod(startIso: string, endIso: string): string {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const sameYear = s.getFullYear() === e.getFullYear()
  const sLabel = s.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })
  const eLabel = e.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return `${sLabel} – ${eLabel}`
}

function formatActivityTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${d.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`
}

function formatAmount(value: number): string {
  return `$${value.toFixed(2)}`
}

interface AccordionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="overflow-hidden rounded-xl bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left active:bg-surface-dim"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3">{children}</div>
      )}
    </section>
  )
}

function ActivityRow({
  index,
  event,
}: {
  index: number
  event: PaymentActivityEvent
}) {
  const showAmount =
    typeof event.amount === "number" && event.kind !== "paid"
      ? formatAmount(event.amount)
      : event.kind === "paid" && event.by
      ? `by ${event.by}`
      : ""
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">
          {activityLabel[event.kind]}
        </p>
        <p className="text-xs text-gray-500">{formatActivityTime(event.at)}</p>
      </div>
      {showAmount && (
        <p className="shrink-0 self-center text-sm font-medium text-gray-700">
          {showAmount}
        </p>
      )}
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const [showPayNow, setShowPayNow] = useState(false)

  const invoice = invoiceId ? invoiceById(invoiceId) : undefined

  if (!invoice) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500">Invoice not found</p>
        <Link to="/payments" className="mt-3 text-sm text-primary-700">
          Back to payments
        </Link>
      </div>
    )
  }

  const centre = centreById(invoice.centreId)
  const style = statusStyles[invoice.status]
  const overdue = invoice.status === "overdue"
  const pending = invoice.status === "pending"
  const paid = invoice.status === "paid"
  const subtotal = invoice.lineItems.reduce((sum, li) => sum + li.amount, 0)
  const amountPaid = paid ? subtotal : 0
  const outstanding = subtotal - amountPaid
  const activityForDisplay = [...invoice.paymentActivity].reverse()

  const lessons = lessonsForInvoice(invoice)
  const attendance = attendanceStats(lessons)
  const subjectFromLesson = lessons[0]?.subject

  return (
    <div className="flex h-full flex-col pb-6">
      <div className="bg-surface px-5 pt-4 pb-5 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 text-sm text-gray-700 active:bg-surface-dim"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">
              {centre?.name ?? "Unknown centre"}
            </p>
            <p className="mt-0.5 text-2xl font-semibold text-gray-900">
              {formatAmount(invoice.amount)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
            {formatShortDate(invoice.dueOn)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4">
        <div className="rounded-xl bg-surface px-4 py-4 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Invoice ID</p>
            <p className="text-sm font-medium text-gray-900">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Status</p>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.pill}`}
            >
              {style.label}
            </span>
          </div>
          {pending && (
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {centre?.name ?? "The centre"} will review your payment. Once
                approved, the status will change to <strong>paid</strong>.
              </span>
            </div>
          )}
          {overdue && (
            <div className="mt-2 flex items-start gap-2 text-xs text-error-text">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-semibold">
                  {daysOverdue(invoice)} days overdue.
                </span>{" "}
                Please settle as soon as possible.
              </span>
            </div>
          )}
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Billing period</p>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatBillingPeriod(
                  invoice.billingPeriodStart,
                  invoice.billingPeriodEnd,
                )}
              </p>
              <p className="text-xs text-gray-400">Monthly</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <Accordion title="Fee Breakdown" defaultOpen>
            <div className="space-y-3">
              {invoice.lineItems.map((li, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-gray-900">{li.description}</p>
                    {typeof li.quantity === "number" &&
                      typeof li.unitPrice === "number" && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {li.quantity} lessons × {formatAmount(li.unitPrice)}{" "}
                          {li.unitLabel ?? "per lesson"}
                        </p>
                      )}
                  </div>
                  <p className="shrink-0 font-medium text-gray-900">
                    {formatAmount(li.amount)}
                  </p>
                </div>
              ))}
            </div>
            <div className="my-3 h-px bg-gray-100" />
            <div className="space-y-1.5 text-sm">
              <div className="flex items-baseline justify-between">
                <p className="font-medium text-gray-700">Subtotal</p>
                <p className="font-semibold text-gray-900">
                  {formatAmount(subtotal)}
                </p>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="font-medium text-gray-700">Amount Paid</p>
                <p
                  className={`font-medium ${
                    amountPaid > 0 ? "text-success-text" : "text-gray-500"
                  }`}
                >
                  {formatAmount(amountPaid)}
                </p>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="font-medium text-gray-700">Outstanding</p>
                <p
                  className={`font-medium ${
                    outstanding > 0 ? "text-warning-text" : "text-gray-500"
                  }`}
                >
                  {formatAmount(outstanding)}
                </p>
              </div>
            </div>
          </Accordion>

          {lessons.length > 0 && (
            <Accordion title="Lesson Breakdown">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-gray-700">
                    <span className="text-gray-500">Class: </span>
                    <span className="font-medium text-gray-900">
                      {subjectFromLesson
                        ? subjectLabel[subjectFromLesson]
                        : invoice.classCode}
                    </span>
                  </p>
                  <p className="mt-0.5 text-gray-700">
                    <span className="text-gray-500">Student: </span>
                    <span className="font-medium text-gray-900">
                      {child.firstName}
                    </span>
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success-text">
                  {attendance.attended}/{attendance.total} attended
                </span>
              </div>
              <div className="my-3 h-px bg-gray-100" />
              <div className="divide-y divide-gray-100">
                {lessons.map((lesson) => {
                  const pill = attendanceStatusPill[lesson.status]
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(lesson.startsAt).toLocaleDateString(
                            "en-SG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {new Date(lesson.startsAt).toLocaleTimeString(
                            "en-SG",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}{" "}
                          –{" "}
                          {new Date(lesson.endsAt).toLocaleTimeString(
                            "en-SG",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </p>
                      </div>
                      {pill ? (
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${pill.className}`}
                        >
                          {pill.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Scheduled</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Accordion>
          )}

          <Accordion title="Payment Activity">
            <div className="divide-y divide-gray-100">
              {activityForDisplay.map((event, i) => (
                <ActivityRow
                  key={`${event.kind}-${event.at}`}
                  index={activityForDisplay.length - i}
                  event={event}
                />
              ))}
            </div>
          </Accordion>
        </div>
      </div>

      <div className="px-5 pt-4">
        {paid ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
            Paid · {formatShortDate(invoice.paidOn ?? invoice.dueOn)}
          </div>
        ) : pending ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-warning-bg px-4 py-3 text-sm font-medium text-warning-text">
            <Clock className="h-4 w-4" />
            Awaiting centre confirmation
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPayNow(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm active:bg-primary-700"
          >
            <QrCode className="h-4 w-4" />
            Pay with PayNow
          </button>
        )}
      </div>

      {showPayNow && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setShowPayNow(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-2xl bg-surface p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Pay with PayNow
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Scan the QR with your bank app to settle this invoice.
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 rounded-xl bg-surface-dim px-4 py-6">
              <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white shadow-sm">
                <QrCode className="h-28 w-28 text-gray-900" strokeWidth={1.2} />
              </div>
              <p className="text-sm text-gray-700">
                {centre?.name ?? "Centre"} · {invoice.invoiceNumber}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatAmount(invoice.amount)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPayNow(false)}
              className="mt-5 w-full rounded-xl bg-surface-dim px-4 py-3 text-sm font-medium text-gray-700 active:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
