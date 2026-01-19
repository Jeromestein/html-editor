"use client"

import { useState, useCallback, useRef } from "react"
import { FileUp, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react"
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

export function PdfUploadDialog({
    open,
    onOpenChange,
    onImport,
}: PdfUploadDialogProps) {
    const [state, setState] = useState<DialogState>("idle")
    const [error, setError] = useState<string>("")
    const [result, setResult] = useState<ParsedResult | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset state when dialog closes
    const handleOpenChange = useCallback(
        (newOpen: boolean) => {
            if (!newOpen) {
                setState("idle")
                setError("")
                setResult(null)
            }
            onOpenChange(newOpen)
        },
        [onOpenChange]
    )

    // Handle file upload
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

        setState("uploading")
        setError("")

        try {
            const formData = new FormData()
            formData.append("file", file)

            setState("parsing")

            const response = await fetch("/api/parse-pdf", {
                method: "POST",
                body: formData,
            })

            const json = await response.json()

            if (!json.success) {
                setError(json.message || "Failed to parse PDF")
                setState("error")
                return
            }

            setResult({
                data: json.data,
                warnings: json.warnings || [],
            })
            setState("preview")
        } catch (err) {
            console.error("Upload error:", err)
            setError("Network error. Please check your connection and try again.")
            setState("error")
        }
    }, [])

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
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <p className="mt-4 text-sm text-gray-600">
                            {state === "uploading" ? "Uploading file..." : "Analyzing with AI..."}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">This may take a few seconds</p>
                    </div>
                )

            case "error":
                return (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setState("idle")
                                setError("")
                            }}
                        >
                            Try Again
                        </Button>
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
                                                {result.data.references.length} reference(s) found
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
                        <FileUp className="h-5 w-5" />
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
            </DialogContent>
        </Dialog>
    )
}
