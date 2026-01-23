"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { Printer, Sparkles, FileDown, RotateCcw, Save, FolderOpen, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { ReportMeta } from "../hooks/use-report-data"
import { ReportHistory } from "./report-history"
import type { SampleData } from "@/lib/report-data"

type ReportToolbarProps = {
    onPrint: () => void
    onImportPdf: () => void
    onDownloadDocx: () => void
    // Title bar props
    reportMeta: ReportMeta
    onNameChange: (name: string) => void
    onSave: () => void
    onLoad: () => void
    onReset: () => void
    onRestoreVersion: (data: SampleData) => void
    showAssistant: boolean
    onToggleAssistant: () => void
}

export const ReportToolbar = ({
    onPrint,
    onImportPdf,
    onDownloadDocx,
    reportMeta,
    onNameChange,
    onSave,
    onLoad,
    onReset,
    onRestoreVersion,
    showAssistant,
    onToggleAssistant,
}: ReportToolbarProps) => {
    // Title editing state
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(reportMeta.name)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!isEditing) {
            setEditValue(reportMeta.name)
        }
    }, [reportMeta.name, isEditing])

    // Update browser tab title when report name changes
    useEffect(() => {
        document.title = `${reportMeta.name} - AET Smart Editor`
    }, [reportMeta.name])

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleTitleClick = () => setIsEditing(true)

    const handleTitleBlur = () => {
        setIsEditing(false)
        if (editValue.trim() !== reportMeta.name) {
            onNameChange(editValue.trim() || "Unnamed Draft")
        }
    }

    const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            inputRef.current?.blur()
        } else if (e.key === "Escape") {
            setEditValue(reportMeta.name)
            setIsEditing(false)
        }
    }

    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full shadow-sm no-print">
            {/* Row 1: Main toolbar */}
            <div className="px-6 py-3 flex items-center justify-between">
                <h1 className="font-bold text-2xl text-blue-900 flex items-center gap-2">
                    <Image src="/web-app-manifest-512x512.png" alt="AET Logo" width={64} height={64} className="h-16 w-auto" />
                    AET Smart Editor
                </h1>
                <div className="flex gap-2 items-center">
                    {/* AI Button with gradient glow effect */}
                    <button
                        onClick={onImportPdf}
                        className="ai-glow-button relative group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 transition-all"
                    >
                        <Sparkles size={16} className="text-purple-500" />
                        <span>AI Parse PDF</span>
                    </button>

                    <Button
                        variant={showAssistant ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5"
                        onClick={onToggleAssistant}
                        aria-pressed={showAssistant}
                    >
                        <MessageSquare size={16} />
                        Chat with Report
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <Button onClick={onDownloadDocx} className="gap-2">
                        <FileDown size={18} /> DOCX
                    </Button>

                    <Button onClick={onPrint} className="gap-2">
                        <Printer size={18} /> Print / PDF
                    </Button>
                </div>
            </div>

            {/* Row 2: Title bar (thin separator line above) */}
            <div className="px-6 py-2 flex items-center justify-between border-t border-gray-100">
                {/* Title Section */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText size={18} className="text-blue-900 flex-shrink-0" />

                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            className="text-blue-900 font-medium bg-gray-50 border border-gray-300 rounded px-2 py-0.5 min-w-[200px] max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    ) : (
                        <button
                            onClick={handleTitleClick}
                            className="text-blue-900 font-medium hover:bg-gray-100 rounded px-2 py-0.5 transition-colors truncate max-w-md text-left"
                            title="Click to edit report name"
                        >
                            {reportMeta.name}
                        </button>
                    )}

                    {/* Status Indicator */}
                    {reportMeta.isDirty && (
                        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            ● Unsaved
                        </span>
                    )}
                    {!reportMeta.isDirty && reportMeta.id && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            ✓ Saved
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <ReportHistory
                        reportId={reportMeta.id}
                        isDirty={reportMeta.isDirty}
                        onRestore={onRestoreVersion}
                    />
                    <Button variant="outline" size="sm" onClick={onLoad} className="gap-1.5">
                        <FolderOpen size={16} />
                        Load
                    </Button>
                    <Button variant="outline" size="sm" onClick={onSave} className="gap-1.5">
                        <Save size={16} />
                        Save
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onReset} title="Reset to sample data">
                        <RotateCcw size={16} />
                    </Button>
                </div>
            </div>

            {/* AI Glow Effect Styles */}
            <style>{`
                .ai-glow-button {
                    position: relative;
                    overflow: visible;
                }
                .ai-glow-button::before {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: 10px;
                    background: linear-gradient(90deg, #f472b6, #a78bfa, #38bdf8, #34d399, #facc15, #f472b6);
                    background-size: 300% 100%;
                    animation: ai-glow-rotate 3s linear infinite;
                    z-index: -1;
                    opacity: 0.8;
                    filter: blur(4px);
                }
                .ai-glow-button:hover::before {
                    opacity: 1;
                    filter: blur(6px);
                }
                @keyframes ai-glow-rotate {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
            `}</style>
        </div>
    )
}
