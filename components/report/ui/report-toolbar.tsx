import { Printer, RotateCcw, Sparkles, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SaveReportDialog, LoadReportDialog } from "./report-dialogs"
import { SampleData } from "../types"

type ReportToolbarProps = {
    data: SampleData
    onLoad: (data: SampleData) => void
    onReset: () => void
    onPrint: () => void
    onImportPdf: () => void
    onDownloadDocx: () => void
}

export const ReportToolbar = ({ data, onLoad, onReset, onPrint, onImportPdf, onDownloadDocx }: ReportToolbarProps) => {
    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full px-6 py-3 flex items-center justify-between shadow-sm no-print">
            <h1 className="font-bold text-blue-900 flex items-center gap-2">
                AET Smart Editor
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-normal">Editable</span>
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

                <LoadReportDialog onLoad={onLoad} />
                <SaveReportDialog data={data} />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="icon" onClick={onReset} title="Reset">
                    <RotateCcw size={18} />
                </Button>

                <Button onClick={onDownloadDocx} className="gap-2">
                    <FileDown size={18} /> DOCX
                </Button>

                <Button onClick={onPrint} className="gap-2">
                    <Printer size={18} /> Print / PDF
                </Button>
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
