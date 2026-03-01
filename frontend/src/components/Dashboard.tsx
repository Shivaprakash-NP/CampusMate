import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Added for navigation
import { Upload } from "lucide-react" // Added for the icon
import TopicRow from "../components/TopicRow"
import type { TopicNode } from "../shared/TopicNode"
import Navbar from "./Navbar"
import { OverallProgress } from "./ProgressBar"
import confetti from "canvas-confetti"

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
  const navigate = useNavigate() // Initialize navigation
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

  const toggleCompleted = async (id: string,e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
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

    // 🌟 3. Fire the Star Burst Animation if they are checking the box!
    if (isChecking && e) {
      const target = e.target as Element;
      const rect = target.getBoundingClientRect();
      
      // Calculate coordinates relative to the viewport (canvas-confetti uses 0 to 1 scale)
      const x = (rect.left + (rect.width / 2)) / window.innerWidth;
      const y = (rect.top + (rect.height / 2)) / window.innerHeight;

          confetti({
          particleCount: 15, // Keeps it subtle
        spread: 360,       // Explodes in a full circle around the origin
        origin: { x, y },
        colors: ['#00BFFF', '#87CEFA', '#38BDF8', '#FFFFFF'], // Matches your cyan/blue UI + white
        shapes: ['star', 'circle'], // Dropped 'square' for a cleaner "sparkle" look, but you can add it back!
        ticks: 50,         // Disappears relatively quickly
        gravity: 0.8,      // Slightly lower gravity so they "float" a bit instead of dropping fast
        decay: 0.9,
        startVelocity: 12, // Much lower velocity so it stays right near the checkbox
        scalar: 0.8,       // Keeps the particles small
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

  return (
    // REFINED: p-2 on mobile, p-4 on md screens
    <div className="min-h-screen bg-[#0b1a22] p-2 md:p-4">
      <div className="mx-auto max-w-7xl flex flex-col gap-3 md:gap-4">
        
        {/* Navbar Wrapper */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>
        
        {/* Main Content Wrapper - REFINED: p-4 on mobile, p-6 on md screens */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220] p-4 md:p-6 space-y-4 md:space-y-6">
          
          {/* HEADER SECTION WITH UPLOAD BUTTON */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-white/60 text-xs md:text-sm">
                Track your learning progress
              </p>
            </div>
          <button 
              onClick={() => navigate("/fileupload")}
              className="
                flex items-center gap-2 
                bg-white/5 border border-white/10 
                text-white/70 hover:text-white hover:bg-white/10 
                px-4 py-2 rounded-lg font-medium 
                transition-all duration-200 text-sm md:text-base
              "
            >
              <Upload className="h-4 w-4 md:h-5 md:w-5 opacity-70" />
              Upload Syllabus
            </button>
          </div>
          
          <OverallProgress
            percentage={progressData.percentage}
            completed={progressData.completed}
            total={progressData.total}
          />
          
          {/* Topics Wrapper - REFINED: p-2 on mobile, p-4 on md screens */}
          <div className="rounded-lg border border-white/5 bg-[#14232d] p-2 md:p-4">
            {isLoading ? (
              <div className="text-white/50 text-center py-4 text-sm md:text-base">Loading syllabus...</div>
            ) : topics.length === 0 ? (
               <div className="text-white/50 text-center py-8 text-sm md:text-base">No subjects uploaded yet. Go upload a syllabus!</div>
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