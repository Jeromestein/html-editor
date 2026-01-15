import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Save, FolderOpen } from "lucide-react"
import { saveReport, updateReport, fetchReports, fetchReportContent, type ReportMetadata } from "@/lib/api"
import type { SampleData } from "@/lib/report-data"

type SaveReportDialogProps = {
    data: SampleData
    onSaved?: () => void
}

export function SaveReportDialog({ data, onSaved }: SaveReportDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [reports, setReports] = useState<ReportMetadata[]>([])
    const [isOverwrite, setIsOverwrite] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            fetchReports()
                .then(setReports)
                .catch((error) => console.error(error))
                .finally(() => setLoading(false))
        }
    }, [open])

    useEffect(() => {
        // Check if the current name matches any existing report
        const exists = reports.some(r => r.name.trim() === name.trim())
        setIsOverwrite(exists)
    }, [name, reports])

    const handleSave = async () => {
        if (!name.trim()) return

        if (isOverwrite) {
            if (!confirm(`Are you sure you want to overwrite "${name}"?`)) {
                return
            }
        }

        setLoading(true)
        try {
            if (isOverwrite) {
                const reportId = reports.find(r => r.name.trim() === name.trim())?.id
                if (reportId) {
                    // Update existing
                    await updateReport(reportId, data, name)
                } else {
                    // Fallback if ID not found (shouldn't happen due to check)
                    await saveReport(data, name)
                }
            } else {
                // Create new
                await saveReport(data, name)
            }

            setOpen(false)
            setName("")
            if (onSaved) onSaved()
            alert("Report saved successfully!")
            // Refresh list to show new timestamp/item
            fetchReports().then(setReports).catch(console.error)
        } catch (error: any) {
            console.error(error)
            alert(`Failed to save report: ${error?.message || "Unknown error"}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Save size={16} />
                    Save
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save Report</DialogTitle>
                    <DialogDescription>
                        Enter a name for this report. If the name exists, it will be overwritten.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g., John Doe - Fall 2023"
                        />
                    </div>

                    <div className="text-xs font-semibold text-gray-500 mt-2">Existing Reports (Click to overwrite):</div>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        {reports.length === 0 ? (
                            <div className="text-center text-sm text-gray-500">No reports found.</div>
                        ) : (
                            <div className="space-y-1">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="text-sm p-2 hover:bg-slate-100 rounded cursor-pointer truncate"
                                        onClick={() => setName(report.name || "")}
                                    >
                                        {report.name || "Untitled"}
                                        <span className="text-xs text-gray-400 ml-2">
                                            ({new Date(report.created_at).toLocaleDateString()})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading || !name.trim()} variant={isOverwrite ? "destructive" : "default"}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isOverwrite ? "Overwrite" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type LoadReportDialogProps = {
    onLoad: (data: SampleData) => void
}

export function LoadReportDialog({ onLoad }: LoadReportDialogProps) {
    const [open, setOpen] = useState(false)
    const [reports, setReports] = useState<ReportMetadata[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setLoading(true)
            fetchReports()
                .then(setReports)
                .catch((error) => {
                    console.error(error)
                    alert("Failed to fetch reports.")
                })
                .finally(() => setLoading(false))
        }
    }, [open])

    const handleLoad = async (id: string) => {
        setLoadingId(id)
        try {
            const content = await fetchReportContent(id)
            if (content) {
                onLoad(content)
                setOpen(false)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to load report.")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FolderOpen size={16} />
                    Load
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Load Report</DialogTitle>
                    <DialogDescription>
                        Select a saved report to load.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 p-4">No reports found.</div>
                    ) : (
                        <div className="space-y-2">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                                    onClick={() => handleLoad(report.id)}
                                >
                                    <div className="overflow-hidden">
                                        <div className="font-medium truncate">{report.name || "Untitled Report"}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(report.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    {loadingId === report.id && (
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
