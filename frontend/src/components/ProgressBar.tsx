import { useEffect, useState } from "react"

interface OverallProgressProps {
  percentage: number
  completed: number
  total: number
}

export function OverallProgress({
  percentage,
  completed,
  total,
}: OverallProgressProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0)

  // clamp percentage to safe range
  const safePercentage = Math.min(100, Math.max(0, percentage))

  // animate on change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(safePercentage)
    }, 50)

    return () => clearTimeout(timer)
  }, [safePercentage])

  // SVG math
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (displayPercentage / 100) * circumference

  return (
    <div className="w-full rounded-lg border border-white/10 bg-[#14232d] px-6 py-5">
      <div className="flex items-center gap-6">

        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg
            width="110"
            height="110"
            viewBox="0 0 120 120"
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="8"
            />

            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-white">
              {Math.round(displayPercentage)}%
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-white">
            Overall Progress
          </h2>
          <p className="text-sm text-white/60">
            {completed} / {total} topics completed
          </p>
          <div className="flex flex-col gap-1 text-sm text-white/60">
            <span>
              {"\u2022"} Total topics: {total}
            </span>
            <span>
              {"\u2022"} Completed: {completed}
            </span>
            <span>
              {"\u2022"} Remaining: {total - completed}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
