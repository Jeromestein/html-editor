"use client"

import type React from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { SampleData } from "@/lib/report-data"
import type { ProgressPhase } from "@/lib/gemini"

type StepStatus = "pending" | "active" | "done" | "error"

type Step = {
  id: string
  phase: ProgressPhase | null
  message: string
  status: StepStatus
}

type ParsedResult = {
  data: Partial<SampleData>
  warnings: string[]
}

type PdfProcessContextValue = {
  isProcessing: boolean
  progress: Step[]
  result: ParsedResult | null
  error: string | null
  isCollapsed: boolean
  startProcessing: (file: File) => Promise<void>
  reset: () => void
  minimize: () => void
  expand: () => void
}

const PdfProcessContext = createContext<PdfProcessContextValue | undefined>(undefined)

const INITIAL_STEPS: Step[] = [
  { id: "upload", phase: "uploading", message: "Uploading document...", status: "pending" },
  { id: "parse", phase: "parsing_pdf", message: "Analyzing document structure...", status: "pending" },
  { id: "courses", phase: "extracting_courses", message: "Extracting courses...", status: "pending" },
  { id: "grades", phase: "converting_grades", message: "Looking up grade conversion rules...", status: "pending" },
  { id: "refs", phase: "finding_refs", message: "Finding references...", status: "pending" },
  { id: "gpa", phase: "calculating_gpa", message: "Calculating GPA...", status: "pending" },
  { id: "websites", phase: "searching_websites", message: "Searching institution websites...", status: "pending" },
  { id: "complete", phase: "complete", message: "Analysis complete!", status: "pending" },
]

const PHASE_TO_STEP_INDEX: Record<ProgressPhase, number> = {
  uploading: 0,
  parsing_pdf: 1,
  extracting_courses: 2,
  converting_grades: 3,
  finding_refs: 4,
  calculating_gpa: 5,
  searching_websites: 6,
  complete: 7,
}

export function PdfProcessProvider({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<Step[]>(INITIAL_STEPS)
  const [result, setResult] = useState<ParsedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateProgress = useCallback((phase: ProgressPhase) => {
    const targetIndex = PHASE_TO_STEP_INDEX[phase]

    setProgress((prev) =>
      prev.map((step, index) => {
        if (index < targetIndex) {
          return { ...step, status: "done" }
        }
        if (index === targetIndex) {
          return { ...step, status: "active" }
        }
        return { ...step, status: "pending" }
      })
    )
  }, [])

  const markAllDone = useCallback(() => {
    setProgress((prev) => prev.map((step) => ({ ...step, status: "done" })))
  }, [])

  const markError = useCallback((phase?: ProgressPhase) => {
    setProgress((prev) => {
      const activeIndex = prev.findIndex((step) => step.status === "active")
      const targetIndex = phase ? PHASE_TO_STEP_INDEX[phase] : activeIndex
      return prev.map((step, index) => {
        if (index === targetIndex || (targetIndex === -1 && index === activeIndex)) {
          return { ...step, status: "error" }
        }
        return step
      })
    })
  }, [])

  const reset = useCallback(() => {
    setIsProcessing(false)
    setProgress(INITIAL_STEPS)
    setResult(null)
    setError(null)
    setIsCollapsed(false)
  }, [])

  const startProcessing = useCallback(async (file: File) => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)
    setResult(null)
    setProgress(INITIAL_STEPS)
    setIsCollapsed(true)

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setIsProcessing(false)
      markError("uploading")
      setError("Please upload a valid PDF file.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setIsProcessing(false)
      markError("uploading")
      setError(`File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`)
      return
    }

    try {
      updateProgress("uploading")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/parse-pdf-stream", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      let didComplete = false
      let didError = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6)
            try {
              const event = JSON.parse(jsonStr)

              if (event.type === "progress") {
                updateProgress(event.phase as ProgressPhase)
              } else if (event.type === "complete") {
                markAllDone()
                setResult({
                  data: event.data,
                  warnings: event.warnings || [],
                })
                setIsProcessing(false)
                didComplete = true
              } else if (event.type === "error") {
                markError()
                setError(event.message || "Analysis failed")
                setIsProcessing(false)
                didError = true
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE event:", parseError)
            }
          }
        }
      }

      if (!didComplete && !didError) {
        markError()
        setError("Analysis ended unexpectedly. Please try again.")
        setIsProcessing(false)
      }
    } catch (err) {
      console.error("Upload error:", err)
      markError()
      setError("Network error. Please check your connection and try again.")
      setIsProcessing(false)
    }
  }, [isProcessing, markError, markAllDone, updateProgress])

  const value = useMemo(() => ({
    isProcessing,
    progress,
    result,
    error,
    isCollapsed,
    startProcessing,
    reset,
    minimize: () => setIsCollapsed(true),
    expand: () => setIsCollapsed(false),
  }), [
    isProcessing,
    progress,
    result,
    error,
    isCollapsed,
    startProcessing,
    reset,
  ])

  return (
    <PdfProcessContext.Provider value={value}>
      {children}
    </PdfProcessContext.Provider>
  )
}

export function usePdfProcess() {
  const context = useContext(PdfProcessContext)
  if (!context) {
    throw new Error("usePdfProcess must be used within PdfProcessProvider")
  }
  return context
}

export type { Step, StepStatus, ParsedResult }
