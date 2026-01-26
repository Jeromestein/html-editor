"use client"

import { useCallback, useRef, useState } from "react"
import { FileUp, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePdfProcess } from "@/contexts/pdf-process-context"

type PdfUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PdfUploadDialog({ open, onOpenChange }: PdfUploadDialogProps) {
  const { isProcessing, startProcessing } = usePdfProcess()
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  const handleFile = useCallback(
    async (file: File) => {
      if (isProcessing) return
      onOpenChange(false)
      await startProcessing(file)
    },
    [isProcessing, onOpenChange, startProcessing]
  )

  const handleDrag = useCallback((event: React.DragEvent) => {
    if (isProcessing) return
    event.preventDefault()
    event.stopPropagation()
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true)
    } else if (event.type === "dragleave") {
      setDragActive(false)
    }
  }, [isProcessing])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      if (isProcessing) return
      event.preventDefault()
      event.stopPropagation()
      setDragActive(false)

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        handleFile(event.dataTransfer.files[0])
      }
    },
    [handleFile, isProcessing]
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isProcessing) return
      if (event.target.files && event.target.files[0]) {
        handleFile(event.target.files[0])
      }
    },
    [handleFile, isProcessing]
  )

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

        <div className="py-4">
          {isProcessing ? (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              AI Analysis in progress, please wait. You can continue editing while we process your PDF.
            </div>
          ) : (
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
                disabled={isProcessing}
              />
              <FileUp className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Click to upload</span> or
                drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF files only, max 10MB</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
