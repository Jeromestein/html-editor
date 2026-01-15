"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { Printer, RotateCcw, Plus, Trash2, Globe } from "lucide-react"
import { buildSampleData, rehydrateData, type Course, type SampleData, type GradeConversionRow } from "@/lib/report-data"
import { SaveReportDialog, LoadReportDialog } from "../report-manager"
import { calculateStats } from "@/lib/gpa"
import Image from "next/image"
import Link from "next/link"

import { Header } from "./sections/header"
import { Footer } from "./sections/footer"
import { ApplicantInfo } from "./sections/applicant-info"
import { CredentialDetails } from "./sections/credential-details"
import { CourseTable } from "./sections/course-table"
import { GradeConversion } from "./sections/grade-conversion"
import { References } from "./sections/references"
import { Remarks } from "./sections/remarks"
import { Signatures } from "./sections/signatures"
import { AboutAetPage } from "./sections/about-aet-page"
import { EditableInput, EditableTextarea, EditableImage } from "./ui/editable-elements"
import {
  SectionTitle,
  ReportTitle,
  InfoRow, // Kept for now if used by others, but mostly used by ApplicantInfo which is extracted. Wait, ApplicantInfo uses it internally.
  SummaryRow,
  DetailRow,
  DocumentFieldRow
} from "./sections/shared"
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
} from "@/types/report"



// -----------------------------------------------------------------------------
// 2. Pagination logic
// -----------------------------------------------------------------------------

const DEFAULT_ROWS_PER_FIRST_PAGE = 14
const DEFAULT_ROWS_PER_FULL_PAGE = 30

type CoursePage = {
  courses: Course[]
}

type PaginationCounts = {
  first: number
  firstWithTail: number
  full: number
  last: number
}

function paginateCourses(courses: Course[], counts: PaginationCounts): CoursePage[] {
  const pages: CoursePage[] = []
  const remainingCourses = [...courses]
  const firstCount = Math.max(0, counts.first)
  const firstWithTailCount = Math.max(0, counts.firstWithTail)
  const fullCount = Math.max(1, counts.full)
  const lastCount = Math.max(1, counts.last)

  if (remainingCourses.length <= firstWithTailCount) {
    pages.push({
      courses: remainingCourses.splice(0),
    })
    return pages
  }

  const firstPageCourses = remainingCourses.splice(0, Math.min(firstCount, remainingCourses.length))
  pages.push({
    courses: firstPageCourses,
  })

  while (remainingCourses.length > lastCount) {
    const take = Math.min(fullCount, remainingCourses.length - lastCount)
    const pageCourses = remainingCourses.splice(0, take)
    pages.push({
      courses: pageCourses,
    })
  }

  if (remainingCourses.length > 0) {
    pages.push({
      courses: remainingCourses.splice(0),
    })
  }

  return pages
}

type DocumentEntry = {
  document: SampleData["documents"][number]
  index: number
}

type ReportPageData = {
  documents: DocumentEntry[]
  courses: Course[]
  credentialIndex?: number
  showCredentialHeading: boolean
  showApplicantInfo: boolean
  showCredentialTable: boolean
  showDocumentsHeading: boolean
  showDocumentsActions: boolean
  documentsHeading?: string
  showCourseSection: boolean
  showGradeConversion: boolean
  showTotals: boolean
  showSignatures: boolean
  showAboutPage: boolean
  isLastPage: boolean
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items]
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}



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

  const [rowsPerFirstPage, setRowsPerFirstPage] = useState(DEFAULT_ROWS_PER_FIRST_PAGE)
  const [rowsPerFirstPageWithTail, setRowsPerFirstPageWithTail] = useState(DEFAULT_ROWS_PER_FIRST_PAGE)
  const [rowsPerFullPage, setRowsPerFullPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)
  const [rowsPerLastPage, setRowsPerLastPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)
  const courseContentRef = useRef<HTMLDivElement>(null)
  const introContentRef = useRef<HTMLDivElement>(null)
  const tableStartRef = useRef<HTMLDivElement>(null)
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
  const rowRef = useRef<HTMLTableRowElement>(null)
  const tailRef = useRef<HTMLDivElement>(null)
  const documentsListRef = useRef<HTMLUListElement>(null)
  const documentItemRef = useRef<HTMLLIElement>(null)
  const readySentRef = useRef(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [documentsPerPage, setDocumentsPerPage] = useState(() =>
    Math.max(1, data.documents.length)
  )
  const [documentsPerFullPage, setDocumentsPerFullPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)

  const documentEntries = useMemo(
    () => data.documents.map((document, index) => ({ document, index })),
    [data.documents]
  )
  const documentPages = useMemo(() => {
    const pages: DocumentEntry[][] = []
    const entries = [...documentEntries]

    // First page
    if (entries.length > 0) {
      pages.push(entries.splice(0, documentsPerPage))
    }

    // Subsequent pages
    while (entries.length > 0) {
      pages.push(entries.splice(0, documentsPerFullPage))
    }

    return pages
  }, [documentEntries, documentsPerPage, documentsPerFullPage])
  const coursePagesByCredential = useMemo(
    () =>
      data.credentials.map((credential, credentialIndex) => {
        const isLastCredential = credentialIndex === data.credentials.length - 1
        const gradeConversionOverhead = credential.gradeConversion.length + 6 // Header (2) + Table Header (2) + Margins/Gap (2)
        // Reserve space for Grade Conversion AND the Totals row (1 row)
        const lastPageCapacity = Math.max(1, rowsPerFullPage - gradeConversionOverhead - 1)

        // YES: We now reserve space to try and keep Grade Conversion on the same page.
        // We pass a reduced 'last' page capacity. If courses fit within this reduced capacity,
        // paginateCourses will put them there, leaving space for GC.
        return paginateCourses(credential.courses, {
          first: rowsPerFirstPage,
          firstWithTail: rowsPerFirstPageWithTail,
          full: rowsPerFullPage,
          last: lastPageCapacity,
        })
      }),
    [data.credentials, rowsPerFirstPage, rowsPerFirstPageWithTail, rowsPerFullPage]
  )

  const reportPages = useMemo(() => {
    const compiled: ReportPageData[] = []
    const hasDocumentPages = documentEntries.length > 0
    const showDocumentsSection = hasDocumentPages || !readOnly
    const introDocumentPages = hasDocumentPages ? documentPages : [[]]
    introDocumentPages.forEach((documentPage, index) => {
      compiled.push({
        documents: documentPage,
        courses: [],
        showApplicantInfo: index === 0,
        showCredentialHeading: false,
        showCredentialTable: false,
        showDocumentsHeading: showDocumentsSection,
        showDocumentsActions: showDocumentsSection && !readOnly && index === introDocumentPages.length - 1,
        documentsHeading: index === 0 ? "2. Documents" : "Documents (continued)",
        showCourseSection: false,
        showGradeConversion: false, // Intro pages don't show grade conversion
        showTotals: false,
        showSignatures: false,
        showAboutPage: false,
        isLastPage: false,
      })
    })

    data.credentials.forEach((credential, credentialIndex) => {
      const coursePages = coursePagesByCredential[credentialIndex] ?? []
      // If no courses, we still need at least one page for details/conversion
      const effectiveCoursePages = coursePages.length > 0 ? coursePages : [{ courses: [] }]

      const firstCoursePageIndex = effectiveCoursePages.findIndex((page) => page.courses.length > 0)
      const courseSectionIndex = firstCoursePageIndex === -1 ? 0 : firstCoursePageIndex

      effectiveCoursePages.forEach((page, pageIndex) => {
        const isLastOfCredential = pageIndex === effectiveCoursePages.length - 1

        // Determine capacity for this specific page type
        // Note: Logic assumes first page (index 0) uses rowsPerFirstPage, others use rowsPerFullPage.
        // This is an approximation as the actual "First Page" logic in layout effect depends on content.
        // However, for course lists, this matches paginateCourses logic behavior.
        const capacity = pageIndex === 0 ? (rowsPerFirstPage > 0 ? rowsPerFirstPage : DEFAULT_ROWS_PER_FIRST_PAGE) : (rowsPerFullPage > 0 ? rowsPerFullPage : DEFAULT_ROWS_PER_FULL_PAGE)

        const rowsUsed = page.courses.length
        const gradeConversionOverhead = credential.gradeConversion.length + 6 // Header, margins, table rows

        let showGradeConversion = false
        let needsExtraPage = false

        if (isLastOfCredential) {
          // Check if we have space for Grade Conversion overhead plus Totals row (1)
          if (capacity - rowsUsed - 1 >= gradeConversionOverhead) {
            showGradeConversion = true
          } else {
            needsExtraPage = true
          }
        }

        compiled.push({
          documents: [],
          courses: page.courses,
          credentialIndex,
          showApplicantInfo: false,
          showCredentialHeading: pageIndex === 0, // Show details on first page
          showCredentialTable: pageIndex === 0,
          showDocumentsHeading: false,
          showDocumentsActions: false,
          showCourseSection: pageIndex === courseSectionIndex,
          showGradeConversion: showGradeConversion,
          showTotals: isLastOfCredential,
          showSignatures: false,
          showAboutPage: false,
          isLastPage: false,
        })

        if (needsExtraPage) {
          compiled.push({
            documents: [],
            courses: [],
            credentialIndex,
            showApplicantInfo: false,
            showCredentialHeading: false,
            showCredentialTable: false,
            showDocumentsHeading: false,
            showDocumentsActions: false,
            showCourseSection: false,
            showGradeConversion: true, // Show on this new page
            showTotals: false,
            showSignatures: false,
            showAboutPage: false,
            isLastPage: false,
          })
        }
      })
    })

    // Add a separate page for References, Notes, and Signatures
    compiled.push({
      documents: [],
      courses: [],
      credentialIndex: undefined,
      showApplicantInfo: false,
      showCredentialHeading: false,
      showCredentialTable: false,
      showDocumentsHeading: false,
      showDocumentsActions: false,
      showCourseSection: false,
      showGradeConversion: false,
      showTotals: false,
      showSignatures: true,
      showAboutPage: false,
      isLastPage: false,
    })

    // Add "About AET" Page
    compiled.push({
      documents: [],
      courses: [],
      credentialIndex: undefined,
      showApplicantInfo: false,
      showCredentialHeading: false,
      showCredentialTable: false,
      showDocumentsHeading: false,
      showDocumentsActions: false,
      showCourseSection: false,
      showGradeConversion: false,
      showTotals: false,
      showSignatures: false,
      showAboutPage: true,
      isLastPage: true,
    })

    return compiled
  }, [coursePagesByCredential, data.credentials, documentEntries.length, documentPages, readOnly])

  const firstCoursePageIndex = useMemo(() => {
    const pageWithCourses = reportPages.findIndex((page) => page.courses.length > 0)
    if (pageWithCourses !== -1) return pageWithCourses
    return reportPages.findIndex((page) => page.showCourseSection)
  }, [reportPages])
  const measurementPageIndex = firstCoursePageIndex === -1 ? 0 : firstCoursePageIndex

  useEffect(() => {
    if (!onReady) return
    let active = true
    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (active) setFontsReady(true)
        })
        .catch(() => {
          if (active) setFontsReady(true)
        })
    } else {
      setFontsReady(true)
    }
    return () => {
      active = false
    }
  }, [onReady])

  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    if (!onReady) return
    readySentRef.current = false
  }, [data, onReady])

  useLayoutEffect(() => {
    const courseContentEl = courseContentRef.current
    const introContentEl = introContentRef.current
    const startEl = tableStartRef.current
    const headerEl = tableHeaderRef.current
    const rowEl = rowRef.current
    const listEl = documentsListRef.current
    const itemEl = documentItemRef.current
    let rafId = requestAnimationFrame(() => {
      let nextFirst = rowsPerFirstPage
      let nextFirstWithTail = rowsPerFirstPageWithTail
      let nextFull = rowsPerFullPage
      let nextLast = rowsPerLastPage
      let nextDocumentsPerPage = documentsPerPage
      let nextDocumentsPerFullPage = documentsPerFullPage

      if (courseContentEl && startEl && headerEl && rowEl) {
        const contentRect = courseContentEl.getBoundingClientRect()
        const startRect = startEl.getBoundingClientRect()
        const headerRect = headerEl.getBoundingClientRect()
        const rowRect = rowEl.getBoundingClientRect()

        if (contentRect.height > 0 && rowRect.height > 0) {
          const headerOffset = Math.max(0, startRect.top - contentRect.top)
          const safetyPadding = 36
          let tailHeight = 0

          if (tailRef.current) {
            const tailRect = tailRef.current.getBoundingClientRect()
            const tailStyle = window.getComputedStyle(tailRef.current)
            const marginTop = Number.parseFloat(tailStyle.marginTop) || 0
            const marginBottom = Number.parseFloat(tailStyle.marginBottom) || 0
            tailHeight = tailRect.height + marginTop + marginBottom
          }

          const availableFirst = contentRect.height - headerOffset - headerRect.height - safetyPadding
          const availableFirstWithTail = availableFirst - tailHeight
          const availableFull = contentRect.height - headerRect.height - safetyPadding
          const availableLast = availableFull - tailHeight

          nextFirst = Math.max(0, Math.floor(availableFirst / rowRect.height))
          nextFirstWithTail = Math.max(0, Math.floor(availableFirstWithTail / rowRect.height))
          nextFull = Math.max(1, Math.floor(availableFull / rowRect.height))
          nextLast = Math.max(1, Math.floor(availableLast / rowRect.height))

          const overflow = courseContentEl.scrollHeight - contentRect.height
          if (overflow > 0) {
            const overflowRows = Math.ceil(overflow / rowRect.height)
            nextFirst = Math.max(0, nextFirst - overflowRows)
            nextFirstWithTail = Math.max(0, nextFirstWithTail - overflowRows)
          }
        }
      }

      if (introContentEl && listEl && itemEl) {
        const introRect = introContentEl.getBoundingClientRect()
        const listRect = listEl.getBoundingClientRect()
        const itemRect = itemEl.getBoundingClientRect()
        const itemStyle = window.getComputedStyle(itemEl)

        // Increased safety padding to account for browser variabilities and prevent border-line flickering
        // Increased from 12 -> 24 due to font size increase
        const safetyPadding = 24
        const itemMarginTop = Number.parseFloat(itemStyle.marginTop) || 0
        const itemMarginBottom = Number.parseFloat(itemStyle.marginBottom) || 0
        const itemHeight = itemRect.height + itemMarginTop + itemMarginBottom
        const gap = 8 // space-y-2 is 0.5rem = 8px
        const availableDocumentsFirst = introRect.bottom - listRect.top - safetyPadding

        // Capacity formula: N * Height + (N-1) * Gap <= Available
        // N * (Height + Gap) - Gap <= Available
        // N * (Height + Gap) <= Available + Gap
        // N <= (Available + Gap) / (Height + Gap)
        nextDocumentsPerPage = Math.max(1, Math.floor((availableDocumentsFirst + gap) / (itemHeight + gap)))

        // Check if button would fit on the first page
        // We detect this edge case: if (all docs fit) AND (space remaining < button height), then force one less item to ensure stability.
        const totalDocuments = data.documents.length
        if (totalDocuments > 0 && totalDocuments <= nextDocumentsPerPage + 1) {
          // +1 as a safety buffer for comparison logic
          // Increased button height approx to be safe (32px button + margins/padding) -> bumped to 60px for safety
          const buttonHeightApprox = 60

          // Exact height needed for N documents: N * H + (N-1) * G
          const heightForDocs = totalDocuments * itemHeight + Math.max(0, totalDocuments - 1) * gap
          const heightWithButton = heightForDocs + gap + buttonHeightApprox

          if (totalDocuments <= nextDocumentsPerPage && heightWithButton > availableDocumentsFirst) {
            // Not enough space for the button, so push the last item to next page to carry the button with it
            nextDocumentsPerPage = Math.max(1, nextDocumentsPerPage - 1)
          }
        }

        // Reactive Overflow Check: Did we get it wrong?
        // If the content is actually larger than the container, we MUST shrink.
        // This handles cases where our simplistic height arithmetic misses something (like wrapping text).
        const docOverflow = introContentEl.scrollHeight - introRect.height
        if (docOverflow > 0) {
          const overflowRows = Math.ceil(docOverflow / (itemHeight + gap))
          nextDocumentsPerPage = Math.max(1, nextDocumentsPerPage - overflowRows)
        }

        // Calculate full page document capacity
        // Assuming ~60px overhead for Section Title ("Documents (continued)") and margins
        const sectionTitleOverhead = 60
        const availableDocumentsFull = introRect.height - sectionTitleOverhead - safetyPadding
        nextDocumentsPerFullPage = Math.max(1, Math.floor(availableDocumentsFull / itemHeight))
      }

      const changed =
        nextFirst !== rowsPerFirstPage ||
        nextFirstWithTail !== rowsPerFirstPageWithTail ||
        nextFull !== rowsPerFullPage ||
        nextLast !== rowsPerLastPage ||
        nextDocumentsPerPage !== documentsPerPage ||
        nextDocumentsPerFullPage !== documentsPerFullPage

      if (changed) {
        readySentRef.current = false
        setRowsPerFirstPage(nextFirst)
        setRowsPerFirstPageWithTail(nextFirstWithTail)
        setRowsPerFullPage(nextFull)
        setRowsPerLastPage(nextLast)
        setDocumentsPerPage(nextDocumentsPerPage)
        setDocumentsPerFullPage(nextDocumentsPerFullPage)
        return
      }

      if (onReady && fontsReady && !readySentRef.current) {
        readySentRef.current = true
        onReady()
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [
    data,
    documentsPerPage,
    fontsReady,
    onReady,
    rowsPerFirstPage,
    rowsPerFirstPageWithTail,
    rowsPerFullPage,
    rowsPerLastPage,
  ])

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
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full px-6 py-3 flex items-center justify-between shadow-sm no-print">
          <h1 className="font-bold text-blue-900 flex items-center gap-2">
            AET Smart Editor
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-normal">Editable</span>
          </h1>
          <div className="flex gap-2">
            <LoadReportDialog onLoad={(newData) => setData(rehydrateData(newData))} />
            <SaveReportDialog data={data} />
            <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>

            <button
              onClick={handleReset}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm transition-colors"
            >
              <Printer size={18} /> Print / PDF
            </button>
          </div>
        </div>
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <Image
          src="/web-app-manifest-512x512.png"
          alt=""
          width={512}
          height={512}
          className="w-2/3 opacity-[0.03] h-auto"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col" ref={setContentRef}>
        {showApplicantInfo && (
          <>
            <ReportTitle>
              Credential Evaluation Report
            </ReportTitle>

            <ApplicantInfo data={data} updateDataField={updateDataField} readOnly={readOnly} />

            <SectionTitle>1. U.S. Equivalence Summary</SectionTitle>
            <div className="mb-6 text-sm space-y-4">
              {data.credentials.map((cred, idx) => (
                <div key={cred.id} className="border-b border-gray-100 pb-2 last:border-0">
                  <div className="font-bold text-gray-700 mb-1">
                    Credential #{idx + 1}: {cred.awardingInstitution}
                  </div>
                  <SummaryRow label="Equivalency">
                    <EditableTextarea
                      value={cred.equivalenceStatement}
                      onChange={(value) => updateEquivalenceField(idx, "equivalenceStatement", value)}
                      className="font-semibold leading-snug"
                      rows={1}
                      readOnly={readOnly}
                    />
                  </SummaryRow>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <SummaryRow label="U.S. Credits">
                      <EditableInput
                        value={cred.totalCredits}
                        onChange={(value) => updateEquivalenceField(idx, "totalCredits", value)}
                        className="font-semibold"
                        readOnly={readOnly}
                      />
                    </SummaryRow>
                    <SummaryRow label="U.S. GPA">
                      <EditableInput
                        value={cred.gpa}
                        onChange={(value) => updateEquivalenceField(idx, "gpa", value)}
                        className="font-semibold"
                        readOnly={readOnly}
                      />
                    </SummaryRow>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showDocumentsHeading && (
          <>
            {/* Documents section is now Section 2, but only show header on first doc page which usually matches showDocumentsHeading in my new logic */}
            {/* Logic check: I passed showDocumentsHeading=true for all intro pages? No, I passed documentsHeading="2. Documents" for first. */}
            {documentsHeading && <SectionTitle>{documentsHeading}</SectionTitle>}

            {/* Documents Intro Text */}
            {documentsHeading === "2. Documents" && (
              <div className="text-xs text-gray-700 mb-2 italic">
                This evaluation is based on the following documents electronically submitted by the applicant:
              </div>
            )}

            <ul className="list-disc pl-4 space-y-2 text-sm" ref={documentsListRef}>
              {documents.map((entry, index) => (
                <li
                  key={`${entry.document.title}-${entry.index}`}
                  className={`relative ${readOnly ? "" : "pr-5"}`}
                  ref={index === 0 ? documentItemRef : undefined}
                >
                  <EditableInput
                    value={entry.document.title}
                    onChange={(value) => updateDocument(entry.index, "title", value)}
                    className="font-semibold"
                    readOnly={readOnly}
                  />
                  <div className="mt-0.5 space-y-0.5">
                    <DocumentFieldRow label="Issued By">
                      <EditableTextarea
                        value={entry.document.issuedBy}
                        onChange={(value) => updateDocument(entry.index, "issuedBy", value)}
                        rows={1}
                        className="leading-snug"
                        readOnly={readOnly}
                      />
                    </DocumentFieldRow>
                    <div className="grid grid-cols-2 gap-x-6">
                      <DocumentFieldRow label="Date of Issue">
                        <EditableInput
                          value={entry.document.dateIssued}
                          onChange={(value) => updateDocument(entry.index, "dateIssued", value)}
                          readOnly={readOnly}
                        />
                      </DocumentFieldRow>
                      <DocumentFieldRow label="Certificate No.">
                        <EditableInput
                          value={entry.document.certificateNo}
                          onChange={(value) => updateDocument(entry.index, "certificateNo", value)}
                          readOnly={readOnly}
                        />
                      </DocumentFieldRow>
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => deleteDocument(entry.index)}
                      className="no-print absolute right-0 top-0 text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!readOnly && showDocumentsActions && (
              <button
                type="button"
                onClick={addDocument}
                className="no-print mt-2 flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 transition-colors"
              >
                <Plus size={12} /> Add Document
              </button>
            )}
          </>
        )}

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
                // Documents moved out, so pass empty/false for docs here
                documents={[]}
                showDocumentsHeading={false}
                showDocumentsActions={false}
                showCredentialTable={true}
                updateCredentialField={updateCredentialField}
                // These doc props won't be used since showDoc is false
                updateDocument={updateDocument}
                addDocument={addDocument}
                deleteDocument={deleteDocument}
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

            <SectionTitle>{notesNum}. Evaluation Notes</SectionTitle>
            <EditableTextarea
              value={data.evaluationNotes || ""}
              onChange={(value) => updateDataField("evaluationNotes", value)}
              className="text-xs text-gray-500 text-justify mb-4 leading-tight min-h-[3rem]"
              readOnly={readOnly}
            />

            <Remarks />
            <Signatures data={data} updateDataField={updateDataField} readOnly={readOnly} />
          </div>
        )}

        {showAboutPage && <AboutAetPage />}
      </div>

      <Footer pageIndex={pageIndex} totalPages={totalPages} refNo={data.refNo} />
    </div>
  )
}

