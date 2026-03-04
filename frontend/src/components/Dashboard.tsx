import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, FileText } from "lucide-react"
import { motion } from "framer-motion"
import TopicRow from "../components/TopicRow"
import type { TopicNode } from "../shared/TopicNode"
import Navbar from "./Navbar"
import { OverallProgress } from "./ProgressBar"
import confetti from "canvas-confetti"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"

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
  const navigate = useNavigate()

  // --- STATE LOGIC UNTOUCHED ---
  const [topics, setTopics] = useState<TopicNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [progressData, setProgressData] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  })

  const fetchDashboardData = async () => {
    try {
      const listResponse = await fetch("/api/syllabus")
      if (!listResponse.ok) throw new Error("Failed to fetch syllabus list")

      const listData = await listResponse.json()

      if (!listData || listData.length === 0) {
        setIsLoading(false)
        return
      }

      const totalCompleted = listData.reduce((acc: number, s: any) => acc + s.completedTopics, 0)
      const totalAll = listData.reduce((acc: number, s: any) => acc + s.totalTopics, 0)
      const totalPct = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0

      setProgressData({
        completed: totalCompleted,
        total: totalAll,
        percentage: totalPct
      })

      const allSyllabusesTree = await Promise.all(
        listData.map(async (syllabus: any) => {
          const detailResponse = await fetch(`/api/syllabus/${syllabus.id}`)
          if (!detailResponse.ok) throw new Error(`Failed to fetch details`)

          const detailData = await detailResponse.json()

          const rawTopics = detailData.topics || [];
          const subTopicIds = new Set();
          rawTopics.forEach((topic: any) => {
            if (topic.subTopics) {
              topic.subTopics.forEach((sub: any) => subTopicIds.add(sub.id));
            }
          });
          const trueRootTopics = rawTopics.filter((topic: any) => !subTopicIds.has(topic.id));

          return {
            id: `syllabus-${detailData.id}`,
            title: detailData.title,
            completed: false,
            resources: [],
            children: mapBackendToFrontend(trueRootTopics)
          }
        })
      )

      setTopics(allSyllabusesTree)

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const toggleCompleted = async (id: string, e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    let isChecking = true;

    const update = (nodes: TopicNode[]): TopicNode[] =>
      nodes.map(n => {
        if (n.id === id) {
          isChecking = !n.completed;
          return { ...n, completed: !n.completed }
        }
        if (n.children && n.children.length > 0) {
          return { ...n, children: update(n.children) }
        }
        return n
      })

    setTopics(update(topics))

    setProgressData(prev => ({
      ...prev,
      completed: isChecking ? prev.completed + 1 : prev.completed - 1
    }))

    if (isChecking && e) {
      const target = e.target as Element;
      const rect = target.getBoundingClientRect();

      const x = (rect.left + (rect.width / 2)) / window.innerWidth;
      const y = (rect.top + (rect.height / 2)) / window.innerHeight;

      confetti({
        particleCount: 15,
        spread: 360,
        origin: { x, y },
        colors: ['#06B6D4', '#67E8F9', '#0891B2', '#FFFFFF'], // Updated to match purple accent
        shapes: ['star', 'circle'],
        ticks: 50,
        gravity: 0.8,
        decay: 0.9,
        startVelocity: 12,
        scalar: 0.8,
        zIndex: 9999
      });
    }

    try {
      const response = await fetch(`/api/topics/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to update topic status")

      const summaryRes = await fetch("/api/syllabus")
      const summaryData = await summaryRes.json()

      const newTotalCompleted = summaryData.reduce((acc: number, s: any) => acc + s.completedTopics, 0)
      const newTotalAll = summaryData.reduce((acc: number, s: any) => acc + s.totalTopics, 0)
      const newTotalPct = newTotalAll > 0 ? Math.round((newTotalCompleted / newTotalAll) * 100) : 0

      setProgressData({
        completed: newTotalCompleted,
        total: newTotalAll,
        percentage: newTotalPct
      })

    } catch (error) {
      console.error("Error toggling completion:", error)
      setProgressData(prev => ({
        ...prev,
        completed: isChecking ? prev.completed - 1 : prev.completed + 1
      }))
    }
  }
  // -----------------------------

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30 flex flex-col">

      {/* Sticky Navbar Wrapper - Removed internal styling since Navbar handles its own borders/blur */}
      <div className="sticky top-0 z-40 w-full">
        <Navbar />
      </div>

      {/* High-Density Main Layout */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10">

        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-400 max-w-md">
              Track your learning progress and manage your study materials.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/fileupload")}
            className="h-9 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-all w-full sm:w-auto shadow-sm"
          >
            <Upload className="h-4 w-4 " />
            Upload Syllabus
          </Button>
        </motion.div>

        {/* TOPICS LIST SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          {/* Subtle Section Heading */}
          <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Active Syllabuses
          </h2>

          {isLoading ? (
            /* Premium Skeleton Loader */
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 w-full rounded-lg bg-zinc-900/40 border border-zinc-800/40 animate-pulse"
                />
              ))}
            </div>
          ) : topics.length === 0 ? (
            /* Meaningful Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4 shadow-sm">
                <Upload className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-1">No subjects uploaded yet</h3>
              <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">
                Get started by uploading your first syllabus document to automatically generate your study plan.
              </p>
              <Button
                onClick={() => navigate("/fileupload")}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all"
              >
                Upload your first Syllabus
              </Button>
            </div>
          ) : (
            /* High-Density Table/List Wrapper */
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm divide-y divide-zinc-800/50">
              {topics.map((node) => (
                <div
                  key={node.id}
                  className="group transition-colors duration-200 hover:bg-zinc-800/40"
                >
                  <TopicRow
                    node={node}
                    toggleCompleted={toggleCompleted}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </main>
    </div>
  )
}

export default Dashboard