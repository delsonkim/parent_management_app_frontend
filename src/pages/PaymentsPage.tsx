import InvoiceCard from "@/components/home/InvoiceCard"
import type { Invoice } from "@/data/types"
import { centreById } from "@/data/centres"
import {
  outstandingInvoices,
  paidInvoices,
  pendingInvoices,
} from "@/data/invoices"

interface CentreGroup {
  centreId: string
  centreName: string
  invoices: Invoice[]
  total: number
}

function groupByCentre(invoices: Invoice[]): CentreGroup[] {
  const groups: CentreGroup[] = []
  for (const inv of invoices) {
    const existing = groups.find((g) => g.centreId === inv.centreId)
    if (existing) {
      existing.invoices.push(inv)
      existing.total += inv.amount
    } else {
      groups.push({
        centreId: inv.centreId,
        centreName: centreById(inv.centreId)?.name ?? "Unknown centre",
        invoices: [inv],
        total: inv.amount,
      })
    }
  }
  return groups
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SG", {
    month: "long",
    year: "numeric",
  })
}

interface MonthGroup {
  key: string
  label: string
  invoices: Invoice[]
}

function groupByMonth(invoices: Invoice[]): MonthGroup[] {
  const groups: MonthGroup[] = []
  for (const inv of invoices) {
    const key = inv.billingPeriodStart.slice(0, 7) // YYYY-MM
    const existing = groups.find((g) => g.key === key)
    if (existing) {
      existing.invoices.push(inv)
    } else {
      groups.push({
        key,
        label: monthLabel(inv.billingPeriodStart),
        invoices: [inv],
      })
    }
  }
  return groups
}

export default function PaymentsPage() {
  const outstanding = outstandingInvoices()
  const pending = pendingInvoices()
  const history = paidInvoices()
  const outstandingByCentre = groupByCentre(outstanding)
  const historyByMonth = groupByMonth(history)

  const nothing =
    outstanding.length === 0 && pending.length === 0 && history.length === 0

  return (
    <div className="flex h-full flex-col">
      <header className="bg-surface px-5 pt-5 pb-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Invoices across all of Aiden's centres
        </p>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        {nothing ? (
          <div className="mx-5 mt-6 rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-10 text-center text-sm text-gray-500">
            No invoices yet.
          </div>
        ) : (
          <>
            {outstandingByCentre.length > 0 && (
              <section className="px-5 pt-4">
                <h2 className="mb-2 text-base font-semibold text-gray-900">
                  Outstanding
                </h2>
                <div className="flex flex-col gap-4">
                  {outstandingByCentre.map((group) => (
                    <div key={group.centreId}>
                      <div className="mb-2 flex items-baseline justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          {group.centreName}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ${group.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {group.invoices.map((inv) => (
                          <InvoiceCard key={inv.id} invoice={inv} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pending.length > 0 && (
              <section className="px-5 pt-6">
                <h2 className="mb-1 text-base font-semibold text-gray-900">
                  Pending
                </h2>
                <p className="mb-2 text-xs text-gray-500">
                  Waiting for the centre to confirm your payment.
                </p>
                <div className="flex flex-col gap-2">
                  {pending.map((inv) => (
                    <InvoiceCard key={inv.id} invoice={inv} />
                  ))}
                </div>
              </section>
            )}

            {historyByMonth.length > 0 && (
              <section className="px-5 pt-6">
                <h2 className="mb-2 text-base font-semibold text-gray-900">
                  History
                </h2>
                <div className="flex flex-col gap-4">
                  {historyByMonth.map((group) => (
                    <div key={group.key}>
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-2">
                        {group.invoices.map((inv) => (
                          <InvoiceCard key={inv.id} invoice={inv} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
