"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PdfReviewDialog } from "@/components/pdf-review-dialog"
import { usePdfProcess } from "@/contexts/pdf-process-context"
import type { StepStatus } from "@/contexts/pdf-process-context"

const renderStepIcon = (status: StepStatus) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="text-green-500 flex-shrink-0" size={14} />
    case "active":
      return <Loader2 className="text-blue-500 animate-spin flex-shrink-0" size={14} />
    case "error":
      return <AlertCircle className="text-red-500 flex-shrink-0" size={14} />
    default:
      return <Sparkles className="text-gray-300 flex-shrink-0" size={14} />
  }
}

export function GlobalProgressWidget() {
  const [reviewOpen, setReviewOpen] = useState(false)
  const {
    isProcessing,
    progress,
    result,
    error,
    isCollapsed,
    minimize,
    expand,
    reset,
  } = usePdfProcess()

  if (!isProcessing && !result && !error) {
    return null
  }

  const status = isProcessing ? "processing" : error ? "error" : "complete"

  const handleCollapsedClick = () => {
    if (status === "complete") {
      setReviewOpen(true)
      return
    }
    expand()
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleCollapsedClick}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-lg border transition ${
              status === "processing"
                ? "bg-white text-blue-600 border-blue-200"
                : status === "complete"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "complete" && <CheckCircle2 className="h-4 w-4" />}
            {status === "error" && <AlertCircle className="h-4 w-4" />}
            <span>
              {status === "processing" && "Processing..."}
              {status === "complete" && "Analysis Completed"}
              {status === "error" && "Analysis Failed"}
            </span>
          </button>
        ) : (
          <div className="w-80 rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                {status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                {status === "complete" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                <span>
                  {status === "processing" && "AI Analysis Running"}
                  {status === "complete" && "Analysis Completed"}
                  {status === "error" && "Analysis Failed"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={minimize}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Minimize"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 py-3 space-y-3">
              {status === "processing" && (
                <div className="space-y-2">
                  {progress.map((step) => (
                    <div key={step.id} className="flex items-center gap-2 text-xs">
                      {renderStepIcon(step.status)}
                      <span
                        className={
                          step.status === "active"
                            ? "text-blue-600 font-medium"
                            : step.status === "done"
                              ? "text-slate-600"
                              : step.status === "error"
                                ? "text-red-600"
                                : "text-slate-400"
                        }
                      >
                        {step.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {status === "error" && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {status === "complete" && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  Your PDF has been analyzed. Review the extracted data before importing.
                </div>
              )}

              <div className="flex items-center justify-between">
                {status === "processing" && (
                  <span className="text-xs text-slate-400">You can keep working while this runs.</span>
                )}
                {status === "complete" && (
                  <Button size="sm" className="ml-auto" onClick={() => setReviewOpen(true)}>
                    Review Data
                  </Button>
                )}
                {status === "error" && (
                  <Button size="sm" variant="outline" className="ml-auto" onClick={reset}>
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <PdfReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} />
    </>
  )
}
