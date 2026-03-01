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
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`))
          }
        }
        xhr.onerror = () => reject(new Error("Network error"))
        // CRITICAL FIX: Changed to relative path to use your Vite Proxy and avoid CORS!
        xhr.open("POST", "/api/upload") 
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
    // REFINED: p-2 on mobile, p-4 on md screens
<div className="min-h-screen text-white bg-gradient-to-b from-[#0f343f] via-[#0b1a22] to-[#0b1220] p-2 md:p-4 font-sans">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 md:gap-4">
        
        {/* Navbar Card */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>
        
        {/* Centered Upload Content - REFINED: pt-8 on mobile, pt-16 on md screens */}
        <div className="flex w-full flex-col items-center justify-center pt-8 md:pt-16 pb-8 md:pb-12 px-2">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-6 md:mb-8 text-center">
              {/* REFINED: Smaller icon box on mobile */}
<div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-transparent ring-1 ring-[#38bdf8]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] backdrop-blur-sm">                <FileUp className="h-6 w-6 md:h-7 md:w-7 text-[#38bdf8]" />
              </div>
              {/* REFINED: Scaled text sizes */}
              <h1 className="text-balance text-xl md:text-2xl font-bold tracking-tight text-[#ffffff]">
                Upload Your Files
              </h1>
              <p className="mt-1 md:mt-2 text-xs md:text-sm text-slate-400">
                Drag and drop or browse to upload your study materials
              </p>
            </div>

            {/* Upload Card - REFINED: p-4 on mobile, p-6 on md screens */}
            <div className="rounded-xl border border-white/10 bg-[#0b1220]/60 backdrop-blur-md p-4 md:p-6 shadow-2xl shadow-black/50">
              
              {/* Drop Zone - REFINED: py-10 on mobile to save vertical space */}
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
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 md:px-6 md:py-14 transition-all duration-200 ${
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
                  className={`mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full transition-colors ${
                    isDragging
                      ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                      : "bg-slate-800 text-slate-400 group-hover:bg-[#38bdf8]/10 group-hover:text-[#38bdf8]"
                  }`}
                >
                  <Upload className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <p className="mb-1 text-xs md:text-sm font-medium text-[#ffffff] text-center">
                  {isDragging ? "Drop your file here" : "Click to browse or drag and drop"}
                </p>
                <p className="text-[10px] md:text-xs text-slate-400">
                  PDF, DOCX, TXT, PPT, and more
                </p>
              </div>

              {/* File Info + Progress */}
              {file && (
                <div className="mt-4 md:mt-5 rounded-lg border border-slate-800 bg-[#020617]/50 p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#38bdf8]/10">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 text-[#38bdf8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs md:text-sm font-medium text-[#ffffff]">
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
                          <X className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[10px] md:text-xs text-slate-400">
                        {formatSize(file.size)}
                      </p>

                      {/* Combined Progress bar & Processing state */}
                      {(status === "uploading" || status === "processing") && (
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-[10px] md:text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 animate-spin text-[#22d3ee]" />
                              {status === "processing" ? "Processing..." : "Uploading..."}
                            </span>
                            <span>{progress}%</span>
                          </div>
                          
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

                      {/* Success state */}
                      {status === "success" && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-[#38bdf8]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Upload complete
                        </div>
                      )}

                      {/* Error state */}
                      {status === "error" && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-red-400">
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
                <div className="mt-4 md:mt-5 rounded-lg border border-slate-800 bg-[#020617] p-4 md:p-5 shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="mb-2 md:mb-3 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#c084fc]">
                    Analysis Response
                  </h3>
                  <p className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed text-slate-300 overflow-y-auto max-h-32 md:max-h-full">
                    {output}
                  </p>
                </div>
              )}

              {/* Actions */}
              {(status === "success" || status === "error") && (
                <div className="mt-4 md:mt-5 flex justify-end animate-in fade-in duration-500">
                  <button
                    onClick={resetState}
                    className="inline-flex h-8 md:h-9 items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-[#ffffff] transition-colors hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/10 hover:text-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  >
                    <Upload className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Upload Another
                  </button>
                </div>
              )}
            </div>

            <p className="mt-3 md:mt-4 text-center text-[10px] md:text-xs text-slate-500">
              Files are processed securely and stored for your study sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}