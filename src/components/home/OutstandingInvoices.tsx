import InvoiceCard from "./InvoiceCard"
import SectionEmptyState from "./SectionEmptyState"
import { outstandingInvoices } from "@/data/invoices"

export default function OutstandingInvoices() {
  const items = outstandingInvoices()

  return (
    <section className="px-5 pb-4">
      <h2 className="mb-3 text-base font-semibold text-gray-900">
        Bills to pay
      </h2>
      {items.length === 0 ? (
        <SectionEmptyState message="You're all paid up" />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      )}
    </section>
  )
}
