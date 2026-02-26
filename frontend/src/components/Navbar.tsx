import { NavLink, useLocation } from "react-router-dom"
import { useState } from "react"
import { DropdownMenuAvatar } from "./ProfileDropdown"

const links = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Study Plan", path: "/study-plan" },
  { name: "Chat", path: "/chat" },
]

const Navbar = () => {
  const location = useLocation()

  const activeIndex = links.findIndex(link =>
    location.pathname.startsWith(link.path)
  )

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const currentIndex = hoverIndex ?? (activeIndex === -1 ? 0 : activeIndex)

  return (
    <header className="w-full">
      {/* Reduced height and padding on mobile, standard on md+ */}
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">

        {/* Brand */}
        <div className="flex items-center gap-2">
          {/* Show full text on small screens and up, hide on mobile to save space */}
          <span className="hidden text-base font-bold tracking-tight text-white sm:block md:text-lg">
            CampusMate
          </span>
          {/* Small dot logo for mobile only */}
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#38bdf8]/10 sm:hidden">
            <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
          </span>
          {/* Standard dot for desktop */}
          <span className="hidden h-1.5 w-1.5 rounded-full bg-[#38bdf8]/50 sm:block" />
        </div>

        {/* Center Nav - Responsive width container */}
        <nav
          className="relative flex items-center rounded-full bg-white/5 p-1 w-[220px] sm:w-[280px] md:w-[330px]"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Sliding pill: Uses CSS calc() to perfectly divide the container by 3. 
            This makes it 100% responsive without needing JavaScript window listeners! 
          */}
          <span
            className="absolute h-7 md:h-8 rounded-full bg-[#38bdf8]/20 transition-transform duration-500 ease-in-out"
            style={{
              width: "calc((100% - 8px) / 3)",
              transform: `translateX(calc(${currentIndex * 100}%))`,
            }}
          />

          {links.map((link, index) => (
            <NavLink
              key={link.path}
              to={link.path}
              onMouseEnter={() => setHoverIndex(index)}
              className="relative z-10 flex flex-1 h-7 md:h-8 items-center justify-center text-[11px] sm:text-xs md:text-sm text-white/70 transition-colors hover:text-white"
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