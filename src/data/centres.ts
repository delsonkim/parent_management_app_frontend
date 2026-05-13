import type { Centre } from "./types"

export const centres: Centre[] = [
  { id: "ctr_mvp", name: "Math Viewpoint" },
  { id: "ctr_bm", name: "Bright Minds Tuition" },
  { id: "ctr_lh", name: "Linguahub Chinese" },
]

export const centreById = (id: string): Centre | undefined =>
  centres.find((c) => c.id === id)
