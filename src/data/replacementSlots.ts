import type { Subject } from "./types"

export interface ReplacementSlot {
  id: string
  centreId: string
  subject: Subject
  tutorId: string
  startsAt: string
  endsAt: string
}

function nextWeekday(targetDay: number, hour: number, minute = 0): string {
  // targetDay: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const d = new Date()
  const diff = (targetDay - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function plusMinutes(iso: string, minutes: number): string {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + minutes)
  return d.toISOString()
}

// Open replacement slots per centre + subject combination.
// Mock data — in real product these come from the centre's published schedule.
const allSlots: ReplacementSlot[] = [
  // Math Viewpoint — Math
  {
    id: "slot_mvp_math_sat_am",
    centreId: "ctr_mvp",
    subject: "math",
    tutorId: "t_mvp_lim",
    startsAt: nextWeekday(6, 9),
    endsAt: plusMinutes(nextWeekday(6, 9), 90),
  },
  {
    id: "slot_mvp_math_sat_pm",
    centreId: "ctr_mvp",
    subject: "math",
    tutorId: "t_mvp_tan",
    startsAt: nextWeekday(6, 14),
    endsAt: plusMinutes(nextWeekday(6, 14), 90),
  },
  {
    id: "slot_mvp_math_sun_am",
    centreId: "ctr_mvp",
    subject: "math",
    tutorId: "t_mvp_lim",
    startsAt: nextWeekday(0, 10),
    endsAt: plusMinutes(nextWeekday(0, 10), 90),
  },

  // Bright Minds — English
  {
    id: "slot_bm_eng_sat_am",
    centreId: "ctr_bm",
    subject: "english",
    tutorId: "t_bm_chen",
    startsAt: nextWeekday(6, 10),
    endsAt: plusMinutes(nextWeekday(6, 10), 90),
  },
  {
    id: "slot_bm_eng_fri_pm",
    centreId: "ctr_bm",
    subject: "english",
    tutorId: "t_bm_chen",
    startsAt: nextWeekday(5, 17, 30),
    endsAt: plusMinutes(nextWeekday(5, 17, 30), 90),
  },
  {
    id: "slot_bm_eng_sun_am",
    centreId: "ctr_bm",
    subject: "english",
    tutorId: "t_bm_chen",
    startsAt: nextWeekday(0, 11),
    endsAt: plusMinutes(nextWeekday(0, 11), 90),
  },

  // Bright Minds — Science
  {
    id: "slot_bm_sci_sat_pm",
    centreId: "ctr_bm",
    subject: "science",
    tutorId: "t_bm_wong",
    startsAt: nextWeekday(6, 14),
    endsAt: plusMinutes(nextWeekday(6, 14), 90),
  },
  {
    id: "slot_bm_sci_sun_pm",
    centreId: "ctr_bm",
    subject: "science",
    tutorId: "t_bm_wong",
    startsAt: nextWeekday(0, 15),
    endsAt: plusMinutes(nextWeekday(0, 15), 90),
  },

  // Linguahub — Chinese
  {
    // Deliberate clash with Aiden's Science class on Monday 2 PM at Bright Minds.
    id: "slot_lh_chi_mon_pm",
    centreId: "ctr_lh",
    subject: "chinese",
    tutorId: "t_lh_lee",
    startsAt: nextWeekday(1, 14),
    endsAt: plusMinutes(nextWeekday(1, 14), 90),
  },
  {
    id: "slot_lh_chi_sat_pm",
    centreId: "ctr_lh",
    subject: "chinese",
    tutorId: "t_lh_lee",
    startsAt: nextWeekday(6, 13),
    endsAt: plusMinutes(nextWeekday(6, 13), 90),
  },
  {
    id: "slot_lh_chi_fri_pm",
    centreId: "ctr_lh",
    subject: "chinese",
    tutorId: "t_lh_lee",
    startsAt: nextWeekday(5, 15, 30),
    endsAt: plusMinutes(nextWeekday(5, 15, 30), 90),
  },
  {
    id: "slot_lh_chi_sun_pm",
    centreId: "ctr_lh",
    subject: "chinese",
    tutorId: "t_lh_lee",
    startsAt: nextWeekday(0, 14),
    endsAt: plusMinutes(nextWeekday(0, 14), 90),
  },
]

export function replacementSlotsFor(
  centreId: string,
  subject: Subject,
  excludeStartsAt?: string,
): ReplacementSlot[] {
  return allSlots
    .filter(
      (s) =>
        s.centreId === centreId &&
        s.subject === subject &&
        s.startsAt !== excludeStartsAt,
    )
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
}

export function replacementSlotById(
  id: string,
): ReplacementSlot | undefined {
  return allSlots.find((s) => s.id === id)
}
