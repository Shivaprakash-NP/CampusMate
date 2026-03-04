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
    <div className="min-h-screen text-white bg-gradient-to-b from-[#0f343f] via-[#0b1a22] to-[#0b1220] p-2 md:p-4 font-sans">
      <div className="mx-auto max-w-7xl flex flex-col gap-3 md:gap-4">
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>
        
        <div className="flex w-full flex-col items-center justify-center pt-8 md:pt-16 pb-8 md:pb-12 px-2">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-6 md:mb-8 text-center">
              <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-transparent ring-1 ring-[#38bdf8]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] backdrop-blur-sm">
                <FileUp className="h-6 w-6 md:h-7 md:w-7 text-[#38bdf8]" />
              </div>
              <h1 className="text-balance text-xl md:text-2xl font-bold tracking-tight text-[#ffffff]">
                Upload Your Files
              </h1>
              <p className="mt-1 md:mt-2 text-xs md:text-sm text-slate-400">
                Drag and drop or browse to upload your study materials
              </p>
            </div>

            {/* Upload Card */}
            <div className="rounded-xl border border-white/10 bg-[#0b1220]/60 backdrop-blur-md p-4 md:p-6 shadow-2xl shadow-black/50">
              
              {/* Drop Zone */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 md:px-6 md:py-14 transition-all duration-200 ${
                  isDragging
                    ? "border-[#38bdf8] bg-[#38bdf8]/10"
                    : "border-slate-700 hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/5"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple // Added multiple support
                  className="sr-only"
                  onChange={handleFileChange}
                />

                <div className={`mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full transition-colors ${
                    isDragging ? "bg-[#38bdf8]/20 text-[#38bdf8]" : "bg-slate-800 text-slate-400 group-hover:bg-[#38bdf8]/10 group-hover:text-[#38bdf8]"
                  }`}>
                  <Upload className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <p className="mb-1 text-xs md:text-sm font-medium text-[#ffffff] text-center">
                  {isDragging ? "Drop your files here" : "Click to browse or drag and drop"}
                </p>
                <p className="text-[10px] md:text-xs text-slate-400">
                  PDF, DOCX, TXT, PPT, and more
                </p>
              </div>

              {/* File List Section */}
              <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-800 bg-[#020617]/50 p-3 md:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#38bdf8]/10">
                        <FileText className="h-4 w-4 md:h-5 md:w-5 text-[#38bdf8]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs md:text-sm font-medium text-[#ffffff]">
                            {task.file.name}
                          </p>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-[#ffffff]"
                            disabled={task.status === "uploading" || task.status === "processing"}
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[10px] md:text-xs text-slate-400">
                          {formatSize(task.file.size)}
                        </p>

                        {/* Progress Bar Area */}
                        {(task.status === "uploading" || task.status === "processing") && (
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-[10px] md:text-xs text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin text-[#22d3ee]" />
                                {task.status === "processing" ? "Processing..." : "Uploading..."}
                              </span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                              <div 
                                className={`h-full bg-[#22d3ee] transition-all duration-300 ${task.status === "processing" ? "animate-pulse opacity-70" : ""}`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Status Messages */}
                        {task.status === "success" && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-[#38bdf8]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Upload complete
                          </div>
                        )}
                        {task.status === "error" && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Upload failed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 md:mt-4 text-center text-[10px] md:text-xs text-slate-500">
              Files are processed securely and stored for your study sessions
              
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}