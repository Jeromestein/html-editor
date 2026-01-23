"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, FileText, MoreVertical, Edit, ArrowUpDown, FolderOpen } from "lucide-react"
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
import { fetchReports, updateReport, checkReportExists, ReportMetadata } from "@/lib/report-store"
import { cn } from "@/lib/utils"

type FileSidebarProps = {
    isOpen: boolean // Keep isOpen for internal logic if needed, but we rely on collapsed prop for visuals
    collapsed: boolean
    currentReportId: string | null
    onNavigate: (reportName: string) => void
    onCreateNew: () => void
}

type SortOption = "name" | "date"

export function FileSidebar({ isOpen, collapsed, currentReportId, onNavigate, onCreateNew }: FileSidebarProps) {
    const [reports, setReports] = useState<ReportMetadata[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>("name")

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

    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name)
            } else {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            }
        })
    }, [reports, sortBy])

    const handleRenameClick = (report: ReportMetadata) => {
        setSelectedReport(report)
        setNewName(report.name)
        setRenameDialogOpen(true)
    }

    const handleSortToggle = () => {
        setSortBy(prev => prev === "name" ? "date" : "name")
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
            <div className={cn("flex items-center p-3 border-b h-[50px]", collapsed ? "justify-center" : "justify-between")}>
                {collapsed ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <FolderOpen size={20} className="text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent side="right">Files</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <>
                        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FolderOpen size={16} />
                            Files
                        </h2>
                        <div className="flex items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreateNew}>
                                            <Plus size={14} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>New Report</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSortToggle}>
                                            <ArrowUpDown size={14} className={cn("transition-transform", sortBy === 'date' && "text-blue-600")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Sort by {sortBy === 'name' ? 'Date' : 'Name'}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 flex flex-col gap-1">
                    {isLoading ? (
                        !collapsed && <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
                    ) : sortedReports.length === 0 ? (
                        !collapsed && <div className="p-4 text-center text-xs text-gray-500">No reports found</div>
                    ) : (
                        sortedReports.map((report) => (
                            <div
                                key={report.id}
                                className={cn(
                                    "group flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-gray-100 cursor-pointer",
                                    currentReportId === report.id ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-gray-700",
                                    collapsed && "justify-center px-1"
                                )}
                                onClick={() => onNavigate(report.name)}
                                title={collapsed ? report.name : undefined}
                            >
                                <div className={cn("flex items-center overflow-hidden", collapsed ? "justify-center w-full" : "gap-2")}>
                                    <FileText size={collapsed ? 20 : 14} className={cn("shrink-0", currentReportId === report.id ? "text-blue-500" : "text-gray-400")} />
                                    {!collapsed && (
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate font-medium leading-none">{report.name}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                {new Date(report.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {!collapsed && (
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
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

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
