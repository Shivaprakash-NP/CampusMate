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
import Navbar from "../Navbar"

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setOutput(null)
    setStatus("idle")
    setProgress(0)
  }

  const uploadFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setStatus("uploading")
    setProgress(0)
    setOutput(null)

    const form = new FormData()
    form.append("file", selectedFile)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setProgress(pct)
          
          if (pct === 100) {
            setStatus("processing")
          }
        }
      })

      const result = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText)
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.open("POST", "http://localhost:8080/api/upload")
        xhr.withCredentials = true
        xhr.send(form)
      })

      setOutput(result)
      setStatus("success")
    } catch (err) {
      console.error("Upload Error:", err)
      setStatus("error")
      setOutput("Upload failed. Please try again.")
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    uploadFile(selectedFile)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        uploadFile(droppedFile)
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
    // Background: matched to Dashboard's layout padding structure
    <div className="min-h-screen bg-[#020617] p-4 font-sans">
      <div className="mx-auto max-w-7xl flex flex-col gap-4">
        
        {/* Navbar Card - Now aligned identically to Dashboard */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>
        
        {/* Centered Upload Content */}
        <div className="flex w-full flex-col items-center justify-center pt-16 pb-12">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#38bdf8]/10 ring-1 ring-[#38bdf8]/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                <FileUp className="h-7 w-7 text-[#38bdf8]" />
              </div>
              {/* Text: #ffffff (Readability) */}
              <h1 className="text-balance text-2xl font-bold tracking-tight text-[#ffffff]">
                Upload Your Files
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Drag and drop or browse to upload your study materials
              </p>
            </div>

            {/* Upload Card - Using a slightly lighter dark tone for elevation */}
            <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 shadow-2xl shadow-black/50">
              
              {/* Drop Zone */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload file drop zone"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-14 transition-all duration-200 ${
                  isDragging
                    ? "border-[#38bdf8] bg-[#38bdf8]/10"
                    : "border-slate-700 hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/5"
                } ${(status === "uploading" || status === "processing") ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="Choose file to upload"
                />

                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isDragging
                      ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                      : "bg-slate-800 text-slate-400 group-hover:bg-[#38bdf8]/10 group-hover:text-[#38bdf8]"
                  }`}
                >
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mb-1 text-sm font-medium text-[#ffffff]">
                  {isDragging ? "Drop your file here" : "Click to browse or drag and drop"}
                </p>
                <p className="text-xs text-slate-400">
                  PDF, DOCX, TXT, PPT, and more
                </p>
              </div>

              {/* File Info + Progress */}
              {file && (
                <div className="mt-5 rounded-lg border border-slate-800 bg-[#020617]/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#38bdf8]/10">
                      <FileText className="h-5 w-5 text-[#38bdf8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[#ffffff]">
                          {file.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            resetState()
                          }}
                          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-[#ffffff]"
                          aria-label="Remove file"
                          disabled={status === "uploading" || status === "processing"}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatSize(file.size)}
                      </p>

                      {/* Combined Progress bar & Processing state */}
                      {(status === "uploading" || status === "processing") && (
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 animate-spin text-[#22d3ee]" />
                              {status === "processing" ? "Processing file..." : "Uploading..."}
                            </span>
                            <span>{progress}%</span>
                          </div>
                          
                          {/* Custom Inline Progress Bar matching #22d3ee (Focus / activity) */}
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div 
                              className={`h-full bg-[#22d3ee] transition-all duration-300 ${
                                status === "processing" ? "animate-pulse opacity-70" : ""
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Success state - highlighting with secondary accent or emerald */}
                      {status === "success" && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#38bdf8]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Upload complete
                        </div>
                      )}

                      {/* Error state */}
                      {status === "error" && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Upload failed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Output / Response */}
              {output && status === "success" && (
                <div className="mt-5 rounded-lg border border-slate-800 bg-[#020617] p-5 shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Decorative glow: #c084fc applied to the heading */}
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#c084fc]">
                    Analysis Response
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {output}
                  </p>
                </div>
              )}

              {/* Actions */}
              {(status === "success" || status === "error") && (
                <div className="mt-5 flex justify-end animate-in fade-in duration-500">
                  <button
                    onClick={resetState}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-[#ffffff] transition-colors hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/10 hover:text-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Another
                  </button>
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Files are processed securely and stored for your study sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}