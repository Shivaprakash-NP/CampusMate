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
  onComplete: (data: {
    planStartDate: string
    planEndDate: string
    numTests: number
    tests: TestDetail[]
  }) => void
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

      // FIX 1: Strict camelCase mapping to match Spring Boot DTOs
      formData.append('planTitle', planTitle)
      formData.append('startDate', planStartDate)
      formData.append('endDate', planEndDate)

      tests.forEach((test, index) => {
        const portionParts = test.portions.split('-')
        const endSequenceOrder = portionParts.length > 1 ? portionParts[1].trim() : test.portions.trim()
        
        // FIX 2: Changed .Title to .title to prevent NullPointerException in Java
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

      // FIX 3: Safely extract JWT Token if Authorization header is required
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
        // If it still fails, the backend text will help debug
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`)
      }

      const data = await response.json()
      
      onComplete({
        planStartDate,
        planEndDate,
        numTests: Number(numTests),
        tests
      })

    } catch (error) {
      console.error('Error submitting to backend:', error)
      alert('Failed to generate plan. Please check your connection or server logs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-950 font-sans text-zinc-100 flex flex-col py-8 px-4 sm:px-6 lg:px-8 selection:bg-zinc-800">
      
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 border-b border-zinc-800/60 pb-6">
          <div className="flex items-center gap-3">
             <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                Configuring
             </span>
             <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100">
               {planTitle}
             </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {step === 1 
              ? "Set up your overall study timeline and test quantity." 
              : "Upload syllabus files and define portions for each specific test."}
          </p>
          
          {/* Native Tailwind Progress Indicator */}
          <div className="flex items-center gap-2 mt-5 text-[11px] font-semibold uppercase tracking-wider">
            <span className={step >= 1 ? "text-zinc-100" : "text-zinc-600"}>1. Setup</span>
            <div className={`h-[1px] w-8 transition-colors duration-300 ${step >= 2 ? "bg-zinc-100" : "bg-zinc-800"}`} />
            <span className={step >= 2 ? "text-zinc-100" : "text-zinc-600"}>2. Syllabus & Details</span>
          </div>
        </div>

        <div className="relative">
            
          {/* STEP 1: Global Setup (No Framer Motion) */}
          {step === 1 && (
            <form
              onSubmit={handleNextStep}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-zinc-300">Study Plan Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="date"
                      required
                      value={planStartDate}
                      onChange={(e) => setPlanStartDate(e.target.value)}
                      className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-600 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-zinc-300">Study Plan End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="date"
                      required
                      value={planEndDate}
                      onChange={(e) => setPlanEndDate(e.target.value)}
                      className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-600 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-zinc-300">Number of Tests</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      required
                      placeholder="e.g. 5"
                      value={numTests}
                      onChange={(e) => setNumTests(parseInt(e.target.value) || "")}
                      className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!planStartDate || !planEndDate || !numTests}
                  className="h-10 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-6 shadow-sm transition-all disabled:opacity-50"
                >
                  Continue to Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Per-Test Uploads & Portions (No Framer Motion) */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
              <div className="flex flex-col gap-6">
                {tests.map((test, index) => (
                  <div 
                    key={test.id} 
                    className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 shadow-sm backdrop-blur-sm space-y-5 transition-colors hover:bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-[11px] font-bold text-zinc-300 shadow-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200">Test Configuration</h3>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-1">
                      <div className="space-y-2">
                        <Label className="text-[12px] font-medium text-zinc-400">Subject / Test Name</Label>
                        <Input
                          placeholder="e.g. Operating Systems"
                          value={test.subjectName}
                          onChange={(e) => handleTestChange(index, "subjectName", e.target.value)}
                          className="h-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-600 transition-colors"
                        />
                      </div>

                    
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[12px] font-medium text-zinc-400">Syllabus Portions</Label>
                        <Input
                          placeholder="e.g. 1-4"
                          value={test.portions}
                          onChange={(e) => handleTestChange(index, "portions", e.target.value)}
                          className="h-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-2 flex flex-col">
                        <Label className="text-[12px] font-medium text-zinc-400">Upload Syllabus File</Label>
                        <label 
                          htmlFor={`file-${test.id}`}
                          className={`flex-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer group h-[42px]
                            ${test.file ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/50 hover:bg-zinc-900'}
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
                              <span className="text-[12px] font-medium text-zinc-200 truncate">{test.file.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-center">
                              <UploadCloud className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                              <span className="text-[12px] text-zinc-400">Select File</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Optional PYQ Upload Section */}
                    <div className="grid grid-cols-1 pt-2">
                      <div className="space-y-2 flex flex-col">
                        <Label className="text-[12px] font-medium text-zinc-400">Upload PYQs <span className="text-zinc-600 font-normal">(Optional)</span></Label>
                        <label 
                          htmlFor={`pyqs-${test.id}`}
                          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer group py-4
                            ${test.pyqs.length > 0 ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/50 hover:bg-zinc-900'}
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
                            <div className="flex flex-col items-center gap-1.5 text-center">
                              <FileText className="h-5 w-5 text-zinc-300" />
                              <span className="text-[12px] font-medium text-zinc-200 px-4">
                                {test.pyqs.length} File{test.pyqs.length !== 1 && 's'} Selected
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-center">
                              <UploadCloud className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                              <span className="text-[12px] text-zinc-400">Select Multiple PYQ Files</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Bottom Navigation */}
              <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 font-medium transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-8 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
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