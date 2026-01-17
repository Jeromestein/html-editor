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

import { useMemo } from "react"
import { type SampleData } from "@/lib/report-data"

import { ReportToolbar } from "./ui/report-toolbar"
import { ReportPage } from "./ui/report-page"

import { useDynamicMeasure } from "./hooks/use-dynamic-measure"
import { usePagination } from "./hooks/use-pagination"
import { useReportData } from "./hooks/use-report-data"

type ReportEditorProps = {
  initialData?: SampleData
  readOnly?: boolean
  showToolbar?: boolean
  onReady?: () => void
}

export default function ReportEditor({
  initialData,
  readOnly = false,
  showToolbar = true,
  onReady,
}: ReportEditorProps) {
  // Use the centralized data management hook
  const {
    data,
    setData,
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
    handleReset,
    rehydrate,
  } = useReportData({ initialData, readOnly })

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


  const firstCoursePageIndex = useMemo(() => {
    const pageWithCourses = reportPages.findIndex((page) => page.courses.length > 0)
    if (pageWithCourses !== -1) return pageWithCourses
    return reportPages.findIndex((page) => page.showCourseSection)
  }, [reportPages])
  const measurementPageIndex = firstCoursePageIndex === -1 ? 0 : firstCoursePageIndex

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center font-sans text-gray-900 pb-10 print:bg-white print:pb-0">
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
          data={data}
          onLoad={(newData) => rehydrate(newData)}
          onReset={handleReset}
          onPrint={handlePrint}
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


