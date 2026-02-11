// shared/progress.ts
import type { TopicNode } from "./TopicNode"

// getting progress (unchanged)
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
