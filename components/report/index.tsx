"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react"
import { buildSampleData, rehydrateData, type Course, type SampleData, type GradeConversionRow } from "@/lib/report-data"
import { calculateStats } from "@/lib/gpa"


import { EditableInput, EditableTextarea, EditableImage } from "./ui/editable-elements"
import { ReportToolbar } from "./ui/report-toolbar"
import { EquivalenceSummary } from "./sections/equivalence-summary"
import { ReportPage } from "./ui/report-page"

import {
  TopLevelField,
  CourseField,
  CredentialField,
  GradeConversionField,
  DocumentField,
  UpdateEquivalenceField,
  UpdateCredentialField,
  UpdateGradeConversion,
  UpdateDataField,
  UpdateCourse,
  UpdateDocument,
  DeleteDocument,
  UpdateCourseRow
} from "./types"
import { ReportPageData, DocumentEntry } from "./hooks/use-pagination"




import { useDynamicMeasure } from "./hooks/use-dynamic-measure"
import { usePagination } from "./hooks/use-pagination"





// -----------------------------------------------------------------------------
// 4. Main editor
// -----------------------------------------------------------------------------

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
  const [data, setData] = useState<SampleData>(() => initialData ?? buildSampleData())



  const { measurements, refs } = useDynamicMeasure({ data, onReady })
  const reportPages = usePagination({ data, readOnly, measurements })

  const {
    rowsPerFirstPage,
    rowsPerFirstPageWithTail,
    rowsPerFullPage,
    rowsPerLastPage,
    documentsPerPage,
    documentsPerFullPage
  } = measurements

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

  const handleReset = () => {
    if (readOnly) return
    if (window.confirm("Reset data to sample?")) {
      setData(buildSampleData())
    }
  }



  const updateEquivalenceField: UpdateEquivalenceField = (credentialIndex, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((cred, index) =>
        index === credentialIndex
          ? {
            ...cred,
            [field]: value,
          }
          : cred
      ),
    }))
  }



  const updateGradeConversion: UpdateGradeConversion = (credentialIndex, rowIndex, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((cred, index) =>
        index === credentialIndex
          ? {
            ...cred,
            gradeConversion: cred.gradeConversion.map((row, rIndex) =>
              rIndex === rowIndex ? { ...row, [field]: value } : row
            ),
          }
          : cred
      ),
    }))
  }

  const updateDataField: UpdateDataField = (field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateCredentialField: UpdateCredentialField = (credentialIndex, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((credential, index) =>
        index === credentialIndex
          ? {
            ...credential,
            [field]: value,
          }
          : credential
      ),
    }))
  }

  const updateCourse: UpdateCourse = (credentialIndex, id, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((credential, index) => {
        if (index !== credentialIndex) return credential
        const courses = credential.courses.map((course) =>
          course.id === id ? { ...course, [field]: value } : course
        )
        const { totalCredits, gpa } = calculateStats(courses)
        return {
          ...credential,
          courses,
          totalCredits,
          gpa,
        }
      }),
    }))
  }

  const updateDocument: UpdateDocument = (index, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((document, docIndex) =>
        docIndex === index ? { ...document, [field]: value } : document
      ),
    }))
  }

  const deleteDocument: DeleteDocument = (index) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, docIndex) => docIndex !== index),
    }))
  }

  const deleteCourse = (credentialIndex: number, id: number) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((credential, index) => {
        if (index !== credentialIndex) return credential
        const courses = credential.courses.filter((course) => course.id !== id)
        const { totalCredits, gpa } = calculateStats(courses)
        return {
          ...credential,
          courses,
          totalCredits,
          gpa,
        }
      }),
    }))
  }

  const addCourse = (credentialIndex: number) => {
    if (readOnly) return
    const newCourse: Course = {
      id: Date.now(),
      year: "202X",
      name: "New Course Name",
      level: "L",
      credits: "3.00",
      grade: "A",
    }

    setData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((credential, index) => {
        if (index !== credentialIndex) return credential
        const courses = [...credential.courses, newCourse]
        const { totalCredits, gpa } = calculateStats(courses)
        return {
          ...credential,
          courses,
          totalCredits,
          gpa,
        }
      }),
    }))
  }

  const addDocument = () => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      documents: [
        ...prev.documents,
        {
          title: "Document Title",
          issuedBy: "",
          dateIssued: "",
          certificateNo: "N/A",
        },
      ],
    }))
  }

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center font-sans text-gray-900 pb-10 print:bg-white print:pb-0">
      <style>{`
        :root {
          --page-width: 8.5in;
          --page-height: 11in;
          --page-padding: 0.45in 0.6in;
          --page-header-height: 0.7in;
          --page-footer-height: 0.5in;
          --page-gap: 0.4in;
        }

        .report-page {
          width: var(--page-width);
          height: var(--page-height);
          padding: var(--page-padding);
          box-sizing: border-box;
        }

        .page-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--page-gap);
        }

        .report-header {
          height: var(--page-header-height);
        }

        .report-footer {
          height: var(--page-footer-height);
        }

        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0;
          }

          body {
            margin: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background-color: white !important;
          }

          .no-print {
            display: none !important;
          }

          .page-stack {
            display: block;
            gap: 0 !important;
          }

          input::placeholder,
          textarea::placeholder {
            color: transparent;
          }
        }

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
          onLoad={(newData) => setData(rehydrateData(newData))}
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


