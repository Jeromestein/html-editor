"use client"

import { useState, useCallback, useRef } from "react"
import { FileUp, Loader2, AlertCircle, CheckCircle2, X, Circle, XCircle, Sparkles } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SampleData } from "@/lib/report-data"
import type { ProgressPhase } from "@/lib/gemini"

type DialogState = "idle" | "uploading" | "parsing" | "preview" | "error"

type ParsedResult = {
    data: Partial<SampleData>
    warnings: string[]
}

type PdfUploadDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImport: (data: Partial<SampleData>) => void
}

// Step status types
type StepStatus = "pending" | "active" | "done" | "error"

type Step = {
    id: string
    phase: ProgressPhase | null  // null means this step is not tied to a specific phase
    message: string
    status: StepStatus
}

// Initial steps configuration
const INITIAL_STEPS: Step[] = [
    { id: "upload", phase: "uploading", message: "Uploading document...", status: "pending" },
    { id: "detect", phase: "detecting", message: "Detecting document type...", status: "pending" },
    { id: "student", phase: "extracting_student", message: "Extracting student info...", status: "pending" },
    { id: "courses", phase: "extracting_courses", message: "Extracting courses...", status: "pending" },
    { id: "grades", phase: "converting_grades", message: "Looking up grade conversion rules...", status: "pending" },
    { id: "gpa", phase: "calculating_gpa", message: "Calculating GPA...", status: "pending" },
    { id: "refs", phase: "finding_refs", message: "Finding references...", status: "pending" },
    { id: "final", phase: "generating", message: "Generating final report...", status: "pending" },
]

// Map phase to step index for progress updates
const PHASE_TO_STEP_INDEX: Record<ProgressPhase, number> = {
    uploading: 0,
    detecting: 1,
    extracting_student: 2,
    extracting_courses: 3,
    converting_grades: 4,
    calculating_gpa: 5,
    finding_refs: 6,
    generating: 7,
    searching_websites: 7, // Part of final step
    complete: 7,
}

export function PdfUploadDialog({
    open,
    onOpenChange,
    onImport,
}: PdfUploadDialogProps) {
    const [state, setState] = useState<DialogState>("idle")
    const [error, setError] = useState<string>("")
    const [result, setResult] = useState<ParsedResult | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset state when dialog closes
    const handleOpenChange = useCallback(
        (newOpen: boolean) => {
            if (!newOpen) {
                setState("idle")
                setError("")
                setResult(null)
                setSteps(INITIAL_STEPS)
            }
            onOpenChange(newOpen)
        },
        [onOpenChange]
    )

    // Update steps based on progress phase
    const updateProgress = useCallback((phase: ProgressPhase) => {
        const targetIndex = PHASE_TO_STEP_INDEX[phase]

        setSteps((prev) =>
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

    // Mark all steps as done
    const markAllDone = useCallback(() => {
        setSteps((prev) => prev.map((step) => ({ ...step, status: "done" })))
    }, [])

    // Mark current step as error
    const markError = useCallback((phase?: ProgressPhase) => {
        setSteps((prev) => {
            const targetIndex = phase ? PHASE_TO_STEP_INDEX[phase] : prev.findIndex((s) => s.status === "active")
            return prev.map((step, index) => {
                if (index === targetIndex || (targetIndex === -1 && index === prev.findIndex((s) => s.status === "active"))) {
                    return { ...step, status: "error" }
                }
                return step
            })
        })
    }, [])

    // Handle file upload with SSE streaming
    const handleFile = useCallback(async (file: File) => {
        // Validate file type
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Please upload a valid PDF file.")
            setState("error")
            return
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError(`File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`)
            setState("error")
            return
        }

        // Reset and start
        setSteps(INITIAL_STEPS)
        setState("parsing")
        setError("")

        try {
            const formData = new FormData()
            formData.append("file", file)

            // Use SSE streaming endpoint
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

            // Read SSE stream
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // Process complete SSE messages
                const lines = buffer.split("\n\n")
                buffer = lines.pop() || "" // Keep incomplete message in buffer

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
                                setState("preview")
                            } else if (event.type === "error") {
                                markError()
                                setError(event.message || "Analysis failed")
                                setState("error")
                            }
                        } catch (e) {
                            console.warn("Failed to parse SSE event:", e)
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Upload error:", err)
            markError()
            setError("Network error. Please check your connection and try again.")
            setState("error")
        }
    }, [updateProgress, markAllDone, markError])

    // Handle drag and drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(false)

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0])
            }
        },
        [handleFile]
    )

    // Handle file input change
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0])
            }
        },
        [handleFile]
    )

    // Handle import
    const handleImport = useCallback(() => {
        if (result?.data) {
            onImport(result.data)
            handleOpenChange(false)
        }
    }, [result, onImport, handleOpenChange])

    // Handle retry
    const handleRetry = useCallback(() => {
        setState("idle")
        setError("")
        setSteps(INITIAL_STEPS)
    }, [])

    // Render step icon
    const renderStepIcon = (status: StepStatus) => {
        switch (status) {
            case "done":
                return <CheckCircle2 className="text-green-500 flex-shrink-0" size={14} />
            case "active":
                return <Loader2 className="text-blue-500 animate-spin flex-shrink-0" size={14} />
            case "error":
                return <XCircle className="text-red-500 flex-shrink-0" size={14} />
            default:
                return <Circle className="text-gray-300 flex-shrink-0" size={14} />
        }
    }

    // Render content based on state
    const renderContent = () => {
        switch (state) {
            case "idle":
                return (
                    <div
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handleInputChange}
                        />
                        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-sm text-gray-600">
                            <span className="font-semibold text-blue-600">Click to upload</span> or
                            drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">PDF files only, max 10MB</p>
                    </div>
                )

            case "uploading":
            case "parsing":
                return (
                    <div className="space-y-4">
                        {/* AI Progress Container with gradient border */}
                        <div className="ai-progress-container relative p-4 rounded-lg bg-white">
                            <div className="space-y-2">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-2 text-sm">
                                        {renderStepIcon(step.status)}
                                        <span
                                            className={`
                                                ${step.status === "active" ? "text-blue-600 font-medium" : ""}
                                                ${step.status === "done" ? "text-gray-600" : ""}
                                                ${step.status === "pending" ? "text-gray-400" : ""}
                                                ${step.status === "error" ? "text-red-600" : ""}
                                            `}
                                        >
                                            {step.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-500">
                            <Sparkles className="inline-block mr-1 text-purple-500" size={12} />
                            AI analysis in progress...
                        </p>
                    </div>
                )

            case "error":
                return (
                    <div className="space-y-4">
                        {/* Show steps with error state */}
                        <div className="ai-progress-container relative p-4 rounded-lg bg-white">
                            <div className="space-y-2">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-2 text-sm">
                                        {renderStepIcon(step.status)}
                                        <span
                                            className={`
                                                ${step.status === "active" ? "text-blue-600 font-medium" : ""}
                                                ${step.status === "done" ? "text-gray-600" : ""}
                                                ${step.status === "pending" ? "text-gray-400" : ""}
                                                ${step.status === "error" ? "text-red-600" : ""}
                                            `}
                                        >
                                            {step.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Error message */}
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <p className="mt-3 text-sm font-medium text-red-600 text-center">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={handleRetry}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )

            case "preview":
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">PDF analyzed successfully!</span>
                        </div>

                        {/* Warnings */}
                        {result?.warnings && result.warnings.length > 0 && (
                            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                                <p className="text-sm font-medium text-yellow-800">Warnings:</p>
                                <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                                    {result.warnings.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preview table */}
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody className="divide-y">
                                    {result?.data.name && (
                                        <tr>
                                            <td className="px-3 py-2 font-medium bg-gray-50 w-1/3">Name</td>
                                            <td className="px-3 py-2">{result.data.name}</td>
                                        </tr>
                                    )}
                                    {result?.data.dob && (
                                        <tr>
                                            <td className="px-3 py-2 font-medium bg-gray-50">Date of Birth</td>
                                            <td className="px-3 py-2">{result.data.dob}</td>
                                        </tr>
                                    )}
                                    {result?.data.country && (
                                        <tr>
                                            <td className="px-3 py-2 font-medium bg-gray-50">Country</td>
                                            <td className="px-3 py-2">{result.data.country}</td>
                                        </tr>
                                    )}
                                    {result?.data.credentials && (
                                        <tr>
                                            <td className="px-3 py-2 font-medium bg-gray-50">Credentials</td>
                                            <td className="px-3 py-2">
                                                {result.data.credentials.length} credential(s) found
                                            </td>
                                        </tr>
                                    )}
                                    {result?.data.credentials?.map((cred, i) => (
                                        <tr key={i}>
                                            <td className="px-3 py-2 font-medium bg-gray-50 pl-6">
                                                • Credential #{i + 1}
                                            </td>
                                            <td className="px-3 py-2">
                                                {cred.awardingInstitution} ({cred.courses?.length || 0} courses)
                                            </td>
                                        </tr>
                                    ))}
                                    {result?.data.documents && (
                                        <tr>
                                            <td className="px-3 py-2 font-medium bg-gray-50">Documents</td>
                                            <td className="px-3 py-2">
                                                {result.data.documents.length} document(s) found
                                            </td>
                                        </tr>
                                    )}
                                    {result?.data.references && result.data.references.length > 0 && (
                                        <tr>
                                            <td className="px-3 py-2 font-medium bg-gray-50">References</td>
                                            <td className="px-3 py-2">
                                                {/* references is a string with bullet points separated by newlines */}
                                                {(result.data.references as string).split('\n').filter(line => line.trim()).length} reference(s) found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Import from PDF
                    </DialogTitle>
                    <DialogDescription>
                        Upload a transcript or diploma PDF to automatically extract data.
                        Only English documents are supported.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">{renderContent()}</div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        {state === "preview" ? (
                            <>
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </>
                        ) : (
                            "Close"
                        )}
                    </Button>
                    {state === "preview" && (
                        <Button onClick={handleImport}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Import Data
                        </Button>
                    )}
                </DialogFooter>

                {/* AI Glow Effect Styles for progress container */}
                <style>{`
                    .ai-progress-container {
                        position: relative;
                        overflow: visible;
                    }
                    .ai-progress-container::before {
                        content: '';
                        position: absolute;
                        inset: -1px;
                        border-radius: 9px;
                        background: linear-gradient(90deg, #f472b6, #a78bfa, #38bdf8, #34d399, #facc15, #f472b6);
                        background-size: 300% 100%;
                        animation: ai-progress-rotate 3s linear infinite;
                        z-index: -1;
                        opacity: 0.5;
                        filter: blur(3px);
                    }
                    @keyframes ai-progress-rotate {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 300% 50%; }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    )
}
