"use client"

import { useEffect, useState } from "react"
import { History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchReportHistory, fetchReportVersion, type ReportHistoryItem } from "@/lib/report-store"
import type { SampleData } from "@/lib/report-data"

type ReportHistoryProps = {
    reportId: string | null
    isDirty: boolean
    onRestore: (data: SampleData) => void
}

export function ReportHistory({ reportId, isDirty, onRestore }: ReportHistoryProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [history, setHistory] = useState<ReportHistoryItem[]>([])

    useEffect(() => {
        if (!open) return
        if (!reportId) {
            setHistory([])
            return
        }

        setLoading(true)
        fetchReportHistory(reportId)
            .then(setHistory)
            .catch((error) => {
                console.error(error)
                alert("Failed to load report history.")
            })
            .finally(() => setLoading(false))
    }, [open, reportId])

    const handleRestore = async (versionId: string) => {
        if (!reportId) return
        if (isDirty && !window.confirm("You have unsaved changes. Restoring a version will overwrite your current edits. Continue?")) {
            return
        }

        setLoadingId(versionId)
        try {
            const content = await fetchReportVersion(versionId)
            if (content) {
                onRestore(content)
                setOpen(false)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to restore this version.")
        } finally {
            setLoadingId(null)
        }
    }

    const isDisabled = !reportId

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={isDisabled} className="gap-1.5">
                <History size={16} />
                History
            </Button>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Report History</DialogTitle>
                    <DialogDescription>
                        Restore a previous saved version. Restores are loaded into the editor as unsaved changes.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[320px] w-full rounded-md border p-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : !reportId ? (
                        <div className="text-center text-sm text-gray-500 p-4">
                            Save this report to enable history.
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 p-4">No history entries found.</div>
                    ) : (
                        <div className="space-y-2">
                            {history.map((item) => {
                                const isAi = item.created_by === "ai"
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 p-2 border border-slate-200 rounded-md"
                                    >
                                        <div className="flex flex-col overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </span>
                                                <Badge variant={isAi ? "secondary" : "outline"}>
                                                    {isAi ? "AI" : "User"}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-500">Version ID: {item.id}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRestore(item.id)}
                                            disabled={loadingId === item.id}
                                        >
                                            {loadingId === item.id && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Restore
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
