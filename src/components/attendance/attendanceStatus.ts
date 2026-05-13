import type { ClassStatus } from "@/data/types"

interface PillStyle {
  label: string
  className: string
}

export const attendanceStatusPill: Record<ClassStatus, PillStyle | null> = {
  scheduled: null,
  present: {
    label: "Attended",
    className: "bg-success-bg text-success-text",
  },
  absent: {
    label: "Absent",
    className: "bg-error-bg text-error-text",
  },
  "rescheduled-out": {
    label: "Rescheduled",
    className: "bg-warning-bg text-warning-text",
  },
  "rescheduled-in": {
    label: "Makeup attended",
    className: "bg-success-bg text-success-text",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600",
  },
}
