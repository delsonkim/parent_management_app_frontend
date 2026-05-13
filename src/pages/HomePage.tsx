import ClashAlerts from "@/components/home/ClashAlerts"
import Greeting from "@/components/home/Greeting"
import NextUpHero, { pickNextUp } from "@/components/home/NextUpHero"
import SummaryTileRow from "@/components/home/SummaryTileRow"
import UpcomingClasses from "@/components/home/UpcomingClasses"

export default function HomePage() {
  const nextUp = pickNextUp()

  return (
    <div className="flex h-full flex-col pb-4">
      <Greeting />
      <ClashAlerts />
      {nextUp && <NextUpHero cls={nextUp} />}
      <SummaryTileRow />
      <UpcomingClasses skipFirst={Boolean(nextUp)} />
    </div>
  )
}
