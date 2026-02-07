import { useState } from "react"
import TopicRow from "../components/TopicRow"
import { mockTopicTree } from "../shared/mockData"
import type { TopicNode } from "../shared/TopicNode"
import Navbar from "./Navbar"

const Dashboard = () => {
  const [topics, setTopics] = useState<TopicNode[]>(mockTopicTree)

  const toggleCompleted = (id: string) => {
    const update = (nodes: TopicNode[]): TopicNode[] =>
      nodes.map(n => {
        if (n.id === id) {
          return { ...n, completed: !n.completed }
        }
        if (n.children) {
          return { ...n, children: update(n.children) }
        }
        return n
      })

    setTopics(update(topics))
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4">
      <div className="mx-auto max-w-7xl flex flex-col gap-4">

        {/* Navbar Card */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>

        {/* Main Dashboard Card */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220] p-6 space-y-6">

          {/* Header (calmer hierarchy) */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-white/60 text-sm">
              Track your learning progress
            </p>
          </div>

          {/* Topics Card (reduced visual weight) */}
          <div className="rounded-lg border border-white/5 bg-[#020617] p-4">
            {topics.map(node => (
              <TopicRow
                key={node.id}
                node={node}
                toggleCompleted={toggleCompleted}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
