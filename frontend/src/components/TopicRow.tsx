import { useState } from "react"
import { ChevronRight, ChevronDown, FileText, PlayCircle, Plus, MessageSquare,Sparkles, Bot, MessageCircleQuestion, Zap } from "lucide-react"
import type { TopicNode } from "../shared/TopicNode"
import { LinearProgress } from "@mui/material"
import { useNavigate } from "react-router-dom"

type Props = {
  node: TopicNode
  depth?: number
  toggleCompleted: (id: string,e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => void
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false)
  const isLeaf = !node.children || node.children.length === 0
  const hasChildren = !isLeaf

  const progress = hasChildren ? getProgress(node) : null
  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0

  
  const handleChatJump = () => {
    // We pass the topic ID and Title via URL query parameters
    const chatUrl = `/chat?topicId=${node.id}&topicTitle=${encodeURIComponent(node.title)}`;
    
    navigate(chatUrl)
  };
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
          {/* 1. Checkbox Column */}
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              checked={node.completed}
              onChange={(e) => toggleCompleted(node.id, e)}
              className="h-4 w-4 accent-[#38bdf8] cursor-pointer"
            />
          </div>

          {/* 2. Title Column (Fills available space, truncates if too long) */}
          <span
            className={`truncate transition-colors ${
              node.completed ? "text-white/40" : "text-white/90"
            }`}
            title={node.title}
          >
            {node.title}
          </span>

         {/* 3. Actions Column */}
          {/* Keep the global right-alignment and padding to nudge them left */}
          <div className="flex items-center justify-end pr-6 opacity-30 group-hover:opacity-100 transition-opacity">
            
            {/* -- The 3 Resource Icons Group -- */}
            {/* Changed 'gap-3' to 'gap-5' to increase the spacing between these 3 icons */}
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

              {/* Chat Icon */}
              <button onClick={handleChatJump} title={`Chat about ${node.title}`} className="hover:scale-110 transition-transform">
                <Bot className="h-4 w-4  text-white hover:text-[#38bdf8] transition-colors" />
              </button>

            </div>

            {/* -- The Plus Icon -- */}
            {/* Added 'ml-8' to create a clear separation from the 3 icons */}
            <button title="Add Note" className="ml-8 hover:scale-110 transition-transform">
              <Plus className="h-4 w-4 text-white/50 hover:text-white transition-colors" />
            </button>
            
          </div>
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