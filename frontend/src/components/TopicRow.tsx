import { useState } from "react"
import { ChevronRight, ChevronDown, FileText, PlayCircle, Plus } from "lucide-react"
import type { TopicNode } from "../shared/TopicNode"
import { LinearProgress } from "@mui/material"

type Props = {
  node: TopicNode
  depth?: number
  toggleCompleted: (id: string) => void
}

export function getProgress(node: TopicNode): {
  completed: number
  total: number
} {
  if (!node.children || node.children.length === 0) {
    return {
      completed: node.completed ? 1 : 0,
      total: 1,
    }
  }

  return node.children.reduce(
    (acc: { completed: number; total: number }, child: TopicNode) => {
      const p = getProgress(child)
      return {
        completed: acc.completed + p.completed,
        total: acc.total + p.total,
      }
    },
    { completed: 0, total: 0 }
  )
}

const TopicRow = ({ node, depth = 0, toggleCompleted }: Props) => {
  const [open, setOpen] = useState(false)
  const isLeaf = !node.children || node.children.length === 0
  const hasChildren = !isLeaf

  const progress = hasChildren ? getProgress(node) : null
  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0

  

  return (
    <>
      {/* PARENT ROW */}
      {hasChildren && (
        <div
          className="
            flex items-center justify-between
            rounded-lg px-3 py-2
            hover:bg-white/5
            transition
          "
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(!open)}>
              {open ? (
                <ChevronDown className="h-4 w-4 text-white/50" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/50" />
              )}
            </button>

            <span className="text-sm text-white/75">
              {node.title}
            </span>
          </div>

          <div className="flex items-center gap-3 min-w-[180px]">
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                width: 120,
                height: 5,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.12)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#38bdf8",
                },
              }}
            />
            <span className="text-xs text-white/40">
              {progress?.completed} / {progress?.total}
            </span>
          </div>
        </div>
      )}

      {/* LEAF ROW */}
      {isLeaf && (
        <div
          className="
            group
            grid grid-cols-[40px_1fr_80px_120px_80px_50px]
            items-center
            px-3 py-3
            border-t border-white/5
            hover:bg-white/5
            transition
            text-sm
          "
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={node.completed}
            onChange={() => toggleCompleted(node.id)}
            className="h-4 w-4 accent-[#38bdf8]"
          />

          {/* Title */}
          <span
            className={
              node.completed
                ? "text-white/55"
                : "text-white/90"
            }
          >
            {node.title}
          </span>

{/* Resources */}
          <div className="flex gap-3 opacity-40 group-hover:opacity-100 transition">
            {node.resources?.map((r: { type: string; url?: string }, index: number) => {
              // Changed "article" to "ARTICLE"
              if (r.type === "ARTICLE" && r.url) {
                return (
                  <a
                    key={index}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Read Article"
                    className="hover:scale-110 transition-transform"
                  >
                    <FileText className="h-4 w-4 text-[#38bdf8] hover:text-white transition-colors cursor-pointer" />
                  </a>
                )
              }
              // Changed "video" to "VIDEO"
              if (r.type === "VIDEO" && r.url) {
                return (
                  <a
                    key={index}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Watch Video"
                    className="hover:scale-110 transition-transform"
                  >
                    <PlayCircle className="h-4 w-4 text-[#38bdf8] hover:text-white transition-colors cursor-pointer" />
                  </a>
                )
              }
              return null
            })}
          </div>

          {/* Practice */}
          <span className="text-white/30 group-hover:text-white/60 transition">
            ---
          </span>

          {/* Notes */}
          <button className="text-white/30 hover:text-white transition">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* CHILDREN */}
      {open &&
        hasChildren &&
        node.children!.map((child: TopicNode) => (
          <TopicRow
            key={child.id}
            node={child}
            depth={depth + 1}
            toggleCompleted={toggleCompleted}
          />
        ))}
    </>
  )
}

export default TopicRow