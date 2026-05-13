export type Subject = "math" | "chinese" | "english" | "science"

export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Child {
  id: string
  parentId: string
  firstName: string
  level: string
}

export interface Centre {
  id: string
  name: string
}

export interface Tutor {
  id: string
  name: string
  centreId: string
}

export type ClassStatus =
  | "scheduled"
  | "present"
  | "absent"
  | "rescheduled-out"
  | "rescheduled-in"
  | "cancelled"

export interface Class {
  id: string
  childId: string
  centreId: string
  tutorId: string
  subject: Subject
  classCode: string
  level: string
  startsAt: string
  endsAt: string
  status: ClassStatus
  attendanceNote?: string
}

export type InvoiceStatus = "outstanding" | "overdue" | "pending" | "paid"

export interface InvoiceLineItem {
  description: string
  amount: number
  quantity?: number
  unitPrice?: number
  unitLabel?: string
}

export type PaymentActivityKind =
  | "issued"
  | "paynow-generated"
  | "paid"
  | "reminder-sent"

export interface PaymentActivityEvent {
  kind: PaymentActivityKind
  at: string
  amount?: number
  by?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  childId: string
  centreId: string
  classCode: string
  issuedOn: string
  dueOn: string
  paidOn?: string
  billingPeriodStart: string
  billingPeriodEnd: string
  amount: number
  status: InvoiceStatus
  lineItems: InvoiceLineItem[]
  paymentActivity: PaymentActivityEvent[]
}

export type RescheduleStatus = "pending" | "approved" | "declined"

export type RescheduleReason =
  | "sick"
  | "school-event"
  | "family"
  | "travel"
  | "other"

export interface ReplacementSlot {
  startsAt: string
  endsAt: string
}

export interface RescheduleRequest {
  id: string
  originalClassId: string
  replacement: ReplacementSlot | null
  reason: RescheduleReason
  note?: string
  submittedAt: string
  expiresAt: string
  status: RescheduleStatus
  declineReason?: string
}
