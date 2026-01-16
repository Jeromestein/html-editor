import { Printer, RotateCcw } from "lucide-react"
import { SaveReportDialog, LoadReportDialog } from "./report-dialogs"
import { SampleData } from "../types"

type ReportToolbarProps = {
    data: SampleData
    onLoad: (data: SampleData) => void
    onReset: () => void
    onPrint: () => void
}

export const ReportToolbar = ({ data, onLoad, onReset, onPrint }: ReportToolbarProps) => {
    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full px-6 py-3 flex items-center justify-between shadow-sm no-print">
            <h1 className="font-bold text-blue-900 flex items-center gap-2">
                AET Smart Editor
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-normal">Editable</span>
            </h1>
            <div className="flex gap-2">
                <LoadReportDialog onLoad={onLoad} />
                <SaveReportDialog data={data} />
                <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>

                <button
                    onClick={onReset}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title="Reset"
                >
                    <RotateCcw size={18} />
                </button>

                <button
                    onClick={onPrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm transition-colors"
                >
                    <Printer size={18} /> Print / PDF
                </button>
            </div>
        </div>
    )
}
