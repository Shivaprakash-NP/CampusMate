import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, FileText, PlayCircle, Plus, Bot } from "lucide-react"
import type { TopicNode } from "../shared/TopicNode"
import { LinearProgress } from "@mui/material"
import { useNavigate } from "react-router-dom"

type Props = {
  node: TopicNode
  depth?: number
  toggleCompleted: (id: string, e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Calculates the progress of a node based on its children's completion status.
 */
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
  const navigate = useNavigate();
  
  const isLeaf = !node.children || node.children.length === 0
  const hasChildren = !isLeaf

  // --- STATE PERSISTENCE LOGIC ---
  
  // Initialize state from localStorage using a lazy initializer
  const [open, setOpen] = useState(() => {
    if (isLeaf) return false;
    // Check localStorage for a saved state using the unique node ID
    const saved = localStorage.getItem(`topic_open_${node.id}`);
    // Default to 'true' (open) if no saved state exists
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Update localStorage whenever the 'open' state changes
  useEffect(() => {
    if (hasChildren) {
      localStorage.setItem(`topic_open_${node.id}`, JSON.stringify(open));
    }
  }, [open, node.id, hasChildren]);

  // --- PROGRESS CALCULATIONS ---

  const progress = hasChildren ? getProgress(node) : null
  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0

  // --- HANDLERS ---
  
  const handleChatJump = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the row when clicking icons
    const chatUrl = `/chat?topicId=${node.id}&topicTitle=${encodeURIComponent(node.title)}`;
    navigate(chatUrl);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.stopPropagation();
      setOpen(!open);
    }
  };

  return (
    <>
      {/* PARENT ROW (Header for collapsible sections) */}
      {hasChildren && (
        <div
          onClick={toggleOpen}
          className="
            flex items-center justify-between
            rounded-lg px-3 py-2
            hover:bg-white/5
            transition cursor-pointer
          "
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          <div className="flex items-center gap-2">
            <div>
              {open ? (
                <ChevronDown className="h-4 w-4 text-white/50" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/50" />
              )}
            </div>

            <span className="text-sm font-medium text-white/75 uppercase tracking-wider">
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

      {/* LEAF ROW (The actual syllabus items/lessons) */}
      {isLeaf && (
        <div
          className="
            group
            grid grid-cols-[32px_1fr_auto] gap-4
            items-center
            px-3 py-3
            border-t border-white/5
            hover:bg-white/5
            transition-colors
            text-sm
          "
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
        >
          {/* Checkbox */}
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              checked={node.completed}
              onChange={(e) => toggleCompleted(node.id, e)}
              className="h-4 w-4 accent-[#38bdf8] cursor-pointer"
            />
          </div>

          {/* Title */}
          <span
            className={`truncate transition-colors ${
              node.completed ? "text-white/40" : "text-white/90"
            }`}
            title={node.title}
          >
            {node.title}
          </span>

          {/* Actions Column */}
          <div className="flex items-center justify-end pr-6 opacity-30 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-5">
              {node.resources?.map((r: { type: string; url?: string }, index: number) => {
                if (r.type === "ARTICLE" && r.url) {
                  return (
                    <a key={index} href={r.url} target="_blank" rel="noopener noreferrer" title="Read Article" className="hover:scale-110 transition-transform">
                      <FileText className="h-4 w-4 text-white hover:text-[#38bdf8] transition-colors cursor-pointer" />
                    </a>
                  )
                }
                if (r.type === "VIDEO" && r.url) {
                  return (
                    <a key={index} href={r.url} target="_blank" rel="noopener noreferrer" title="Watch Video" className="hover:scale-110 transition-transform">
                      <PlayCircle className="h-4 w-4 text-white hover:text-[#38bdf8] transition-colors cursor-pointer" />
                    </a>
                  )
                }
                return null
              })}

              <button onClick={handleChatJump} title={`Chat about ${node.title}`} className="hover:scale-110 transition-transform">
                <Bot className="h-4 w-4 text-white hover:text-[#38bdf8] transition-colors" />
              </button>
            </div>

            <button title="Add Note" className="ml-8 hover:scale-110 transition-transform">
              <Plus className="h-4 w-4 text-white/50 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* RECURSIVE CHILDREN RENDERING */}
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