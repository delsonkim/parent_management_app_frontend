import { Link } from "react-router-dom"
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
} from "lucide-react"
import type { Invoice } from "@/data/types"
import { centreById } from "@/data/centres"
import { daysOverdue } from "@/data/invoices"

function dueLabel(iso: string): string {
  const due = new Date(iso)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Due tomorrow"
  if (diffDays > 1) return `Due in ${diffDays} days`
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatAmount(value: number): string {
  return `$${value.toFixed(2)}`
}

interface Props {
  invoice: Invoice
}

export default function InvoiceCard({ invoice }: Props) {
  const centre = centreById(invoice.centreId)
  const overdue = invoice.status === "overdue"
  const pending = invoice.status === "pending"
  const paid = invoice.status === "paid"
  const overdueDays = overdue ? daysOverdue(invoice) : 0
  const lineSummary = invoice.lineItems[0]?.description ?? "Invoice"

  const accentColor = overdue
    ? "bg-error-text"
    : pending
    ? "bg-warning-text"
    : paid
    ? "bg-gray-300"
    : "bg-primary-500"

  const dateIcon = paid ? (
    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
  ) : pending ? (
    <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
  ) : (
    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
  )

  const dateLabel = paid
    ? `Paid ${shortDate(invoice.paidOn ?? invoice.dueOn)}`
    : pending
    ? "Awaiting confirmation"
    : dueLabel(invoice.dueOn)

  return (
    <Link
      to={`/payments/${invoice.id}`}
      className="flex overflow-hidden rounded-xl bg-surface shadow-sm transition-colors active:bg-surface-dim"
    >
      <div className={`w-1.5 shrink-0 ${accentColor}`} />
      <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              paid ? "text-gray-700" : "text-gray-900"
            }`}
          >
            {centre?.name ?? "Unknown centre"}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {invoice.invoiceNumber}
          </p>
          <p className="mt-1 truncate text-sm text-gray-600">{lineSummary}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600">
            {dateIcon}
            <span>{dateLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`text-base font-semibold ${
              paid ? "text-gray-600" : "text-gray-900"
            }`}
          >
            {formatAmount(invoice.amount)}
          </span>
          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-error-bg px-2.5 py-1 text-xs font-medium text-error-text">
              <AlertCircle className="h-3 w-3" />
              {overdueDays}d overdue
            </span>
          )}
          {pending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-medium text-warning-text">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          )}
          {paid && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success-text">
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
