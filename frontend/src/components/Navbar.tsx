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

  // --- STATE LOGIC UNTOUCHED ---
  const activeIndex = links.findIndex(link =>
    location.pathname.startsWith(link.path)
  )

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const currentIndex = hoverIndex ?? (activeIndex === -1 ? 0 : activeIndex)
  // -----------------------------

  return (
    <header className="w-full border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 md:h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <span className="hidden text-sm font-semibold tracking-tight text-zinc-100 sm:block md:text-base">
            CampusMate
          </span>
          {/* Cyan Accent Dot */}
          <span className="hidden h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] sm:block" />

          {/* Mobile Minimalist Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 sm:hidden shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          </div>
        </div>

        {/* Center Nav */}
        <nav
          className="relative flex items-center rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-1 w-[240px] sm:w-[320px] shadow-sm"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Sliding pill */}
          <span
            className="absolute h-8 rounded-md bg-zinc-800 border border-zinc-700/50 shadow-sm transition-transform duration-300 ease-out"
            style={{
              width: "calc((100% - 8px) / 3)",
              transform: `translateX(calc(${currentIndex * 100}%))`,
            }}
          />

          {/* Nav Links */}
          {links.map((link, index) => {
            const isActive = activeIndex === index;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onMouseEnter={() => setHoverIndex(index)}
                className={`relative z-10 flex flex-1 h-8 items-center justify-center text-[11px] sm:text-sm font-medium tracking-tight transition-colors duration-200 ${
                  isActive 
                    ? "text-zinc-100 drop-shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {link.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Profile Avatar Dropdown */}
        <div className="flex items-center gap-3">
          <DropdownMenuAvatar />
        </div>
        
      </div>
    </header>
  )
}

export default Navbar