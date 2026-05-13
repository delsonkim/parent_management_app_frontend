import type { Class, ClassStatus, Subject } from "./types"
import { child } from "./parent"

function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function plusHours(iso: string, hours: number): string {
  const d = new Date(iso)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

// Existing seeded near-term lessons. Past ones use "present" so they count as
// attended; future ones remain "scheduled". Two of them carry rescheduled-out
// data to demonstrate the visual state.
const seedClasses: Class[] = [
  {
    id: "cls_001",
    childId: child.id,
    centreId: "ctr_mvp",
    tutorId: "t_mvp_lim",
    subject: "math",
    classCode: "P5-MATH-A",
    level: "Primary 5",
    startsAt: daysFromNow(-5, 16),
    endsAt: plusHours(daysFromNow(-5, 16), 1.5),
    status: "present",
  },
  {
    id: "cls_002",
    childId: child.id,
    centreId: "ctr_bm",
    tutorId: "t_bm_chen",
    subject: "english",
    classCode: "P5-ENG-2",
    level: "Primary 5",
    startsAt: daysFromNow(-2, 17, 30),
    endsAt: plusHours(daysFromNow(-2, 17, 30), 1.5),
    status: "present",
  },
  {
    id: "cls_003",
    childId: child.id,
    centreId: "ctr_mvp",
    tutorId: "t_mvp_lim",
    subject: "math",
    classCode: "P5-MATH-A",
    level: "Primary 5",
    startsAt: daysFromNow(1, 16),
    endsAt: plusHours(daysFromNow(1, 16), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_004",
    childId: child.id,
    centreId: "ctr_lh",
    tutorId: "t_lh_lee",
    subject: "chinese",
    classCode: "P5-CHI-B",
    level: "Primary 5",
    startsAt: daysFromNow(2, 15, 30),
    endsAt: plusHours(daysFromNow(2, 15, 30), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_005",
    childId: child.id,
    centreId: "ctr_bm",
    tutorId: "t_bm_chen",
    subject: "english",
    classCode: "P5-ENG-2",
    level: "Primary 5",
    startsAt: daysFromNow(4, 17, 30),
    endsAt: plusHours(daysFromNow(4, 17, 30), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_006",
    childId: child.id,
    centreId: "ctr_bm",
    tutorId: "t_bm_wong",
    subject: "science",
    classCode: "P5-SCI-1",
    level: "Primary 5",
    startsAt: daysFromNow(6, 14),
    endsAt: plusHours(daysFromNow(6, 14), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_007",
    childId: child.id,
    centreId: "ctr_mvp",
    tutorId: "t_mvp_lim",
    subject: "math",
    classCode: "P5-MATH-A",
    level: "Primary 5",
    startsAt: daysFromNow(8, 16),
    endsAt: plusHours(daysFromNow(8, 16), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_008",
    childId: child.id,
    centreId: "ctr_lh",
    tutorId: "t_lh_lee",
    subject: "chinese",
    classCode: "P5-CHI-B",
    level: "Primary 5",
    startsAt: daysFromNow(9, 15, 30),
    endsAt: plusHours(daysFromNow(9, 15, 30), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_009",
    childId: child.id,
    centreId: "ctr_bm",
    tutorId: "t_bm_chen",
    subject: "english",
    classCode: "P5-ENG-2",
    level: "Primary 5",
    startsAt: daysFromNow(11, 17, 30),
    endsAt: plusHours(daysFromNow(11, 17, 30), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_010",
    childId: child.id,
    centreId: "ctr_bm",
    tutorId: "t_bm_wong",
    subject: "science",
    classCode: "P5-SCI-1",
    level: "Primary 5",
    startsAt: daysFromNow(13, 14),
    endsAt: plusHours(daysFromNow(13, 14), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_011",
    childId: child.id,
    centreId: "ctr_mvp",
    tutorId: "t_mvp_lim",
    subject: "math",
    classCode: "P5-MATH-A",
    level: "Primary 5",
    startsAt: daysFromNow(15, 16),
    endsAt: plusHours(daysFromNow(15, 16), 1.5),
    status: "scheduled",
  },
  {
    id: "cls_012",
    childId: child.id,
    centreId: "ctr_lh",
    tutorId: "t_lh_lee",
    subject: "chinese",
    classCode: "P5-CHI-B",
    level: "Primary 5",
    startsAt: daysFromNow(16, 15, 30),
    endsAt: plusHours(daysFromNow(16, 15, 30), 1.5),
    status: "scheduled",
  },
]

// 8-week history generator per recurring class. Status pattern roughly mirrors
// real-life: mostly present, sprinkled with absences and a rescheduled-out.
interface SeriesSpec {
  classCode: string
  centreId: string
  tutorId: string
  subject: Subject
  level: string
  hour: number
  minute: number
  durationHours: number
}

const pastSeries: SeriesSpec[] = [
  {
    classCode: "P5-MATH-A",
    centreId: "ctr_mvp",
    tutorId: "t_mvp_lim",
    subject: "math",
    level: "Primary 5",
    hour: 16,
    minute: 0,
    durationHours: 1.5,
  },
  {
    classCode: "P5-ENG-2",
    centreId: "ctr_bm",
    tutorId: "t_bm_chen",
    subject: "english",
    level: "Primary 5",
    hour: 17,
    minute: 30,
    durationHours: 1.5,
  },
  {
    classCode: "P5-CHI-B",
    centreId: "ctr_lh",
    tutorId: "t_lh_lee",
    subject: "chinese",
    level: "Primary 5",
    hour: 15,
    minute: 30,
    durationHours: 1.5,
  },
  {
    classCode: "P5-SCI-1",
    centreId: "ctr_bm",
    tutorId: "t_bm_wong",
    subject: "science",
    level: "Primary 5",
    hour: 14,
    minute: 0,
    durationHours: 1.5,
  },
]

// Deterministic pattern over 8 weeks per class. Index 0 = 1 week ago.
const statusPattern: ClassStatus[] = [
  "present",
  "present",
  "present",
  "rescheduled-out",
  "present",
  "absent",
  "present",
  "present",
]

const pastLessons: Class[] = []
for (const spec of pastSeries) {
  for (let w = 1; w <= 8; w++) {
    // Offset the first week back relative to the existing -5/-2 seed for math
    // and english so we don't collide on the same day; for chinese and
    // science (which have no existing past entries) the baseline is fine.
    const baseWeekOffset =
      spec.classCode === "P5-MATH-A" || spec.classCode === "P5-ENG-2"
        ? 7 // start at -7 -> avoid collision with -5 / -2 seeds
        : 6 // pull forward by one week so chinese/science get -6,-13,...
    const offset = -(baseWeekOffset + (w - 1) * 7)
    const startsAt = daysFromNow(offset, spec.hour, spec.minute)
    pastLessons.push({
      id: `cls_past_${spec.classCode}_w${w}`,
      childId: child.id,
      centreId: spec.centreId,
      tutorId: spec.tutorId,
      subject: spec.subject,
      classCode: spec.classCode,
      level: spec.level,
      startsAt,
      endsAt: plusHours(startsAt, spec.durationHours),
      status: statusPattern[(w - 1) % statusPattern.length],
    })
  }
}

export const classes: Class[] = [...seedClasses, ...pastLessons]

export function upcomingClasses(limit?: number): Class[] {
  const now = Date.now()
  const sorted = classes
    .filter(
      (c) =>
        new Date(c.startsAt).getTime() >= now &&
        c.status !== "cancelled" &&
        c.status !== "rescheduled-out",
    )
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted
}

// --- Attendance helpers ---

export function pastLessonsForClass(
  centreId: string,
  classCode: string,
  childId: string,
): Class[] {
  const now = Date.now()
  return classes
    .filter(
      (c) =>
        c.centreId === centreId &&
        c.classCode === classCode &&
        c.childId === childId &&
        new Date(c.startsAt).getTime() < now,
    )
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    )
}

export function pastLessonsForChild(childId: string): Class[] {
  const now = Date.now()
  return classes
    .filter(
      (c) => c.childId === childId && new Date(c.startsAt).getTime() < now,
    )
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    )
}

export interface AttendanceStats {
  total: number
  attended: number
  absent: number
  rescheduledOut: number
  cancelled: number
  rate: number // 0-1
}

// Counts lessons that fall under attendance scope: present, absent, and
// rescheduled-out (the student missed it). Rescheduled-in is counted as
// attended. Cancelled lessons are tracked separately and don't affect rate.
export function attendanceStats(lessons: Class[]): AttendanceStats {
  let attended = 0
  let absent = 0
  let rescheduledOut = 0
  let cancelled = 0
  for (const l of lessons) {
    if (l.status === "present" || l.status === "rescheduled-in") attended++
    else if (l.status === "absent") absent++
    else if (l.status === "rescheduled-out") rescheduledOut++
    else if (l.status === "cancelled") cancelled++
  }
  const denom = attended + absent + rescheduledOut
  const rate = denom > 0 ? attended / denom : 0
  return {
    total: denom,
    attended,
    absent,
    rescheduledOut,
    cancelled,
    rate,
  }
}

export interface ClassSummary {
  centreId: string
  classCode: string
  subject: Subject
  level: string
  stats: AttendanceStats
}

// One summary per recurring class the child has any past lessons for.
export function perClassAttendance(childId: string): ClassSummary[] {
  const byKey = new Map<string, Class[]>()
  for (const c of classes) {
    if (c.childId !== childId) continue
    if (new Date(c.startsAt).getTime() >= Date.now()) continue
    const key = `${c.centreId}|${c.classCode}`
    const arr = byKey.get(key) ?? []
    arr.push(c)
    byKey.set(key, arr)
  }
  return Array.from(byKey.entries()).map(([key, lessons]) => {
    const [centreId, classCode] = key.split("|")
    const sample = lessons[0]
    return {
      centreId,
      classCode,
      subject: sample.subject,
      level: sample.level,
      stats: attendanceStats(lessons),
    }
  })
}
