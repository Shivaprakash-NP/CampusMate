"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  UploadCloud, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText,
  BookOpen
} from "lucide-react"

// Shadcn UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// --- Types ---
interface TestDetail {
  id: string
  subjectName: string
  testDate: string
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

const fadeVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
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
        testDate: "", 
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
      // 1. Create a new FormData object
      const formData = new FormData()

      // 2. Append standard top-level fields matching the DTO
      formData.append('PlanTitle', planTitle)
      formData.append('startDate', planStartDate)
      formData.append('endDate', planEndDate)

      // 3. Append nested list fields using exact names from your DTO
      tests.forEach((test, index) => {
        
        // Parse the end portion (e.g., if user inputs "1-4", extract "4")
        const portionParts = test.portions.split('-')
        const endSequenceOrder = portionParts.length > 1 ? portionParts[1].trim() : test.portions.trim()
        
        // Match DTO: portions[i].Title, portions[i].endSequenceOrder
        formData.append(`portions[${index}].Title`, test.subjectName)
        formData.append(`portions[${index}].endSequenceOrder`, endSequenceOrder || '0')

        // Append the syllabus file (MultipartFile syllabusFile)
        if (test.file) {
          formData.append(`portions[${index}].syllabusFile`, test.file)
        }

        // Append the List of PYQ files (List<MultipartFile> pyq)
        if (test.pyqs && test.pyqs.length > 0) {
          test.pyqs.forEach((pyqFile) => {
            formData.append(`portions[${index}].pyq`, pyqFile)
          })
        }
      })

      // 4. Send the request
      const response = await fetch('http://localhost:8080/api/schedule/generate', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // CRITICAL: Let the browser set the Content-Type automatically for boundaries
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Success:', data)

      // Finish and return to main dashboard
      onComplete({
        planStartDate,
        planEndDate,
        numTests: Number(numTests),
        tests
      })

    } catch (error) {
      console.error('Error submitting to backend:', error)
      alert('Failed to generate plan. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-950 font-sans text-zinc-100 flex flex-col py-8 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30">
      
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 border-b border-zinc-800/60 pb-6">
          <div className="flex items-center gap-3">
             <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
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
          
          {/* Simple Progress Indicator */}
          <div className="flex items-center gap-2 mt-4 text-xs font-medium uppercase tracking-wider">
            <span className={step >= 1 ? "text-cyan-400" : "text-zinc-600"}>1. Setup</span>
            <div className={`h-px w-8 ${step >= 2 ? "bg-cyan-400" : "bg-zinc-800"}`} />
            <span className={step >= 2 ? "text-cyan-400" : "text-zinc-600"}>2. Syllabus & Details</span>
          </div>
        </div>

        {/* Multi-Step Form */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Global Setup */}
            {step === 1 && (
              <motion.form
                key="step1"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleNextStep}
                className="space-y-6"
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
                        className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-cyan-500 [color-scheme:dark]"
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
                        className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-cyan-500 [color-scheme:dark]"
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
                        className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!planStartDate || !planEndDate || !numTests}
                    className="h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold px-6 rounded-lg transition-all"
                  >
                    Continue to Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: Per-Test Uploads & Portions */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="flex flex-col gap-6">
                  {tests.map((test, index) => (
                    <div 
                      key={test.id} 
                      className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/30 shadow-sm backdrop-blur-sm space-y-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                          {index + 1}
                        </div>
                        <h3 className="text-sm font-medium text-zinc-200">Test Details</h3>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-[12px] text-zinc-400">Subject / Test Name</Label>
                          <Input
                            placeholder="e.g. Operating Systems"
                            value={test.subjectName}
                            onChange={(e) => handleTestChange(index, "subjectName", e.target.value)}
                            className="h-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-cyan-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[12px] text-zinc-400">Test Date</Label>
                          <Input
                            type="date"
                            value={test.testDate}
                            onChange={(e) => handleTestChange(index, "testDate", e.target.value)}
                            className="h-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-cyan-500 [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-[12px] text-zinc-400">Syllabus Portions</Label>
                          <Input
                            placeholder="1-4"
                            value={test.portions}
                            onChange={(e) => handleTestChange(index, "portions", e.target.value)}
                            className="h-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-cyan-500"
                          />
                        </div>

                        <div className="space-y-2 flex flex-col">
                          <Label className="text-[12px] text-zinc-400">Upload Syllabus File</Label>
                          <label 
                            htmlFor={`file-${test.id}`}
                            className={`flex-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer group h-20
                              ${test.file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900'}
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
                              <div className="flex flex-col items-center gap-1 text-center">
                                <FileText className="h-5 w-5 text-emerald-400 mb-1" />
                                <span className="text-[11px] font-medium text-emerald-400 line-clamp-1 px-4">{test.file.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">Change file</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-center">
                                <UploadCloud className="h-5 w-5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-[11px] text-zinc-400">Select Syllabus</span>
                                <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">PDF or Image</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Optional PYQ Upload Section */}
                      <div className="grid grid-cols-1 pt-2">
                        <div className="space-y-2 flex flex-col">
                          <Label className="text-[12px] text-zinc-400">Upload PYQs (Optional)</Label>
                          <label 
                            htmlFor={`pyqs-${test.id}`}
                            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer group py-4
                              ${test.pyqs.length > 0 ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900'}
                            `}
                          >
                            <input
                              id={`pyqs-${test.id}`}
                              type="file"
                              multiple // Allow multiple files
                              className="hidden"
                              onChange={(e) => handlePyqsChange(index, e.target.files)}
                              accept=".pdf,.doc,.docx,.png,.jpg"
                            />
                            {test.pyqs.length > 0 ? (
                              <div className="flex flex-col items-center gap-1 text-center">
                                <FileText className="h-5 w-5 text-indigo-400 mb-1" />
                                <span className="text-[11px] font-medium text-indigo-400 px-4">
                                  {test.pyqs.length} File{test.pyqs.length !== 1 && 's'} Selected
                                </span>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">Click to change</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-center">
                                <UploadCloud className="h-5 w-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                <span className="text-[11px] text-zinc-400">Select Multiple PYQ Files</span>
                                <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">PDF or Images allowed</span>
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
                    className="text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmitFinal}
                    disabled={isSubmitting}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8 shadow-lg shadow-cyan-500/10 rounded-lg transition-all disabled:opacity-80"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        {/* Loading Spinner */}
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}