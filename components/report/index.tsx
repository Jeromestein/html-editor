"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { Plus, Trash2, Globe } from "lucide-react"
import { buildSampleData, rehydrateData, type Course, type SampleData, type GradeConversionRow } from "@/lib/report-data"
import { calculateStats } from "@/lib/gpa"
import Image from "next/image"
import { Watermark } from "./sections/watermark"

import { Header } from "./sections/header"
import { Footer } from "./sections/footer"
import { ApplicantInfo } from "./sections/applicant-info"
import { CredentialDetails } from "./sections/credential-details"
import { CourseTable } from "./sections/course-table"
import { GradeConversion } from "./sections/grade-conversion"
import { DocumentsList } from "./sections/documents-list"
import { References } from "./sections/references"
import { Notes } from "./sections/notes"
import { Signatures } from "./sections/signatures"
import { Seal } from "./sections/seal"
import { AboutAetPage } from "./sections/about-aet-page"
import { EditableInput, EditableTextarea, EditableImage } from "./ui/editable-elements"
import { ReportToolbar } from "./ui/report-toolbar"
import { EquivalenceSummary } from "./sections/equivalence-summary"
import {
  SectionTitle,
  ReportTitle,
  SummaryRow,
} from "./ui/shared"
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

// -----------------------------------------------------------------------------
// Single page
// -----------------------------------------------------------------------------

type ReportPageProps = {
  pageIndex: number
  totalPages: number
  data: SampleData
  credentialIndex?: number
  documents: DocumentEntry[]
  documentsHeading?: string
  showCredentialHeading: boolean
  showDocumentsHeading: boolean
  showDocumentsActions: boolean
  showApplicantInfo: boolean
  showCredentialTable: boolean
  showCourseSection: boolean
  showGradeConversion: boolean
  showTotals: boolean
  showSignatures: boolean
  showAboutPage: boolean
  pageCourses: Course[]
  isLastPage: boolean
  updateEquivalenceField: UpdateEquivalenceField
  updateDataField: UpdateDataField
  updateCredentialField: UpdateCredentialField
  updateCourse: UpdateCourse
  updateGradeConversion: UpdateGradeConversion
  deleteCourse: (credentialIndex: number, id: number) => void
  updateDocument: UpdateDocument
  addDocument: () => void
  addCourse: (credentialIndex: number) => void
  deleteDocument: DeleteDocument
  readOnly: boolean
  introContentRef?: RefObject<HTMLDivElement | null>
  courseContentRef?: RefObject<HTMLDivElement | null>
  tableStartRef?: RefObject<HTMLDivElement | null>
  tableHeaderRef?: RefObject<HTMLTableSectionElement | null>
  rowRef?: RefObject<HTMLTableRowElement | null>
  documentsListRef?: RefObject<HTMLUListElement | null>
  documentItemRef?: RefObject<HTMLLIElement | null>
  tailRef?: RefObject<HTMLDivElement | null>
}

function ReportPage({
  pageIndex,
  totalPages,
  data,
  credentialIndex,
  documents,
  documentsHeading,
  showCredentialHeading,
  showDocumentsHeading,
  showDocumentsActions,
  showApplicantInfo,
  showCredentialTable,
  showCourseSection,
  showGradeConversion,
  showTotals,
  showSignatures,
  showAboutPage,
  pageCourses,
  isLastPage,
  updateEquivalenceField,
  updateDataField,
  updateCredentialField,
  updateCourse,
  updateGradeConversion,
  deleteCourse,
  updateDocument,
  addDocument,
  addCourse,
  deleteDocument,
  readOnly,
  introContentRef,
  courseContentRef,
  tableStartRef,
  tableHeaderRef,
  rowRef,
  documentsListRef,
  documentItemRef,
  tailRef,
}: ReportPageProps) {
  const credential = typeof credentialIndex === "number" ? data.credentials[credentialIndex] : undefined
  const credentialHasCourses = Boolean(credential?.courses.length)
  const showCourseTable = pageCourses.length > 0 || (!credentialHasCourses && showCourseSection)

  // Calculate dynamic section numbers
  // 1. Summary
  // 2. Documents
  // 3+. Credentials...
  const baseSectionNumber = 3
  const credentialSectionIndex = typeof credentialIndex === "number" ? credentialIndex : 0

  const credentialDetailsNum = baseSectionNumber + (credentialSectionIndex * 3)
  const courseAnalysisNum = credentialDetailsNum + 1
  const gradeConversionNum = credentialDetailsNum + 2

  const totalSections = baseSectionNumber + (data.credentials.length * 3)
  const referencesNum = totalSections
  const notesNum = totalSections + 1

  const handleUpdateCourse = (id: number, field: CourseField, value: string) => {
    if (credentialIndex === undefined) return
    updateCourse(credentialIndex, id, field, value)
  }
  const handleDeleteCourse = (id: number) => {
    if (credentialIndex === undefined) return
    deleteCourse(credentialIndex, id)
  }



  const setContentRef = (node: HTMLDivElement | null) => {
    if (courseContentRef) {
      courseContentRef.current = node
    }
    if (introContentRef) {
      introContentRef.current = node
    }
  }

  return (
    <div
      className="report-page shadow-xl print:shadow-none bg-white relative flex flex-col"
      style={{
        breakAfter: isLastPage ? "auto" : "page",
        pageBreakAfter: isLastPage ? "auto" : "always",
        overflow: "hidden",
      }}
    >
      <Header />

      {/* Watermark in page center */}
      <Watermark />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col" ref={setContentRef}>
        {showApplicantInfo && (
          <>
            <ReportTitle>
              Credential Evaluation Report
            </ReportTitle>

            <ApplicantInfo data={data} updateDataField={updateDataField} readOnly={readOnly} />

            <EquivalenceSummary
              data={data}
              updateEquivalenceField={updateEquivalenceField}
              updateCredentialField={updateCredentialField}
              readOnly={readOnly}
            />

          </>
        )}

        <DocumentsList
          documents={documents}
          documentsHeading={documentsHeading}
          showDocumentsHeading={showDocumentsHeading}
          showDocumentsActions={showDocumentsActions}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          addDocument={addDocument}
          readOnly={readOnly}
          documentsListRef={documentsListRef}
          documentItemRef={documentItemRef}
        />

        {/* Credential Content */}
        {credential && (
          <>
            {showCredentialHeading && (
              <SectionTitle>
                {credentialDetailsNum}. Credential Details: <span className="text-gray-600 normal-case ml-1">Credential #{(credentialIndex ?? 0) + 1}</span>
              </SectionTitle>
            )}

            {showCredentialTable && (
              <CredentialDetails
                credential={credential}
                credentialIndex={credentialIndex}
                showCredentialTable={true}
                updateCredentialField={updateCredentialField}
                readOnly={readOnly}
              />
            )}

            {showCourseSection && (
              <>
                <SectionTitle>{courseAnalysisNum}. Course-by-Course Analysis: <span className="text-gray-600 normal-case ml-1">Credential #{(credentialIndex ?? 0) + 1}</span></SectionTitle>
                <div ref={tableStartRef} />
              </>
            )}

            {showCourseTable && (
              <CourseTable
                courses={pageCourses}
                updateCourse={handleUpdateCourse}
                deleteCourse={handleDeleteCourse}
                readOnly={readOnly}
                headerRef={tableHeaderRef}
                rowRef={rowRef}
                showEmptyState={!credentialHasCourses}
                showTotals={showTotals}
                totalCredits={credential?.totalCredits}
                gpa={credential?.gpa}
                onUpdateTotalCredits={(value) => updateEquivalenceField(credentialIndex!, "totalCredits", value)}
                onUpdateGpa={(value) => updateEquivalenceField(credentialIndex!, "gpa", value)}
                onAddCourse={() => addCourse(credentialIndex!)}
              />
            )}
            {showGradeConversion && (
              <>
                <SectionTitle>{gradeConversionNum}. Grade Conversion: <span className="text-gray-600 normal-case ml-1">Credential #{(credentialIndex ?? 0) + 1}</span></SectionTitle>
                <GradeConversion
                  rows={credential.gradeConversion}
                  onUpdate={(rowIndex, field, value) => updateGradeConversion(credentialIndex!, rowIndex, field, value)}
                  readOnly={readOnly}
                />
              </>
            )}
          </>
        )}

        {showSignatures && (
          <div className="mt-4" ref={tailRef}>
            <SectionTitle>{referencesNum}. References</SectionTitle>
            <References />

            <Notes
              evaluationNotes={data.evaluationNotes}
              updateDataField={updateDataField}
              readOnly={readOnly}
              sectionNum={notesNum}
            />
            <Signatures data={data} updateDataField={updateDataField} readOnly={readOnly} />
            <Seal />
          </div>
        )}

        {showAboutPage && <AboutAetPage />}
      </div>

      <Footer pageIndex={pageIndex} totalPages={totalPages} refNo={data.refNo} />
    </div>
  )
}

