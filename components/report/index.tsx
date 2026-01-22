/**
 * Report Editor - Main Entry Point
 * 
 * A modular credential evaluation report editor with print support.
 * 
 * Architecture:
 * - Hooks: `useReportData`, `usePagination`, `useDynamicMeasure`
 * - Sections: Pure UI components for each report section
 * - UI: Reusable components (ReportPage, EditableInput, etc.)
 * 
 * @see README.md for full documentation
 */

"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { type SampleData, buildSampleData, rehydrateData } from "@/lib/report-data"

import { ReportToolbar } from "./ui/report-toolbar"
import { ReportPage } from "./ui/report-page"
import { PdfUploadDialog } from "@/components/pdf-upload-dialog"
import { SaveReportDialog, LoadReportDialog } from "./ui/report-dialogs"

import { useDynamicMeasure } from "./hooks/use-dynamic-measure"
import { usePagination } from "./hooks/use-pagination"
import { useReportData } from "./hooks/use-report-data"

type ReportEditorProps = {
  initialData?: SampleData
  initialName?: string
  initialId?: string
  readOnly?: boolean
  showToolbar?: boolean
  onReady?: () => void
}

export default function ReportEditor({
  initialData,
  initialName = "Unnamed Draft",
  initialId,
  readOnly = false,
  showToolbar = true,
  onReady,
}: ReportEditorProps) {
  // Use the centralized data management hook
  const {
    data,
    setData,
    reportMeta,
    setReportName,
    setReportMeta,
    updateEquivalenceField,
    updateGradeConversion,
    updateDataField,
    updateCredentialField,
    updateCourse,
    updateDocument,
    deleteDocument,
    deleteCourse,
    addCourse,
    addDocument,
    handleReset: _handleReset,
    rehydrate,
  } = useReportData({ initialData, readOnly, initialName, initialId: initialId || undefined })

  const { measurements, refs } = useDynamicMeasure({ data, onReady })
  const reportPages = usePagination({ data, readOnly, measurements })

  const {
    courseContentRef,
    introContentRef,
    tableStartRef,
    tableHeaderRef,
    rowRef,
    tailRef,
    documentsListRef,
    documentItemRef,
  } = refs

  // PDF import dialog state
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)

  // Save/Load dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (reportMeta.isDirty) {
        e.preventDefault()
        // Legacy browsers require returnValue to be set
        // Using empty string as modern browsers ignore custom messages anyway
        return ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [reportMeta.isDirty])

  const handleImportPdf = useCallback((importedData: Partial<SampleData>) => {
    // Merge imported data with existing data
    setData((prev) => ({
      ...prev,
      ...importedData,
      // Merge credentials if both exist
      credentials: importedData.credentials?.length
        ? importedData.credentials
        : prev.credentials,
      // Merge documents if both exist
      documents: importedData.documents?.length
        ? importedData.documents
        : prev.documents,
    }))
    setReportMeta({ isDirty: true })
    setPdfDialogOpen(false)
  }, [setData, setReportMeta])

  // Handle Load with unsaved changes warning
  const handleLoadClick = useCallback(() => {
    if (reportMeta.isDirty) {
      if (!window.confirm("You have unsaved changes. Loading a new report will discard them. Continue?")) {
        return
      }
    }
    setLoadDialogOpen(true)
  }, [reportMeta.isDirty])

  // Sync document title with report name
  useEffect(() => {
    if (reportMeta.name && reportMeta.name !== "Unnamed Draft") {
      document.title = `${reportMeta.name} - AET Smart Editor`
    }
  }, [reportMeta.name])

  // Handle successful load - navigate to URL
  const handleLoadComplete = useCallback((loadedData: SampleData, meta: { id: string; name: string }) => {
    // rehydrate(loadedData, { id: meta.id, name: meta.name }) // No need to rehydrate locally, we will navigate
    setLoadDialogOpen(false)
    // Navigate to the report URL
    const slug = encodeURIComponent(meta.name)
    window.location.href = `/${slug}`
  }, [])

  // Handle successful save - update URL
  const handleSaveComplete = useCallback((savedId: string, savedName: string) => {
    setReportMeta({ id: savedId, name: savedName, isDirty: false })
    setSaveDialogOpen(false)

    // Update URL without full reload if possible, but for simplicity/correctness with server components:
    // If the name changed, we should push the new URL.
    const newPath = `/${encodeURIComponent(savedName)}`
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath)
      // Also update document title manually since we aren't reloading
      document.title = `${savedName} - AET Smart Editor`
    }
  }, [setReportMeta])

  const firstCoursePageIndex = useMemo(() => {
    const pageWithCourses = reportPages.findIndex((page) => page.courses.length > 0)
    if (pageWithCourses !== -1) return pageWithCourses
    return reportPages.findIndex((page) => page.showCourseSection)
  }, [reportPages])
  const measurementPageIndex = firstCoursePageIndex === -1 ? 0 : firstCoursePageIndex

  const handleReset = useCallback(() => {
    if (typeof window !== "undefined" && window.confirm("Reset data to sample?")) {
      // If we are on a specific report URL, redirect to home for a fresh start
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      } else {
        // Already at home, just reset state
        setData(buildSampleData())
        setReportMeta({ id: null, name: "Unnamed Draft", isDirty: false })
      }
    }
  }, [setData, setReportMeta])

  const handleRestoreVersion = useCallback((restoredData: SampleData) => {
    setData(rehydrateData(restoredData))
    setReportMeta({ isDirty: true })
  }, [setData, setReportMeta])

  // Need to verify this hook usage for Reset, previously it was passed to ReportToolbar
  // We need to override the handleReset from useReportData if we want the redirection logic?
  // Actually, useReportData returns handleReset. We should probably wrap it or pass this new one.
  // The logic in useReportData is:
  /*
    const handleReset = useCallback(() => {
        if (readOnly) return
        if (typeof window !== "undefined" && window.confirm("Reset data to sample?")) {
            setData(buildSampleData())
            setReportMetaState({ id: null, name: "Unnamed Draft", isDirty: false })
        }
    }, [readOnly])
  */
  // My new handleReset handles the redirect. I should pass THIS one to ReportToolbar.


  const handlePrint = () => window.print()

  const handleDownloadDocx = useCallback(async () => {
    try {
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate DOCX')
      }

      const blob = await response.blob()

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'Evaluation_Report.docx'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading DOCX:', error)
      alert('Failed to generate DOCX. Please try again.')
    }
  }, [data])

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center font-sans text-gray-900 pb-10 print:bg-white print:pb-0">
      {/* PDF Import Dialog */}
      <PdfUploadDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        onImport={handleImportPdf}
      />

      {/* Save/Load Dialogs */}
      <SaveReportDialog
        data={data}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        defaultName={reportMeta.name}
        currentId={reportMeta.id}
        onSaved={handleSaveComplete}
      />
      <LoadReportDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        onLoad={handleLoadComplete}
      />

      {/* Table and editable element styles */}
      <style>{`
        .editable-cell:hover {
          background-color: #f3f4f6;
        }

        .course-table tbody tr,
        .course-table td {
          height: 18px;
        }

        .course-table input {
          height: 18px;
          line-height: 18px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      {showToolbar && (
        <ReportToolbar
          onPrint={handlePrint}
          onImportPdf={() => setPdfDialogOpen(true)}
          onDownloadDocx={handleDownloadDocx}
          reportMeta={reportMeta}
          onNameChange={setReportName}
          onSave={() => setSaveDialogOpen(true)}
          onLoad={handleLoadClick}
          onReset={handleReset}
          onRestoreVersion={handleRestoreVersion}
        />
      )}


      <div className="page-stack mt-8 print:mt-0">
        {reportPages.map((pageData, index) => {
          const isFirstCoursePage = index === measurementPageIndex
          return (
            <ReportPage
              key={`report-page-${index}`}
              pageIndex={index}
              totalPages={reportPages.length}
              data={data}
              credentialIndex={pageData.credentialIndex}
              documents={pageData.documents}
              documentsHeading={pageData.documentsHeading}
              showDocumentsHeading={pageData.showDocumentsHeading}
              showDocumentsActions={pageData.showDocumentsActions}
              showCredentialHeading={pageData.showCredentialHeading}
              showApplicantInfo={pageData.showApplicantInfo}
              showCredentialTable={pageData.showCredentialTable}
              showCourseSection={pageData.showCourseSection}
              showGradeConversion={pageData.showGradeConversion}
              showTotals={pageData.showTotals}
              pageCourses={pageData.courses}
              showSignatures={pageData.showSignatures}
              showAboutPage={pageData.showAboutPage}
              isLastPage={pageData.isLastPage}
              updateEquivalenceField={updateEquivalenceField}
              updateDataField={updateDataField}
              updateCredentialField={updateCredentialField}
              updateCourse={updateCourse}
              updateGradeConversion={updateGradeConversion}
              deleteCourse={deleteCourse}
              updateDocument={updateDocument}
              addDocument={addDocument}
              addCourse={addCourse}
              deleteDocument={deleteDocument}
              readOnly={readOnly}
              introContentRef={index === 0 ? introContentRef : undefined}
              courseContentRef={isFirstCoursePage ? courseContentRef : undefined}
              tableStartRef={isFirstCoursePage ? tableStartRef : undefined}
              tableHeaderRef={isFirstCoursePage ? tableHeaderRef : undefined}
              rowRef={isFirstCoursePage ? rowRef : undefined}
              documentsListRef={index === 0 ? documentsListRef : undefined}
              documentItemRef={index === 0 ? documentItemRef : undefined}
              tailRef={pageData.showSignatures ? tailRef : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
