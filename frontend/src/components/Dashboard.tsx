import { useState, useEffect } from "react"
import TopicRow from "../components/TopicRow"
import type { TopicNode } from "../shared/TopicNode"
import Navbar from "./Navbar"
import { OverallProgress } from "./ProgressBar"

// Helper function to map backend 'subTopics' to frontend 'children'
const mapBackendToFrontend = (backendTopics: any[]): TopicNode[] => {
  if (!backendTopics) return [];
  return backendTopics.map((topic) => ({
    id: topic.id.toString(), 
    title: topic.title,
    completed: topic.completed || false,
    resources: topic.resources || [],
    children: topic.subTopics ? mapBackendToFrontend(topic.subTopics) : [],
  }))
}

const Dashboard = () => {
  const [topics, setTopics] = useState<TopicNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // NEW: State to track the active syllabus ID and its progress from the backend
  const [activeSyllabusId, setActiveSyllabusId] = useState<number | null>(null)
  const [progressData, setProgressData] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  })

  // 1. Fetch Data
  const fetchDashboardData = async () => {
    try {
      // Fetch the summary list which contains progress metrics
      const listResponse = await fetch("/api/syllabus")
      if (!listResponse.ok) throw new Error("Failed to fetch syllabus list")
      
      const listData = await listResponse.json()
      
      if (!listData || listData.length === 0) {
        setIsLoading(false)
        return
      }

      // Grab the active syllabus (first one for now)
      const activeSyllabus = listData[0]
      const syllabusId = activeSyllabus.id
      
      setActiveSyllabusId(syllabusId)
      
      // Update progress state directly from the backend response
      setProgressData({
        completed: activeSyllabus.completedTopics,
        total: activeSyllabus.totalTopics,
        percentage: activeSyllabus.progressPercentage
      })

      // Fetch the full details
      const detailResponse = await fetch(`/api/syllabus/${syllabusId}`)
      if (!detailResponse.ok) throw new Error(`Failed to fetch details`)
      
      const detailData = await detailResponse.json()
      
      // Filter out the duplicates
      const rawTopics = detailData.topics || [];
      const subTopicIds = new Set();
      rawTopics.forEach((topic: any) => {
        if (topic.subTopics) {
          topic.subTopics.forEach((sub: any) => subTopicIds.add(sub.id));
        }
      });
      const trueRootTopics = rawTopics.filter((topic: any) => !subTopicIds.has(topic.id));
      
      const mappedTopics = mapBackendToFrontend(trueRootTopics)
      setTopics(mappedTopics)

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])
// 2. Toggle completion and sync with backend
  const toggleCompleted = async (id: string) => {
    let isChecking = true; // We need to know if we are checking or unchecking

    // Optimistic UI Update: Snap the checkbox immediately
    const update = (nodes: TopicNode[]): TopicNode[] =>
      nodes.map(n => {
        if (n.id === id) {
          isChecking = !n.completed; // Capture the new state
          return { ...n, completed: !n.completed }
        }
        if (n.children && n.children.length > 0) {
          return { ...n, children: update(n.children) }
        }
        return n
      })
      
    setTopics(update(topics))

    // Optimistically update the completed count so the "X / Y" text updates instantly
    setProgressData(prev => ({
      ...prev,
      completed: isChecking ? prev.completed + 1 : prev.completed - 1
    }))

    // Send the PATCH request to the backend
    try {
      const response = await fetch(`/api/topics/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error("Failed to update topic status")
      }

      // Grab the exact progress percentage returned by the backend 
      const data = await response.json()
      
      if (data && data.progress !== undefined) {
        setProgressData(prev => ({
          ...prev,
          percentage: data.progress // Update the bar's width based on the database truth 
        }))
      }

    } catch (error) {
      console.error("Error toggling completion:", error)
      // If it fails, revert the optimistic update
      setProgressData(prev => ({
        ...prev,
        completed: isChecking ? prev.completed - 1 : prev.completed + 1
      }))
    }
  }
  return (
    <div className="min-h-screen bg-[#0b1a22] p-4">
      <div className="mx-auto max-w-7xl flex flex-col gap-4">
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>
        
        <div className="rounded-xl border border-white/10 bg-[#0b1220] p-6 space-y-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-white/60 text-sm">
              Track your learning progress
            </p>
          </div>
          
          {/* Feed the backend progress state directly into the progress bar */}
          <OverallProgress
            percentage={progressData.percentage}
            completed={progressData.completed}
            total={progressData.total}
          />
          
          <div className="rounded-lg border border-white/5 bg-[#14232d] p-4">
            {isLoading ? (
              <div className="text-white/50 text-center py-4">Loading syllabus...</div>
            ) : (
              topics.map(node => (
                <TopicRow
                  key={node.id}
                  node={node}
                  toggleCompleted={toggleCompleted}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard