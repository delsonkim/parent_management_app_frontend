import { Link } from "react-router-dom"
import { AlertCircle, Receipt } from "lucide-react"
import { outstandingInvoices } from "@/data/invoices"

export default function BillsSummaryTile() {
  const items = outstandingInvoices()
  const total = items.reduce((sum, inv) => sum + inv.amount, 0)
  const overdueCount = items.filter((i) => i.status === "overdue").length
  const hasOverdue = overdueCount > 0
  const accent = hasOverdue ? "bg-error-text" : "bg-primary-500"

  return (
    <Link
      to="/payments"
      className="flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-sm transition-colors active:bg-surface-dim"
    >
      <div className={`h-1.5 ${accent}`} />
      <div className="flex flex-1 flex-col px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
          <Receipt className="h-3.5 w-3.5" />
          Bills to pay
        </div>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">You're all paid up</p>
        ) : (
          <>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              ${total.toFixed(0)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {items.length} {items.length === 1 ? "bill" : "bills"}
            </p>
            {hasOverdue && (
              <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-error-bg px-2 py-0.5 text-xs font-medium text-error-text">
                <AlertCircle className="h-3 w-3" />
                {overdueCount} overdue
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  )
}
