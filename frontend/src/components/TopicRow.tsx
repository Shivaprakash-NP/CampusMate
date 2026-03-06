import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, FileText, PlayCircle, Plus, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import type { TopicNode } from "../shared/TopicNode"

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

  // --- STATE PERSISTENCE LOGIC UNTOUCHED ---
  const [open, setOpen] = useState(() => {
    if (isLeaf) return false;
    const saved = localStorage.getItem(`topic_open_${node.id}`);
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (hasChildren) {
      localStorage.setItem(`topic_open_${node.id}`, JSON.stringify(open));
    }
  }, [open, node.id, hasChildren]);

  // --- PROGRESS CALCULATIONS UNTOUCHED ---
  const progress = hasChildren ? getProgress(node) : null
  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0

  // --- HANDLERS UNTOUCHED ---
  const handleChatJump = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            group flex items-center justify-between
            px-3 py-3
            hover:bg-zinc-800/40
            transition-colors duration-200 cursor-pointer
            border-t border-zinc-800/30 first:border-t-0
          "
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          <div className="flex items-center gap-2.5">
            <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>

            {/* Premium micro-header typography */}
            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-300 uppercase tracking-wider transition-colors">
              {node.title}
            </span>
          </div>

          <div className="flex items-center gap-4 min-w-[140px] justify-end">
            {/* Custom Tailwind Progress Bar replacing MUI */}
            <div className="w-[80px] sm:w-[100px] h-1.5 rounded-full bg-zinc-800/80 overflow-hidden shadow-inner">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-zinc-500 w-8 text-right tabular-nums">
              {progress?.completed}/{progress?.total}
            </span>
          </div>
        </div>
      )}

      {/* LEAF ROW (The actual syllabus items/lessons) */}
      {isLeaf && (
        <div
          className="
            group
            grid grid-cols-[28px_1fr_auto] gap-3
            items-center
            px-3 py-2.5
            border-t border-zinc-800/50
            hover:bg-zinc-800/40
            transition-colors duration-200
          "
          style={{ paddingLeft: `${depth * 20 + 20}px` }}
        >
          {/* Checkbox */}
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              checked={node.completed}
              onChange={(e) => toggleCompleted(node.id, e)}
              className="h-4 w-4 accent-cyan-500 cursor-pointer rounded-sm border-zinc-700 bg-zinc-900/50 focus:ring-purple-500/30 focus:ring-offset-0 transition-all hover:scale-110"
            />
          </div>

          {/* Title */}
          <span
            className={`truncate text-sm tracking-tight transition-all duration-300 ${node.completed
              ? "text-zinc-500 line-through decoration-zinc-700/50"
              : "text-zinc-200"
              }`}
            title={node.title}
          >
            {node.title}
          </span>

          {/* Actions Column */}
          <div className="flex items-center justify-end pr-2 md:pr-4">
            <div className="flex items-center gap-3 md:gap-4">
              {node.resources?.map((r: { type: string; url?: string }, index: number) => {
                if (r.type === "ARTICLE" && r.url) {
                  return (
                    <a key={index} href={r.url} target="_blank" rel="noopener noreferrer" title="Read Article" className="hover:scale-110 transition-transform">
                      <FileText className="h-4 w-4 text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer" />
                    </a>
                  )
                }
                if (r.type === "VIDEO" && r.url) {
                  return (
                    <a key={index} href={r.url} target="_blank" rel="noopener noreferrer" title="Watch Video" className="hover:scale-110 transition-transform">
                      <PlayCircle className="h-4 w-4 text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer" />
                    </a>
                  )
                }
                return null
              })}

              <button onClick={handleChatJump} title={`Chat about ${node.title}`} className="hover:scale-110 transition-transform">
                <Bot className="h-4 w-4 text-zinc-500 hover:text-cyan-400 transition-colors" />
              </button>
            </div>

            {/* Separator before add note */}
            <div className="w-px h-3.5 bg-zinc-700 ml-3 mr-3 md:ml-4 md:mr-4 hidden sm:block" />

            <button title="Add Note" className="hidden sm:block hover:scale-110 transition-transform">
              <Plus className="h-4 w-4 text-zinc-600 hover:text-zinc-300 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* RECURSIVE CHILDREN RENDERING WITH FRAMER MOTION */}
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden flex flex-col"
          >
            {node.children!.map((child: TopicNode) => (
              <TopicRow
                key={child.id}
                node={child}
                depth={depth + 1}
                toggleCompleted={toggleCompleted}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TopicRow