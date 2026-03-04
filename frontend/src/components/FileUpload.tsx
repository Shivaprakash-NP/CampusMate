"use client"

import React, { useState, useRef, useCallback } from "react"
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
} from "lucide-react"
import Navbar from "../components/Navbar"

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error"

// Define a type for each individual upload task
type FileTask = {
  id: string
  file: File
  progress: number
  status: UploadStatus
}

export default function FileUpload() {
  const [tasks, setTasks] = useState<FileTask[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Helper to update a specific task in the array
  const updateTask = useCallback((id: string, updates: Partial<FileTask>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
  }, [])

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const uploadFile = useCallback(async (selectedFile: File) => {
    // Create a unique ID for this upload session
    const taskId = Math.random().toString(36).substring(2, 11)
    
    const newTask: FileTask = {
      id: taskId,
      file: selectedFile,
      progress: 0,
      status: "uploading",
    }

    // Add to the list
    setTasks((prev) => [newTask, ...prev])

    const form = new FormData()
    form.append("file", selectedFile)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          updateTask(taskId, { progress: pct })
          
          if (pct === 100) {
            updateTask(taskId, { status: "processing" })
          }
        }
      })

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Status ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.open("POST", "/api/upload") 
        xhr.withCredentials = true
        xhr.send(form)
      })

      updateTask(taskId, { status: "success", progress: 100 })
    } catch (err) {
      console.error("Upload Error:", err)
      updateTask(taskId, { status: "error" })
    }
  }, [updateTask])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return
    // Allow multiple selection if needed, otherwise just take the first
    Array.from(selectedFiles).forEach(file => uploadFile(file))
    // Reset input so the same file can be uploaded again if deleted
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles) {
        Array.from(droppedFiles).forEach(file => uploadFile(file))
      }
    },
    [uploadFile]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col selection:bg-cyan-500/30">
      
      {/* Sticky Edge-to-Edge Navbar */}
      <div className="sticky top-0 z-40 w-full">
        <Navbar />
      </div>
      
      {/* Centered Focused Layout */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
            <FileUp className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
              Upload Syllabus
            </h1>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Drag and drop or browse to upload your study materials for processing.
            </p>
          </div>
        </div>

        {/* Upload Container */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-2 sm:p-3 shadow-sm backdrop-blur-sm">
          
          {/* Drop Zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 transition-all duration-200 ${
              isDragging
                ? "border-cyan-500/50 bg-cyan-500/5"
                : "border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple 
              className="sr-only"
              onChange={handleFileChange}
            />

            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 ${
                isDragging 
                  ? "bg-cyan-500/20 text-cyan-400" 
                  : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300"
              }`}>
              <Upload className="h-5 w-5" />
            </div>
            
            <p className="mb-1 text-sm font-medium text-zinc-200 text-center transition-colors group-hover:text-zinc-100">
              {isDragging ? "Drop your files here" : "Click to browse or drag and drop"}
            </p>
            <p className="text-xs text-zinc-500">
              PDF, DOCX, TXT, PPT, and more
            </p>
          </div>

          {/* File List Section */}
          {tasks.length > 0 && (
            <div className="mt-4 space-y-2.5 max-h-[400px] overflow-y-auto px-1 pb-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors hover:bg-zinc-900/60"
                >
                  <div className="flex items-start gap-4">
                    
                    {/* File Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/30">
                      <FileText className="h-4 w-4 text-zinc-400" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {task.file.name}
                        </p>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                          disabled={task.status === "uploading" || task.status === "processing"}
                          title="Remove file"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-500 font-medium">
                        {formatSize(task.file.size)}
                      </p>

                      {/* Progress Bar Area */}
                      {(task.status === "uploading" || task.status === "processing") && (
                        <div className="mt-3.5">
                          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 animate-spin text-cyan-500" />
                              {task.status === "processing" ? "Processing..." : "Uploading..."}
                            </span>
                            <span className="tabular-nums text-zinc-500">{task.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80 shadow-inner">
                            <div 
                              className={`h-full bg-cyan-500 rounded-full transition-all duration-300 ease-out ${task.status === "processing" ? "animate-pulse opacity-80" : ""}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status Messages */}
                      {task.status === "success" && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Upload complete
                        </div>
                      )}
                      {task.status === "error" && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Upload failed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] font-medium text-zinc-500 tracking-wide">
          Files are processed securely and stored for your study sessions.
        </p>
      </main>
    </div>
  )
}