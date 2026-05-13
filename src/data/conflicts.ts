import type { Class, RescheduleRequest } from "./types"
import { classes } from "./classes"
import { child } from "./parent"
import { reschedules } from "./reschedules"

export interface SlotLike {
  startsAt: string
  endsAt: string
}

export function findClashForSlot(
  childId: string,
  slot: SlotLike,
  excludeClassId?: string,
): Class | undefined {
  const slotStart = new Date(slot.startsAt).getTime()
  const slotEnd = new Date(slot.endsAt).getTime()
  return classes.find((c) => {
    if (c.childId !== childId) return false
    if (c.id === excludeClassId) return false
    if (c.status === "cancelled" || c.status === "rescheduled-out") return false
    const cs = new Date(c.startsAt).getTime()
    const ce = new Date(c.endsAt).getTime()
    return cs < slotEnd && ce > slotStart
  })
}

export interface PendingClash {
  pendingRequest: RescheduleRequest
  clashClass: Class
}

export function pendingClashes(): PendingClash[] {
  const out: PendingClash[] = []
  for (const r of reschedules) {
    if (r.status !== "pending" || !r.replacement) continue
    const clash = findClashForSlot(child.id, r.replacement, r.originalClassId)
    if (clash) out.push({ pendingRequest: r, clashClass: clash })
  }
  return out
}
