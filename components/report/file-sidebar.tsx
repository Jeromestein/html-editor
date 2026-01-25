"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, FileText, MoreVertical, Edit, ArrowUpDown, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { fetchReports, updateReport, checkReportExists, saveReport, ReportMetadata } from "@/lib/report-store"
import { buildSampleData } from "@/lib/report-data"

import { cn } from "@/lib/utils"
type FileSidebarProps = {
    isOpen: boolean // Keep isOpen for internal logic if needed, but we rely on collapsed prop for visuals
    collapsed: boolean
    currentReportId: string | null
    onNavigate: (reportName: string) => void
    onCreateNew: () => void
    onToggle: () => void
}

type SortOption = "name" | "date"
type SortOrder = "asc" | "desc"

export function FileSidebar({ isOpen, collapsed, currentReportId, onNavigate, onCreateNew, onToggle }: FileSidebarProps) {
    const [reports, setReports] = useState<ReportMetadata[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>(() => {
        if (typeof window === "undefined") return "name"
        const stored = window.localStorage.getItem("aet.sidebar.sortBy")
        return stored === "date" || stored === "name" ? stored : "name"
    })
    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        if (typeof window === "undefined") return "desc"
        const stored = window.localStorage.getItem("aet.sidebar.sortOrder")
        return stored === "asc" || stored === "desc" ? stored : "desc"
    }) // Default to newest first for date, or we can handle logic below


    // Dialog states
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState<ReportMetadata | null>(null)
    const [newName, setNewName] = useState("")
    const [isActionLoading, setIsActionLoading] = useState(false)

    const loadReports = async () => {
        try {
            setIsLoading(true)
            const data = await fetchReports()
            setReports(data)
        } catch (error) {
            console.error("Failed to load reports", error)
            toast({
                title: "Error loading reports",
                description: "Could not fetch report list.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadReports()
        }
    }, [isOpen])

    useEffect(() => {
        window.localStorage.setItem("aet.sidebar.sortBy", sortBy)
        window.localStorage.setItem("aet.sidebar.sortOrder", sortOrder)
    }, [sortBy, sortOrder])

    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            let comparison = 0
            if (sortBy === "name") {
                comparison = a.name.localeCompare(b.name)
            } else {
                comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            }
            return sortOrder === "asc" ? comparison : -comparison
        })
    }, [reports, sortBy, sortOrder])

    const handleRenameClick = (report: ReportMetadata) => {
        setSelectedReport(report)
        setNewName(report.name)
        setRenameDialogOpen(true)
    }

    const handleSortToggle = () => {
        setSortOrder(prev => prev === "asc" ? "desc" : "asc")
    }

    const handleCreateDraft = async () => {
        try {
            setIsActionLoading(true)
            // Check if "draft" exists
            const exists = await checkReportExists("draft")
            if (exists) {
                toast({
                    title: "Draft already exists",
                    description: "Please rename or delete the existing 'draft' report first.",
                    variant: "destructive",
                })
                // Highlight the draft
                const draft = reports.find(r => r.name === "draft")
                if (draft) onNavigate(draft.name)
                return
            }

            // Create new draft
            const sample = buildSampleData()
            await saveReport(sample, "draft")

            toast({ title: "Draft created" })
            loadReports()
            onNavigate("draft")
        } catch (error) {
            console.error("Failed to create draft", error)
            toast({ title: "Failed to create draft", variant: "destructive" })
        } finally {
            setIsActionLoading(false)
        }
    }




    const handleRenameConfirm = async () => {
        if (!selectedReport) return
        if (!newName.trim()) {
            toast({ title: "Name is required", variant: "destructive" })
            return
        }

        try {
            setIsActionLoading(true)

            // Check if name exists (unless it's the same name)
            if (newName !== selectedReport.name) {
                const exists = await checkReportExists(newName)
                if (exists) {
                    toast({ title: "Name already exists", description: "Please choose a different name.", variant: "destructive" })
                    setIsActionLoading(false)
                    return
                }
            }

            // Fetch content
            const fullReport = await fetch("/api/save-load-report?id=" + selectedReport.id).then(r => r.json())
            if (!fullReport) throw new Error("Could not fetch report content for rename")

            await updateReport(selectedReport.id, fullReport, newName)

            toast({ title: "Report renamed" })
            setRenameDialogOpen(false)
            loadReports()

            if (selectedReport.id === currentReportId) {
                onNavigate(newName)
            }

        } catch (error) {
            console.error(error)
            toast({ title: "Rename failed", variant: "destructive" })
        } finally {
            setIsActionLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={cn(
            "flex h-full flex-col border-r border-gray-200 bg-white shrink-0 transition-all duration-300",
            collapsed ? "w-[50px]" : "w-[250px]"
        )}>
            <div className={cn("flex flex-col border-b bg-gray-50/50", collapsed ? "p-3 items-center" : "p-3 gap-3")}>
                <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-gray-500 hover:text-gray-900">
                                    <PanelLeft size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {!collapsed && (
                        <h2 className="text-sm font-semibold text-gray-700">Files</h2>
                    )}
                </div>

                {!collapsed && (
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5 flex-1 ring-1 ring-gray-200">
                            <select
                                className="bg-transparent text-xs border-none focus:ring-0 text-gray-600 font-medium py-1 px-2 flex-1 cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                            >
                                <option value="name">Name</option>
                                <option value="date">Date</option>
                            </select>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-sm text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm"
                                onClick={handleSortToggle}
                                title={sortOrder === "asc" ? "Ascending" : "Descending"}
                            >
                                <ArrowUpDown size={12} className={sortOrder === "asc" ? "transform rotate-180" : ""} />
                            </Button>
                        </div>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600" onClick={handleCreateDraft}>
                                        <Plus size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New Draft</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>

            {!collapsed && (
                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-2 flex flex-col gap-1">
                        {isLoading ? (
                            <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
                        ) : sortedReports.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500">No reports found</div>
                        ) : (
                            sortedReports.map((report) => (
                                <div
                                    key={report.id}
                                    className={cn(
                                        "group flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-gray-100 cursor-pointer",
                                        currentReportId === report.id ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-gray-700"
                                    )}
                                    onClick={() => onNavigate(report.name)}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={14} className={cn("shrink-0", currentReportId === report.id ? "text-blue-500" : "text-gray-400")} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate font-medium leading-none">{report.name}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                {new Date(report.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical size={14} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRenameClick(report) }}>
                                                <Edit className="mr-2 h-3 w-3" />
                                                Rename
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            )}

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Report</DialogTitle>
                        <DialogDescription>Enter a new name for this report.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Report Name"
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRenameConfirm} disabled={isActionLoading}>
                            {isActionLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
