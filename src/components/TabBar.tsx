import { NavLink } from "react-router-dom"
import { Calendar, CreditCard, Home, Inbox, User } from "lucide-react"
import type { ComponentType, SVGProps } from "react"

type Tab = {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const tabs: Tab[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/schedule", label: "Schedule", Icon: Calendar },
  { to: "/inbox", label: "Inbox", Icon: Inbox },
  { to: "/payments", label: "Payments", Icon: CreditCard },
  { to: "/profile", label: "Profile", Icon: User },
]

export default function TabBar() {
  return (
    <nav
      className="sticky bottom-0 z-40 shrink-0 border-t border-gray-200 bg-surface"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-xs",
                  isActive ? "text-primary-600" : "text-gray-500",
                ].join(" ")
              }
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
