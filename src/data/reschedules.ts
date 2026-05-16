import type { ReplacementSlot, RescheduleReason, RescheduleRequest } from "./types"
import { classes } from "./classes"

function daysFromNow(days: number, hour = 0, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const originalClass = classes.find((c) => c.id === "cls_004")
const submittedAt = daysFromNow(-1, 9, 15)

export const reschedules: RescheduleRequest[] = originalClass
  ? [
      {
        id: "rs_001",
        originalClassId: originalClass.id,
        replacement: {
          startsAt: daysFromNow(4, 15, 30),
          endsAt: daysFromNow(4, 17, 0),
        },
        reason: "family",
        note: "Aiden has a family event that afternoon.",
        submittedAt,
        expiresAt: new Date(
          new Date(submittedAt).getTime() + 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
      },
    ]
  : []

export function activeReschedule(): RescheduleRequest | undefined {
  return reschedules.find(
    (r) =>
      r.status === "pending" ||
      r.status === "approved" ||
      r.status === "declined",
  )
}

export function rescheduleById(id: string): RescheduleRequest | undefined {
  return reschedules.find((r) => r.id === id)
}

export function pendingRescheduleForClass(
  classId: string,
): RescheduleRequest | undefined {
  return reschedules.find(
    (r) => r.originalClassId === classId && r.status === "pending",
  )
}

export function rescheduleForClass(
  classId: string,
): RescheduleRequest | undefined {
  return reschedules.find((r) => r.originalClassId === classId)
}

export function cancelReschedule(id: string): boolean {
  const idx = reschedules.findIndex((r) => r.id === id)
  if (idx === -1) return false
  if (reschedules[idx].status !== "pending") return false
  reschedules.splice(idx, 1)
  return true
}

let counter = 100

export function createReschedule(params: {
  originalClassId: string
  replacement: ReplacementSlot
  reason: RescheduleReason
  note?: string
}): RescheduleRequest {
  counter += 1
  const submittedAt = new Date().toISOString()
  const expiresAt = new Date(
    new Date(submittedAt).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString()
  const request: RescheduleRequest = {
    id: `rs_${counter}`,
    originalClassId: params.originalClassId,
    replacement: {
      startsAt: params.replacement.startsAt,
      endsAt: params.replacement.endsAt,
    },
    reason: params.reason,
    note: params.note,
    submittedAt,
    expiresAt,
    status: "pending",
  }
  reschedules.unshift(request)
  return request
}
