// StudyPlanUpload.tsx
"use client"

import React, { useState } from "react"
import { 
  Calendar, 
  UploadCloud, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText,
  BookOpen,
  Loader2
} from "lucide-react"

// Shadcn UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// --- Types ---
interface TestDetail {
  id: string
  subjectName: string
  portions: string
  file: File | null
  pyqs: File[] 
}

interface StudyPlanUploadProps {
  planTitle: string
  onComplete: (data: any) => void
}

export default function StudyPlanUpload({ planTitle, onComplete }: StudyPlanUploadProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false) 
  
  // Global Study Plan Details
  const [planStartDate, setPlanStartDate] = useState("")
  const [planEndDate, setPlanEndDate] = useState("")
  const [numTests, setNumTests] = useState<number | "">("")
  
  // Per-Test Details Array
  const [tests, setTests] = useState<TestDetail[]>([])

  // --- Handlers ---
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!planStartDate || !planEndDate || !numTests || numTests <= 0) return

    if (tests.length !== numTests) {
      const initialTests: TestDetail[] = Array.from({ length: Number(numTests) }).map((_, i) => ({
        id: `test-${Date.now()}-${i}`,
        subjectName: "",
        portions: "",
        file: null,
        pyqs: [], 
      }))
      setTests(initialTests)
    }
    setStep(2)
  }

  const handleTestChange = (index: number, field: keyof Omit<TestDetail, 'file' | 'pyqs'>, value: string) => {
    const updatedTests = [...tests]
    updatedTests[index] = { ...updatedTests[index], [field]: value }
    setTests(updatedTests)
  }

  const handleFileChange = (index: number, file: File | null) => {
    const updatedTests = [...tests]
    updatedTests[index] = { ...updatedTests[index], file }
    setTests(updatedTests)
  }

  const handlePyqsChange = (index: number, fileList: FileList | null) => {
    if (!fileList) return
    const updatedTests = [...tests]
    updatedTests[index] = { ...updatedTests[index], pyqs: Array.from(fileList) }
    setTests(updatedTests)
  }

  // --- Backend Integration ---
  const handleSubmitFinal = async () => {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()

      formData.append('planTitle', planTitle)
      formData.append('startDate', planStartDate)
      formData.append('endDate', planEndDate)

      tests.forEach((test, index) => {
        const portionParts = test.portions.split('-')
        const endSequenceOrder = portionParts.length > 1 ? portionParts[1].trim() : test.portions.trim()
        
        formData.append(`portions[${index}].title`, test.subjectName)
        formData.append(`portions[${index}].endSequenceOrder`, endSequenceOrder || '0')

        if (test.file) {
          formData.append(`portions[${index}].syllabusFile`, test.file)
        }

        if (test.pyqs && test.pyqs.length > 0) {
          test.pyqs.forEach((pyqFile) => {
            formData.append(`portions[${index}].pyq`, pyqFile)
          })
        }
      })

      let token = ""
      if (typeof window !== 'undefined') {
        token = localStorage.getItem("accessToken") || ""
        if (!token) {
          const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/)
          if (match) token = match[1]
        }
      }

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('http://localhost:8080/api/schedule/generate', {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`)
      }

      const data = await response.json()
      console.log("Backend Schedule Data:", data)
      
      onComplete(data)

    } catch (error) {
      console.error('Error submitting to backend:', error)
      alert('Failed to generate plan. Please check your connection or server logs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#09090b] font-sans text-zinc-100 flex flex-col py-8 px-4 sm:px-6 lg:px-8 selection:bg-zinc-800">
      
      <div className="max-w-[900px] w-full mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex items-center gap-4">
             <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                Configuring
             </span>
             <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
               {planTitle}
             </h1>
          </div>
          <p className="text-[15px] text-zinc-400">
            {step === 1 
              ? "Set up your overall study timeline and test quantity." 
              : "Upload syllabus files and define portions for each specific test."}
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mt-6 text-[11px] font-bold uppercase tracking-widest">
            <span className={step >= 1 ? "text-zinc-100" : "text-zinc-600"}>1. Setup</span>
            <div className={`h-[1px] w-12 transition-colors duration-300 ${step >= 2 ? "bg-zinc-300" : "bg-zinc-800"}`} />
            <span className={step >= 2 ? "text-zinc-100" : "text-zinc-600"}>2. Syllabus & Details</span>
          </div>
          
          <div className="h-px w-full bg-zinc-800/60 mt-4" />
        </div>

        <div className="relative">
            
          {/* STEP 1: Global Setup */}
          {step === 1 && (
            <form
              onSubmit={handleNextStep}
              className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
            >
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-zinc-200">Study Plan Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-500" />
                    <Input
                      type="date"
                      required
                      value={planStartDate}
                      onChange={(e) => setPlanStartDate(e.target.value)}
                      className="pl-10 h-12 rounded-lg bg-[#09090b] border-zinc-800/80 text-zinc-200 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all [color-scheme:dark] shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-zinc-200">Study Plan End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-500" />
                    <Input
                      type="date"
                      required
                      value={planEndDate}
                      onChange={(e) => setPlanEndDate(e.target.value)}
                      className="pl-10 h-12 rounded-lg bg-[#09090b] border-zinc-800/80 text-zinc-200 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all [color-scheme:dark] shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-zinc-200">Number of Tests</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-500" />
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      required
                      placeholder="e.g. 5"
                      value={numTests}
                      onChange={(e) => setNumTests(parseInt(e.target.value) || "")}
                      className="pl-10 h-12 rounded-lg bg-[#09090b] border-zinc-800/80 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!planStartDate || !planEndDate || !numTests}
                  className="h-11 bg-zinc-300 hover:bg-zinc-200 text-zinc-950 font-semibold px-6 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-zinc-300"
                >
                  Continue to Details
                  <ArrowRight className="ml-2 h-[18px] w-[18px]" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Per-Test Uploads & Portions */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
              <div className="flex flex-col gap-6">
                {tests.map((test, index) => (
                  <div 
                    key={test.id} 
                    className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 shadow-sm backdrop-blur-sm space-y-6 transition-colors hover:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-[12px] font-bold text-zinc-300 shadow-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200">Test Configuration</h3>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-1">
                      <div className="space-y-3">
                        <Label className="text-[13px] font-medium text-zinc-300">Subject / Test Name</Label>
                        <Input
                          placeholder="e.g. Operating Systems"
                          value={test.subjectName}
                          onChange={(e) => handleTestChange(index, "subjectName", e.target.value)}
                          className="h-11 bg-[#09090b] border-zinc-800/80 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-all rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label className="text-[13px] font-medium text-zinc-300">Syllabus Portions</Label>
                        <Input
                          placeholder="e.g. Unit 1 - 4"
                          value={test.portions}
                          onChange={(e) => handleTestChange(index, "portions", e.target.value)}
                          className="h-11 bg-[#09090b] border-zinc-800/80 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-all rounded-lg"
                        />
                      </div>

                      <div className="space-y-3 flex flex-col">
                        <Label className="text-[13px] font-medium text-zinc-300">Upload Syllabus File</Label>
                        <label 
                          htmlFor={`file-${test.id}`}
                          className={`flex-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer group h-11
                            ${test.file ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-800 hover:border-zinc-600 bg-[#09090b] hover:bg-zinc-900/50'}
                          `}
                        >
                          <input
                            id={`file-${test.id}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.png,.jpg"
                          />
                          {test.file ? (
                            <div className="flex items-center justify-center gap-2 text-center px-4 w-full">
                              <FileText className="h-4 w-4 text-zinc-300 shrink-0" />
                              <span className="text-[13px] font-medium text-zinc-200 truncate">{test.file.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-center">
                              <UploadCloud className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                              <span className="text-[13px] text-zinc-400">Select File</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Optional PYQ Upload Section */}
                    <div className="grid grid-cols-1 pt-2">
                      <div className="space-y-3 flex flex-col">
                        <Label className="text-[13px] font-medium text-zinc-300 flex items-center gap-2">
                          Upload Previous Year Questions
                          <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold bg-zinc-900 px-2 py-0.5 rounded">Optional</span>
                        </Label>
                        <label 
                          htmlFor={`pyqs-${test.id}`}
                          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group py-6
                            ${test.pyqs.length > 0 ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-800 hover:border-zinc-600 bg-[#09090b] hover:bg-zinc-900/50'}
                          `}
                        >
                          <input
                            id={`pyqs-${test.id}`}
                            type="file"
                            multiple 
                            className="hidden"
                            onChange={(e) => handlePyqsChange(index, e.target.files)}
                            accept=".pdf,.doc,.docx,.png,.jpg"
                          />
                          {test.pyqs.length > 0 ? (
                            <div className="flex flex-col items-center gap-2 text-center">
                              <FileText className="h-6 w-6 text-zinc-300" />
                              <span className="text-[13px] font-medium text-zinc-200 px-4">
                                {test.pyqs.length} File{test.pyqs.length !== 1 && 's'} Selected
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-center">
                              <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center mb-1 group-hover:bg-zinc-800 transition-colors">
                                <UploadCloud className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                              </div>
                              <span className="text-[13px] text-zinc-400 font-medium">Click to browse multiple PYQ files</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Bottom Navigation */}
              <div className="pt-6 border-t border-zinc-800/60 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 h-11 font-medium transition-colors"
                >
                  <ArrowLeft className="mr-2 h-[18px] w-[18px]" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white h-11 font-semibold px-8 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-[18px] w-[18px] animate-spin text-white/80" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-[18px] w-[18px]" />
                      Generate Plan
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}