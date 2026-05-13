import BillsSummaryTile from "./BillsSummaryTile"
import RescheduleSummaryTile from "./RescheduleSummaryTile"

export default function SummaryTileRow() {
  return (
    <section className="grid grid-cols-2 gap-3 px-5 pb-4">
      <BillsSummaryTile />
      <RescheduleSummaryTile />
    </section>
  )
}
