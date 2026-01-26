"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles } from "lucide-react"
import { usePdfProcess } from "@/contexts/pdf-process-context"

const formatReferencesCount = (references: unknown) => {
  if (typeof references !== "string") return 0
  return references.split("\n").filter((line) => line.trim()).length
}

type PdfReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PdfReviewDialog({ open, onOpenChange }: PdfReviewDialogProps) {
  const { result, reset } = usePdfProcess()

  const handleImport = () => {
    if (!result?.data) return
    window.dispatchEvent(new CustomEvent("aet:pdf-import", { detail: result.data }))
    reset()
    onOpenChange(false)
  }

  if (!result) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Review PDF Data
          </DialogTitle>
          <DialogDescription>
            Review the extracted data before importing it into the report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">PDF analyzed successfully!</span>
          </div>

          {result.warnings.length > 0 && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm font-medium text-yellow-800">Warnings:</p>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {result.data.name && (
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50 w-1/3">Name</td>
                    <td className="px-3 py-2">{result.data.name}</td>
                  </tr>
                )}
                {result.data.dob && (
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50">Date of Birth</td>
                    <td className="px-3 py-2">{result.data.dob}</td>
                  </tr>
                )}
                {result.data.country && (
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50">Country</td>
                    <td className="px-3 py-2">{result.data.country}</td>
                  </tr>
                )}
                {result.data.credentials && (
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50">Credentials</td>
                    <td className="px-3 py-2">{result.data.credentials.length} credential(s) found</td>
                  </tr>
                )}
                {result.data.credentials?.map((cred, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 font-medium bg-gray-50 pl-6">• Credential #{index + 1}</td>
                    <td className="px-3 py-2">
                      {cred.awardingInstitution} ({cred.courses?.length || 0} courses)
                    </td>
                  </tr>
                ))}
                {result.data.documents && (
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50">Documents</td>
                    <td className="px-3 py-2">{result.data.documents.length} document(s) found</td>
                  </tr>
                )}
                {result.data.references && (
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50">References</td>
                    <td className="px-3 py-2">{formatReferencesCount(result.data.references)} reference(s) found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleImport}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
