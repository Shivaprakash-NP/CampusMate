import { NavLink, useLocation } from "react-router-dom"
import { useState } from "react"
import { DropdownMenuAvatar } from "./ProfileDropdown"

const links = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Study Plan", path: "/study-plan" },
  { name: "Chat", path: "/chat" },
]

const PILL_WIDTH = 110

const Navbar = () => {
  const location = useLocation()

  const activeIndex = links.findIndex(link =>
    location.pathname.startsWith(link.path)
  )

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const currentIndex = hoverIndex ?? activeIndex

  return (
    <header className="w-full">
      <div className="flex h-14 items-center justify-between px-6">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-white">
            CampusMate
          </span>
          {/* Reduced visual dominance */}
          <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]/50" />
        </div>

        {/* Center Nav */}
        <nav
          className="relative flex items-center rounded-full bg-white/5 p-1"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Sliding pill */}
          <span
            className="absolute h-8 rounded-full bg-[#38bdf8]/20 transition-transform duration-500 ease-in-out"
            style={{
              width: `${PILL_WIDTH}px`,
              transform: `translateX(${currentIndex * PILL_WIDTH}px)`,
            }}
          />

          {links.map((link, index) => (
            <NavLink
              key={link.path}
              to={link.path}
              onMouseEnter={() => setHoverIndex(index)}
              className="relative z-10 flex h-8 w-[110px] items-center justify-center text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Profile Avatar Dropdown */}
        <DropdownMenuAvatar />
      </div>
    </header>
  )
}

export default Navbar
