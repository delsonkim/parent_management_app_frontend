import type { Tutor } from "./types"

export const tutors: Tutor[] = [
  { id: "t_mvp_lim", name: "Mr Lim", centreId: "ctr_mvp" },
  { id: "t_mvp_tan", name: "Ms Tan", centreId: "ctr_mvp" },
  { id: "t_bm_chen", name: "Ms Chen", centreId: "ctr_bm" },
  { id: "t_bm_wong", name: "Mr Wong", centreId: "ctr_bm" },
  { id: "t_lh_lee", name: "Lao Shi Lee", centreId: "ctr_lh" },
]

export const tutorById = (id: string): Tutor | undefined =>
  tutors.find((t) => t.id === id)
