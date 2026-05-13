import { parent, child } from "@/data/parent"

function timeOfDay(hour: number): "morning" | "afternoon" | "evening" {
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 18) return "afternoon"
  return "evening"
}

export default function Greeting() {
  const period = timeOfDay(new Date().getHours())

  return (
    <header className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        Good {period}, {parent.firstName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {child.firstName} · {child.level}
      </p>
    </header>
  )
}
