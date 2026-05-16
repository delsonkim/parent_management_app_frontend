import ClashAlerts from "@/components/home/ClashAlerts"
import Greeting from "@/components/home/Greeting"
import HomeCarousel, { hasNextUp } from "@/components/home/HomeCarousel"
import UpcomingClasses from "@/components/home/UpcomingClasses"

export default function HomePage() {
  return (
    <div className="flex h-full flex-col pb-4">
      <Greeting />
      <ClashAlerts />
      <HomeCarousel />
      <UpcomingClasses skipFirst={hasNextUp()} />
    </div>
  )
}
