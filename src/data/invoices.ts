import type {
  Class,
  Invoice,
  InvoiceLineItem,
  PaymentActivityEvent,
} from "./types"
import { child } from "./parent"
import { classes } from "./classes"

function monthBoundary(monthsAgo: number, day: number, hour = 0): string {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  d.setDate(day)
  return d.toISOString()
}

function lastDayOfMonth(monthsAgo: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo + 1)
  d.setDate(0)
  return d.toISOString()
}

function lineItem(
  description: string,
  quantity: number,
  unitPrice: number,
  unitLabel = "per lesson",
): InvoiceLineItem {
  return {
    description,
    quantity,
    unitPrice,
    unitLabel,
    amount: +(quantity * unitPrice).toFixed(2),
  }
}

function invoiceNumber(year: number, seq: number): string {
  return `INV-${year}-${seq.toString().padStart(3, "0")}`
}

function currentYear(monthsAgo: number): number {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return d.getFullYear()
}

// Builds payment activity entries with realistic spacing relative to the invoice.
function activityFor(
  status: Invoice["status"],
  issuedAt: string,
  amount: number,
  paidAt?: string,
): PaymentActivityEvent[] {
  const events: PaymentActivityEvent[] = [
    { kind: "issued", at: issuedAt, amount, by: "centre" },
  ]
  if (status === "overdue") {
    const t = new Date(issuedAt)
    t.setDate(t.getDate() + 14)
    events.push({ kind: "reminder-sent", at: t.toISOString(), by: "centre" })
  }
  if (status === "pending" || status === "paid") {
    const t = paidAt ? new Date(paidAt) : new Date(issuedAt)
    if (!paidAt) t.setDate(t.getDate() + 3)
    t.setHours(22, 30, 0, 0)
    events.push({
      kind: "paynow-generated",
      at: t.toISOString(),
      amount,
      by: "parent",
    })
  }
  if (status === "paid" && paidAt) {
    const t = new Date(paidAt)
    t.setMinutes(t.getMinutes() + 5)
    events.push({ kind: "paid", at: t.toISOString(), amount, by: "centre" })
  }
  return events
}

// --- Seed data: 6 months of invoices across 3 centres ---

const seed: Invoice[] = [
  // ---- Current month (May 2026) ----
  {
    id: "inv_001",
    invoiceNumber: invoiceNumber(currentYear(0), 11),
    childId: child.id,
    centreId: "ctr_bm",
    classCode: "P5-ENG-2",
    issuedOn: monthBoundary(0, 1),
    dueOn: monthBoundary(0, 13),
    billingPeriodStart: monthBoundary(0, 1),
    billingPeriodEnd: lastDayOfMonth(0),
    amount: 280,
    status: "overdue",
    lineItems: [lineItem("English Course Fee (P5)", 4, 70)],
    paymentActivity: [],
  },
  {
    id: "inv_002",
    invoiceNumber: invoiceNumber(currentYear(0), 10),
    childId: child.id,
    centreId: "ctr_mvp",
    classCode: "P5-MATH-A",
    issuedOn: monthBoundary(0, 1),
    dueOn: monthBoundary(0, 20),
    billingPeriodStart: monthBoundary(0, 1),
    billingPeriodEnd: lastDayOfMonth(0),
    amount: 320,
    status: "outstanding",
    lineItems: [lineItem("Mathematics Course Fee (P5)", 4, 80)],
    paymentActivity: [],
  },
  {
    id: "inv_003",
    invoiceNumber: invoiceNumber(currentYear(0), 9),
    childId: child.id,
    centreId: "ctr_lh",
    classCode: "P5-CHI-B",
    issuedOn: monthBoundary(0, 1),
    dueOn: monthBoundary(0, 23),
    billingPeriodStart: monthBoundary(0, 1),
    billingPeriodEnd: lastDayOfMonth(0),
    amount: 240,
    status: "pending",
    lineItems: [lineItem("Chinese Course Fee (P5)", 4, 60)],
    paymentActivity: [],
  },

  // ---- 1 month ago (April) ----
  {
    id: "inv_004",
    invoiceNumber: invoiceNumber(currentYear(1), 8),
    childId: child.id,
    centreId: "ctr_mvp",
    classCode: "P5-MATH-A",
    issuedOn: monthBoundary(1, 1),
    dueOn: monthBoundary(1, 15),
    paidOn: monthBoundary(1, 11, 22),
    billingPeriodStart: monthBoundary(1, 1),
    billingPeriodEnd: lastDayOfMonth(1),
    amount: 320,
    status: "paid",
    lineItems: [lineItem("Mathematics Course Fee (P5)", 4, 80)],
    paymentActivity: [],
  },
  {
    id: "inv_005",
    invoiceNumber: invoiceNumber(currentYear(1), 7),
    childId: child.id,
    centreId: "ctr_bm",
    classCode: "P5-ENG-2",
    issuedOn: monthBoundary(1, 1),
    dueOn: monthBoundary(1, 15),
    paidOn: monthBoundary(1, 9, 14),
    billingPeriodStart: monthBoundary(1, 1),
    billingPeriodEnd: lastDayOfMonth(1),
    amount: 280,
    status: "paid",
    lineItems: [lineItem("English Course Fee (P5)", 4, 70)],
    paymentActivity: [],
  },
  {
    id: "inv_006",
    invoiceNumber: invoiceNumber(currentYear(1), 6),
    childId: child.id,
    centreId: "ctr_lh",
    classCode: "P5-CHI-B",
    issuedOn: monthBoundary(1, 1),
    dueOn: monthBoundary(1, 15),
    paidOn: monthBoundary(1, 13, 19),
    billingPeriodStart: monthBoundary(1, 1),
    billingPeriodEnd: lastDayOfMonth(1),
    amount: 240,
    status: "paid",
    lineItems: [lineItem("Chinese Course Fee (P5)", 4, 60)],
    paymentActivity: [],
  },

  // ---- 2 months ago (March) ----
  {
    id: "inv_007",
    invoiceNumber: invoiceNumber(currentYear(2), 5),
    childId: child.id,
    centreId: "ctr_mvp",
    classCode: "P5-MATH-A",
    issuedOn: monthBoundary(2, 1),
    dueOn: monthBoundary(2, 15),
    paidOn: monthBoundary(2, 12, 10),
    billingPeriodStart: monthBoundary(2, 1),
    billingPeriodEnd: lastDayOfMonth(2),
    amount: 320,
    status: "paid",
    lineItems: [lineItem("Mathematics Course Fee (P5)", 4, 80)],
    paymentActivity: [],
  },
  {
    id: "inv_008",
    invoiceNumber: invoiceNumber(currentYear(2), 4),
    childId: child.id,
    centreId: "ctr_bm",
    classCode: "P5-ENG-2",
    issuedOn: monthBoundary(2, 1),
    dueOn: monthBoundary(2, 15),
    paidOn: monthBoundary(2, 14, 16),
    billingPeriodStart: monthBoundary(2, 1),
    billingPeriodEnd: lastDayOfMonth(2),
    amount: 280,
    status: "paid",
    lineItems: [lineItem("English Course Fee (P5)", 4, 70)],
    paymentActivity: [],
  },

  // ---- 3 months ago (Feb) ----
  {
    id: "inv_009",
    invoiceNumber: invoiceNumber(currentYear(3), 3),
    childId: child.id,
    centreId: "ctr_mvp",
    classCode: "P5-MATH-A",
    issuedOn: monthBoundary(3, 1),
    dueOn: monthBoundary(3, 15),
    paidOn: monthBoundary(3, 13, 21),
    billingPeriodStart: monthBoundary(3, 1),
    billingPeriodEnd: lastDayOfMonth(3),
    amount: 320,
    status: "paid",
    lineItems: [lineItem("Mathematics Course Fee (P5)", 4, 80)],
    paymentActivity: [],
  },

  // ---- 4 months ago (Jan) ----
  {
    id: "inv_010",
    invoiceNumber: invoiceNumber(currentYear(4), 2),
    childId: child.id,
    centreId: "ctr_lh",
    classCode: "P5-CHI-B",
    issuedOn: monthBoundary(4, 1),
    dueOn: monthBoundary(4, 15),
    paidOn: monthBoundary(4, 14, 18),
    billingPeriodStart: monthBoundary(4, 1),
    billingPeriodEnd: lastDayOfMonth(4),
    amount: 240,
    status: "paid",
    lineItems: [lineItem("Chinese Course Fee (P5)", 4, 60)],
    paymentActivity: [],
  },

  // ---- 5 months ago (Dec) ----
  {
    id: "inv_011",
    invoiceNumber: invoiceNumber(currentYear(5), 1),
    childId: child.id,
    centreId: "ctr_mvp",
    classCode: "P5-MATH-A",
    issuedOn: monthBoundary(5, 1),
    dueOn: monthBoundary(5, 15),
    paidOn: monthBoundary(5, 11, 9),
    billingPeriodStart: monthBoundary(5, 1),
    billingPeriodEnd: lastDayOfMonth(5),
    amount: 320,
    status: "paid",
    lineItems: [lineItem("Mathematics Course Fee (P5)", 4, 80)],
    paymentActivity: [],
  },
]

// Fill in payment activity for each seeded invoice.
for (const inv of seed) {
  inv.paymentActivity = activityFor(
    inv.status,
    inv.issuedOn,
    inv.amount,
    inv.paidOn,
  )
}

export const invoices: Invoice[] = seed

function daysOverdueRank(inv: Invoice): number {
  const today = Date.now()
  const due = new Date(inv.dueOn).getTime()
  return Math.floor((today - due) / (1000 * 60 * 60 * 24))
}

export function outstandingInvoices(): Invoice[] {
  return invoices
    .filter((i) => i.status === "outstanding" || i.status === "overdue")
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1
      if (b.status === "overdue" && a.status !== "overdue") return 1
      return new Date(a.dueOn).getTime() - new Date(b.dueOn).getTime()
    })
}

export function pendingInvoices(): Invoice[] {
  return invoices
    .filter((i) => i.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime(),
    )
}

export function paidInvoices(): Invoice[] {
  return invoices
    .filter((i) => i.status === "paid")
    .sort((a, b) => {
      const at = a.paidOn ? new Date(a.paidOn).getTime() : 0
      const bt = b.paidOn ? new Date(b.paidOn).getTime() : 0
      return bt - at
    })
}

export function daysOverdue(inv: Invoice): number {
  return Math.max(0, daysOverdueRank(inv))
}

export function invoiceById(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id)
}

// Past lessons that fall within the invoice's billing period for the same
// class + centre + child. End boundary is inclusive of the final day.
export function lessonsForInvoice(invoice: Invoice): Class[] {
  const start = new Date(invoice.billingPeriodStart).getTime()
  const end =
    new Date(invoice.billingPeriodEnd).getTime() + 24 * 60 * 60 * 1000 - 1
  return classes
    .filter(
      (c) =>
        c.childId === invoice.childId &&
        c.centreId === invoice.centreId &&
        c.classCode === invoice.classCode,
    )
    .filter((c) => {
      const t = new Date(c.startsAt).getTime()
      return t >= start && t <= end
    })
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
}
