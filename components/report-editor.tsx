"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { FileDown, Printer, RotateCcw, Plus, Trash2 } from "lucide-react"
import { buildSampleData, type Course, type SampleData } from "@/lib/report-data"

// -----------------------------------------------------------------------------
// 1. Type definitions and sample data
// -----------------------------------------------------------------------------

type TopLevelField = "refNo" | "name" | "dob" | "country" | "date" | "purpose"

type EditableSection = "credential" | "equivalence"

type CourseField = "year" | "name" | "level" | "credits" | "grade"

type DocumentField = keyof SampleData["credential"]["documents"][number]

type DocumentItem = SampleData["credential"]["documents"][number]

type UpdateField = <T extends EditableSection>(
  section: T,
  field: keyof SampleData[T],
  value: string
) => void

type UpdateDataField = (field: TopLevelField, value: string) => void

type UpdateCourse = (id: number, field: CourseField, value: string) => void

type UpdateDocument = (index: number, field: DocumentField, value: string) => void

type DeleteDocument = (index: number) => void

// -----------------------------------------------------------------------------
// 2. Pagination logic
// -----------------------------------------------------------------------------

const DEFAULT_ROWS_PER_FIRST_PAGE = 14
const DEFAULT_ROWS_PER_FULL_PAGE = 30

type PageData = {
  type: "first-page" | "document-page" | "course-continuation"
  courses: Course[]
  documentIndices: number[]
  documentTitle?: string
  showCourseTitle: boolean
  showCourseTable: boolean
  isLastPage: boolean
}

type PaginationCounts = {
  first: number
  firstWithTail: number
  full: number
  last: number
}

type CoursePageData = {
  type: "first-page" | "course-continuation"
  courses: Course[]
  isLastPage: boolean
}

function paginateCourses(courses: Course[], counts: PaginationCounts): CoursePageData[] {
  const pages: CoursePageData[] = []
  const remainingCourses = [...courses]
  const firstCount = Math.max(0, counts.first)
  const firstWithTailCount = Math.max(0, counts.firstWithTail)
  const fullCount = Math.max(1, counts.full)
  const lastCount = Math.max(1, counts.last)

  if (remainingCourses.length <= firstWithTailCount) {
    pages.push({
      type: "first-page",
      courses: remainingCourses.splice(0),
      isLastPage: true,
    })
    return pages
  }

  const firstPageCourses = remainingCourses.splice(0, Math.min(firstCount, remainingCourses.length))
  pages.push({
    type: "first-page",
    courses: firstPageCourses,
    isLastPage: false,
  })

  while (remainingCourses.length > lastCount) {
    const take = Math.min(fullCount, remainingCourses.length - lastCount)
    const pageCourses = remainingCourses.splice(0, take)
    pages.push({
      type: "course-continuation",
      courses: pageCourses,
      isLastPage: false,
    })
  }

  if (remainingCourses.length > 0) {
    pages.push({
      type: "course-continuation",
      courses: remainingCourses.splice(0),
      isLastPage: true,
    })
  }

  return pages
}

function paginateDocuments(
  documentIndices: number[],
  itemHeights: number[],
  baseHeight: number,
  availableHeight: number
): number[][] {
  if (documentIndices.length === 0) return []
  const pages: number[][] = []
  const capacity = Math.max(0, availableHeight - baseHeight)
  let remaining = capacity
  let current: number[] = []

  documentIndices.forEach((docIndex, orderIndex) => {
    const height = itemHeights[orderIndex] ?? 0
    if (current.length > 0 && height > remaining) {
      pages.push(current)
      current = []
      remaining = capacity
    }

    current.push(docIndex)
    remaining = remaining - height
  })

  if (current.length > 0) {
    pages.push(current)
  }

  return pages
}

// -----------------------------------------------------------------------------
// 3. Editable inputs
// -----------------------------------------------------------------------------

type EditableInputProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  readOnly?: boolean
}

const EditableInput = ({ value, onChange, className = "", placeholder = "", readOnly = false }: EditableInputProps) => (
  <input
    type="text"
    value={value}
    onChange={(event) => {
      if (readOnly) return
      onChange(event.target.value)
    }}
    readOnly={readOnly}
    className={`bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:bg-blue-50 transition-colors w-full px-1 ${className}`}
    placeholder={placeholder}
  />
)

type EditableTextareaProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  rows?: number
  readOnly?: boolean
}

const EditableTextarea = ({
  value,
  onChange,
  className = "",
  rows = 3,
  readOnly = false,
}: EditableTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  })

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => {
        if (readOnly) return
        onChange(event.target.value)
      }}
      rows={rows}
      readOnly={readOnly}
      className={`bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:bg-blue-50 transition-colors w-full p-1 resize-none ${className}`}
    />
  )
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
  const [isExporting, setIsExporting] = useState(false)
  const [rowsPerFirstPage, setRowsPerFirstPage] = useState(DEFAULT_ROWS_PER_FIRST_PAGE)
  const [rowsPerFirstPageWithTail, setRowsPerFirstPageWithTail] = useState(DEFAULT_ROWS_PER_FIRST_PAGE)
  const [rowsPerFullPage, setRowsPerFullPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)
  const [rowsPerLastPage, setRowsPerLastPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)
  const [documentsOnFirstPage, setDocumentsOnFirstPage] = useState(true)
  const [documentPages, setDocumentPages] = useState<number[][]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const courseContentRef = useRef<HTMLDivElement>(null)
  const documentContentRef = useRef<HTMLDivElement>(null)
  const tableStartRef = useRef<HTMLDivElement>(null)
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
  const rowRef = useRef<HTMLTableRowElement>(null)
  const tailRef = useRef<HTMLDivElement>(null)
  const documentStartRef = useRef<HTMLDivElement>(null)
  const documentSectionRef = useRef<HTMLDivElement>(null)
  const documentListRef = useRef<HTMLUListElement>(null)
  const documentItemRefs = useRef<Array<HTMLLIElement | null>>([])
  const readySentRef = useRef(false)
  const [fontsReady, setFontsReady] = useState(false)
  const getDocumentItemRef = (index: number) => (node: HTMLLIElement | null) => {
    documentItemRefs.current[index] = node
  }

  const coursePages = useMemo(
    () =>
      paginateCourses(data.courses, {
        first: rowsPerFirstPage,
        firstWithTail: rowsPerFirstPageWithTail,
        full: rowsPerFullPage,
        last: rowsPerLastPage,
      }),
    [data.courses, rowsPerFirstPage, rowsPerFirstPageWithTail, rowsPerFullPage, rowsPerLastPage]
  )

  const allDocumentIndices = useMemo(
    () => data.credential.documents.map((_, index) => index),
    [data.credential.documents]
  )

  const normalizedDocumentPages = useMemo(() => {
    if (data.credential.documents.length === 0) return []
    if (documentsOnFirstPage) return [allDocumentIndices]
    return documentPages.length > 0 ? documentPages : [allDocumentIndices]
  }, [allDocumentIndices, data.credential.documents.length, documentPages, documentsOnFirstPage])

  const pages = useMemo(() => {
    const nextPages: PageData[] = []
    const hasCourses = data.courses.length > 0

    if (documentsOnFirstPage) {
      const firstCoursePage = coursePages[0] ?? { courses: [], isLastPage: true, type: "first-page" }
      nextPages.push({
        type: "first-page",
        courses: firstCoursePage.courses,
        documentIndices: allDocumentIndices,
        documentTitle: "Documents",
        showCourseTitle: true,
        showCourseTable: true,
        isLastPage: false,
      })

      coursePages.slice(1).forEach((page) => {
        nextPages.push({
          type: "course-continuation",
          courses: page.courses,
          documentIndices: [],
          showCourseTitle: false,
          showCourseTable: true,
          isLastPage: false,
        })
      })
    } else {
      nextPages.push({
        type: "first-page",
        courses: [],
        documentIndices: [],
        showCourseTitle: false,
        showCourseTable: false,
        isLastPage: false,
      })

      normalizedDocumentPages.forEach((documentPage, index) => {
        nextPages.push({
          type: "document-page",
          courses: [],
          documentIndices: documentPage,
          documentTitle: index === 0 ? "Documents" : "Documents (continued)",
          showCourseTitle: false,
          showCourseTable: false,
          isLastPage: false,
        })
      })

      coursePages.forEach((page, index) => {
        nextPages.push({
          type: "course-continuation",
          courses: page.courses,
          documentIndices: [],
          showCourseTitle: index === 0,
          showCourseTable: true,
          isLastPage: false,
        })
      })

      if (!hasCourses && coursePages.length === 0) {
        nextPages.push({
          type: "course-continuation",
          courses: [],
          documentIndices: [],
          showCourseTitle: true,
          showCourseTable: true,
          isLastPage: false,
        })
      }
    }

    return nextPages.map((page, index) => ({
      ...page,
      isLastPage: index === nextPages.length - 1,
    }))
  }, [
    coursePages,
    data.courses.length,
    data.credential.documents,
    documentsOnFirstPage,
    normalizedDocumentPages,
    allDocumentIndices,
  ])

  const firstCoursePageIndex = useMemo(() => pages.findIndex((page) => page.showCourseTitle), [pages])
  const measurementPageIndex = firstCoursePageIndex === -1 ? 0 : firstCoursePageIndex
  const firstDocumentPageIndex = useMemo(() => pages.findIndex((page) => page.documentIndices.length > 0), [pages])
  const hasCourses = data.courses.length > 0

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
    const contentEl = contentRef.current
    if (!contentEl) return

    let rafId = requestAnimationFrame(() => {
      const safetyPadding = 4
      const documentCount = data.credential.documents.length

      if (documentCount > 0 && documentStartRef.current && documentSectionRef.current && documentListRef.current) {
        const documentStartRect = documentStartRef.current.getBoundingClientRect()
        const contentRect = contentEl.getBoundingClientRect()
        const documentStartOffset = Math.max(0, documentStartRect.top - contentRect.top)

        const itemHeights = data.credential.documents.map((_, index) => {
          const item = documentItemRefs.current[index]
          if (!item) return 0
          const rect = item.getBoundingClientRect()
          const style = window.getComputedStyle(item)
          const marginTop = Number.parseFloat(style.marginTop) || 0
          const marginBottom = Number.parseFloat(style.marginBottom) || 0
          return rect.height + marginTop + marginBottom
        })

        if (itemHeights.some((height) => height <= 0)) {
          return
        }

        const sectionRect = documentSectionRef.current.getBoundingClientRect()
        const sectionItems = Array.from(documentSectionRef.current.querySelectorAll("[data-document-item]"))
        const sectionItemsHeight = sectionItems.reduce((total, item) => {
          const rect = item.getBoundingClientRect()
          const style = window.getComputedStyle(item)
          const marginTop = Number.parseFloat(style.marginTop) || 0
          const marginBottom = Number.parseFloat(style.marginBottom) || 0
          return total + rect.height + marginTop + marginBottom
        }, 0)

        const baseHeight = Math.max(0, sectionRect.height - sectionItemsHeight)
        const totalDocumentHeight = baseHeight + itemHeights.reduce((sum, height) => sum + height, 0)
        const availableFirst = contentRect.height - documentStartOffset - safetyPadding
        const nextDocumentsOnFirstPage = totalDocumentHeight <= availableFirst

        if (nextDocumentsOnFirstPage !== documentsOnFirstPage) {
          readySentRef.current = false
          setDocumentsOnFirstPage(nextDocumentsOnFirstPage)
          return
        }

        const documentContentEl = documentsOnFirstPage ? contentEl : documentContentRef.current
        if (documentContentEl) {
          const documentContentRect = documentContentEl.getBoundingClientRect()
          const sectionOffset = Math.max(0, sectionRect.top - documentContentRect.top)
          const availableDocHeight = documentContentRect.height - sectionOffset - safetyPadding
          const nextDocumentPages = documentsOnFirstPage
            ? [allDocumentIndices]
            : paginateDocuments(allDocumentIndices, itemHeights, baseHeight, availableDocHeight)
          const pagesChanged =
            nextDocumentPages.length !== documentPages.length ||
            nextDocumentPages.some((page, index) =>
              page.length !== documentPages[index]?.length ||
              page.some((docIndex, docPosition) => docIndex !== documentPages[index]?.[docPosition])
            )

          if (pagesChanged) {
            readySentRef.current = false
            setDocumentPages(nextDocumentPages)
            return
          }
        }
      } else if (documentCount === 0 && documentPages.length > 0) {
        readySentRef.current = false
        setDocumentPages([])
        return
      } else if (documentCount === 0 && !documentsOnFirstPage) {
        readySentRef.current = false
        setDocumentsOnFirstPage(true)
        return
      }

      const startEl = tableStartRef.current
      const headerEl = tableHeaderRef.current
      const rowEl = rowRef.current
      const courseContentEl = courseContentRef.current ?? contentEl
      if (startEl && headerEl && rowEl && courseContentEl) {
        const contentRect = courseContentEl.getBoundingClientRect()
        const startRect = startEl.getBoundingClientRect()
        const headerRect = headerEl.getBoundingClientRect()
        const rowRect = rowEl.getBoundingClientRect()

        if (contentRect.height <= 0 || rowRect.height <= 0) return

        const headerOffset = Math.max(0, startRect.top - contentRect.top)
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

        let nextFirst = Math.max(0, Math.floor(availableFirst / rowRect.height))
        let nextFirstWithTail = Math.max(0, Math.floor(availableFirstWithTail / rowRect.height))
        const nextFull = Math.max(1, Math.floor(availableFull / rowRect.height))
        const nextLast = Math.max(1, Math.floor(availableLast / rowRect.height))

        const overflow = courseContentEl.scrollHeight - contentRect.height
        if (overflow > 0) {
          const overflowRows = Math.ceil(overflow / rowRect.height)
          nextFirst = Math.max(0, nextFirst - overflowRows)
          nextFirstWithTail = Math.max(0, nextFirstWithTail - overflowRows)
        }

        const changed =
          nextFirst !== rowsPerFirstPage ||
          nextFirstWithTail !== rowsPerFirstPageWithTail ||
          nextFull !== rowsPerFullPage ||
          nextLast !== rowsPerLastPage

        if (changed) {
          readySentRef.current = false
          setRowsPerFirstPage(nextFirst)
          setRowsPerFirstPageWithTail(nextFirstWithTail)
          setRowsPerFullPage(nextFull)
          setRowsPerLastPage(nextLast)
          return
        }
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
    allDocumentIndices,
    documentPages,
    documentsOnFirstPage,
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

  const handleExportPdf = async () => {
    if (readOnly || isExporting) return
    setIsExporting(true)
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("PDF export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${data.refNo || "report"}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      window.alert("PDF export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const updateField: UpdateField = (section, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateDataField: UpdateDataField = (field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateCourse: UpdateCourse = (id, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      courses: prev.courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)),
    }))
  }

  const updateDocument: UpdateDocument = (index, field, value) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credential: {
        ...prev.credential,
        documents: prev.credential.documents.map((document, docIndex) =>
          docIndex === index ? { ...document, [field]: value } : document
        ),
      },
    }))
  }

  const deleteDocument: DeleteDocument = (index) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credential: {
        ...prev.credential,
        documents: prev.credential.documents.filter((_, docIndex) => docIndex !== index),
      },
    }))
  }

  const deleteCourse = (id: number) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course.id !== id),
    }))
  }

  const addCourse = () => {
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
      courses: [...prev.courses, newCourse],
    }))
  }

  const addDocument = () => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      credential: {
        ...prev.credential,
        documents: [
          ...prev.credential.documents,
          {
            title: "Document Title",
            issuedBy: "",
            dateIssued: "",
            certificateNo: "N/A",
          },
        ],
      },
    }))
  }

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center font-sans text-gray-900 pb-10 print:bg-white print:pb-0">
      <style>{`
        :root {
          --page-width: 8.5in;
          --page-height: 11in;
          --page-padding: 0.75in;
          --page-header-height: 0.8in;
          --page-footer-height: 0.7in;
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
      `}</style>

      {showToolbar && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full px-6 py-3 flex items-center justify-between shadow-sm no-print">
          <h1 className="font-bold text-blue-900 flex items-center gap-2">
            AET Smart Editor
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-normal">Editable</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={addCourse}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add Course
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-bold shadow-sm transition-colors disabled:opacity-60"
              disabled={isExporting}
            >
              <FileDown size={16} /> {isExporting ? "Generating..." : "Controlled PDF"}
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
        {pages.map((pageData, index) => (
          <ReportPage
            key={`${pageData.type}-${index}`}
            pageIndex={index}
            totalPages={pages.length}
            type={pageData.type}
            data={data}
            pageCourses={pageData.courses}
            pageDocumentIndices={pageData.documentIndices}
            documentTitle={pageData.documentTitle}
            showCourseTitle={pageData.showCourseTitle}
            showCourseTable={pageData.showCourseTable}
            isLastPage={pageData.isLastPage}
            updateField={updateField}
            updateDataField={updateDataField}
            updateCourse={updateCourse}
            deleteCourse={deleteCourse}
            updateDocument={updateDocument}
            addDocument={addDocument}
            deleteDocument={deleteDocument}
            readOnly={readOnly}
            hasCourses={hasCourses}
            contentRef={index === 0 ? contentRef : undefined}
            courseContentRef={index === firstCoursePageIndex ? courseContentRef : undefined}
            documentContentRef={index === firstDocumentPageIndex ? documentContentRef : undefined}
            documentStartRef={index === 0 ? documentStartRef : undefined}
            documentSectionRef={index === firstDocumentPageIndex ? documentSectionRef : undefined}
            documentListRef={index === firstDocumentPageIndex ? documentListRef : undefined}
            documentItemRef={getDocumentItemRef}
            tableStartRef={index === firstCoursePageIndex ? tableStartRef : undefined}
            tableHeaderRef={index === measurementPageIndex ? tableHeaderRef : undefined}
            rowRef={index === measurementPageIndex ? rowRef : undefined}
            tailRef={pageData.isLastPage ? tailRef : undefined}
          />
        ))}
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
  type: PageData["type"]
  data: SampleData
  pageCourses: Course[]
  pageDocumentIndices: number[]
  documentTitle?: string
  showCourseTitle: boolean
  showCourseTable: boolean
  isLastPage: boolean
  updateField: UpdateField
  updateDataField: UpdateDataField
  updateCourse: UpdateCourse
  deleteCourse: (id: number) => void
  updateDocument: UpdateDocument
  addDocument: () => void
  deleteDocument: DeleteDocument
  readOnly: boolean
  hasCourses: boolean
  contentRef?: RefObject<HTMLDivElement | null>
  courseContentRef?: RefObject<HTMLDivElement | null>
  documentContentRef?: RefObject<HTMLDivElement | null>
  documentStartRef?: RefObject<HTMLDivElement | null>
  documentSectionRef?: RefObject<HTMLDivElement | null>
  documentListRef?: RefObject<HTMLUListElement | null>
  documentItemRef?: (index: number) => (node: HTMLLIElement | null) => void
  tableStartRef?: RefObject<HTMLDivElement | null>
  tableHeaderRef?: RefObject<HTMLTableSectionElement | null>
  rowRef?: RefObject<HTMLTableRowElement | null>
  tailRef?: RefObject<HTMLDivElement | null>
}

function ReportPage({
  pageIndex,
  totalPages,
  type,
  data,
  pageCourses,
  pageDocumentIndices,
  documentTitle,
  showCourseTitle,
  showCourseTable,
  isLastPage,
  updateField,
  updateDataField,
  updateCourse,
  deleteCourse,
  updateDocument,
  addDocument,
  deleteDocument,
  readOnly,
  hasCourses,
  contentRef,
  courseContentRef,
  documentContentRef,
  documentStartRef,
  documentSectionRef,
  documentListRef,
  documentItemRef,
  tableStartRef,
  tableHeaderRef,
  rowRef,
  tailRef,
}: ReportPageProps) {
  const shouldShowCourseTable = showCourseTable && (pageCourses.length > 0 || !hasCourses)
  const pageDocuments = pageDocumentIndices.map((index) => data.credential.documents[index])

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

      <div
        className="flex-1 min-h-0 overflow-hidden flex flex-col"
        ref={contentRef ?? documentContentRef ?? courseContentRef}
      >
        {type === "first-page" && (
          <>
            <h1 className="text-center text-xl font-bold uppercase underline decoration-double decoration-1 underline-offset-4 text-blue-900 mb-6 mt-3 font-serif">
              Credential Evaluation Report
            </h1>

            <ApplicantInfo data={data} updateDataField={updateDataField} readOnly={readOnly} />

            <SectionTitle>1. U.S. Equivalence Summary</SectionTitle>
            <div className="mb-6 text-xs space-y-1">
              <SummaryRow label="U.S. Equivalency">
                <EditableTextarea
                  value={data.equivalence.summary}
                  onChange={(value) => updateField("equivalence", "summary", value)}
                  className="font-semibold leading-snug"
                  rows={1}
                  readOnly={readOnly}
                />
              </SummaryRow>
              <SummaryRow label="U.S. Credits">
                <EditableInput
                  value={data.equivalence.totalCredits}
                  onChange={(value) => updateField("equivalence", "totalCredits", value)}
                  className="font-semibold"
                  readOnly={readOnly}
                />
              </SummaryRow>
              <SummaryRow label="U.S. GPA">
                <EditableInput
                  value={data.equivalence.gpa}
                  onChange={(value) => updateField("equivalence", "gpa", value)}
                  className="font-semibold"
                  readOnly={readOnly}
                />
              </SummaryRow>
            </div>

            <SectionTitle>2. Credential Details</SectionTitle>
            <CredentialDetailsTable data={data.credential} updateField={updateField} readOnly={readOnly} />
            <div ref={documentStartRef} />
            {pageDocuments.length > 0 && (
              <DocumentsSection
                documents={pageDocuments}
                documentIndices={pageDocumentIndices}
                updateDocument={updateDocument}
                addDocument={addDocument}
                deleteDocument={deleteDocument}
                readOnly={readOnly}
                title={documentTitle}
                sectionRef={documentSectionRef}
                listRef={documentListRef}
                itemRef={documentItemRef}
              />
            )}

            {showCourseTitle && (
              <>
                <SectionTitle>3. Course-by-Course Analysis</SectionTitle>
                <div ref={tableStartRef} />
              </>
            )}
          </>
        )}

        {type === "document-page" && (
          <>
            <SectionTitle>2. Credential Details (continued)</SectionTitle>
            {pageDocuments.length > 0 && (
              <DocumentsSection
                documents={pageDocuments}
                documentIndices={pageDocumentIndices}
                updateDocument={updateDocument}
                addDocument={addDocument}
                deleteDocument={deleteDocument}
                readOnly={readOnly}
                title={documentTitle}
                sectionRef={documentSectionRef}
                listRef={documentListRef}
                itemRef={documentItemRef}
              />
            )}
          </>
        )}

        {type === "course-continuation" && showCourseTitle && (
          <>
            <SectionTitle>3. Course-by-Course Analysis</SectionTitle>
            <div ref={tableStartRef} />
          </>
        )}

        {shouldShowCourseTable && (
          <CourseTable
            courses={pageCourses}
            updateCourse={updateCourse}
            deleteCourse={deleteCourse}
            readOnly={readOnly}
            headerRef={tableHeaderRef}
            rowRef={rowRef}
            showEmptyState={!hasCourses}
          />
        )}

        {isLastPage && (
          <div className="mt-4" ref={tailRef}>
            <div className="border-t border-gray-300 pt-2 mb-4">
              <div className="flex justify-between font-bold text-sm items-center">
                <span>TOTALS</span>
                <div className="flex gap-8 items-center">
                  <div className="flex items-center">
                    <span>Credits:</span>
                    <EditableInput
                      value={data.equivalence.totalCredits}
                      onChange={(value) => updateField("equivalence", "totalCredits", value)}
                      className="w-16 text-right font-bold"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="flex items-center">
                    <span>GPA:</span>
                    <EditableInput
                      value={data.equivalence.gpa}
                      onChange={(value) => updateField("equivalence", "gpa", value)}
                      className="w-12 text-right font-bold"
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </div>
            </div>

            <SectionTitle>4. Scales & References</SectionTitle>
            <References />
            <Remarks />
            <Signatures />
          </div>
        )}
      </div>

      <Footer pageIndex={pageIndex} totalPages={totalPages} refNo={data.refNo} />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Subcomponents
// -----------------------------------------------------------------------------

const Header = () => (
  <header className="report-header flex justify-between items-end border-b-2 border-blue-900 pb-2 shrink-0">
    <div>
      <div className="text-3xl font-black text-blue-900 tracking-wider font-serif">AET</div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
        American Evaluation & Translation Services
      </div>
    </div>

  </header>
)

type FooterProps = {
  pageIndex: number
  totalPages: number
  refNo: string
}

const Footer = ({ pageIndex, totalPages, refNo }: FooterProps) => (
  <footer className="report-footer border-t border-gray-300 pt-2 flex justify-between text-[9px] text-gray-400 mt-auto shrink-0">
    <span>
      Page {pageIndex + 1} of {totalPages}
    </span>
  </footer>
)

type SectionTitleProps = {
  children: ReactNode
}

const SectionTitle = ({ children }: SectionTitleProps) => (
  <h2 className="font-sans font-bold text-blue-900 uppercase text-xs border-b border-gray-200 mb-2 pb-1 mt-4">
    {children}
  </h2>
)

type ApplicantInfoProps = {
  data: SampleData
  updateDataField: UpdateDataField
  readOnly?: boolean
}

const ApplicantInfo = ({ data, updateDataField, readOnly = false }: ApplicantInfoProps) => (
  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-xs border-b border-gray-200 pb-4">
    <InfoRow label="Name of Applicant" labelClassName="uppercase tracking-wide">
      <EditableInput
        value={data.name}
        onChange={(value) => updateDataField("name", value)}
        className="font-semibold"
        readOnly={readOnly}
      />
    </InfoRow>
    <InfoRow label="Evaluation ID" labelClassName="uppercase tracking-wide">
      <EditableInput
        value={data.refNo}
        onChange={(value) => updateDataField("refNo", value)}
        className="font-semibold"
        readOnly={readOnly}
      />
    </InfoRow>
    <InfoRow label="Date of Birth" labelClassName="uppercase tracking-wide">
      <EditableInput
        value={data.dob}
        onChange={(value) => updateDataField("dob", value)}
        className="font-semibold"
        readOnly={readOnly}
      />
    </InfoRow>
    <InfoRow label="Date of Evaluation" labelClassName="uppercase tracking-wide">
      <EditableInput
        value={data.date}
        onChange={(value) => updateDataField("date", value)}
        className="font-semibold"
        readOnly={readOnly}
      />
    </InfoRow>
    <div className="col-span-2">
      <InfoRow label="Purpose of evaluation" labelClassName="uppercase tracking-wide">
        <EditableInput
          value={data.purpose}
          onChange={(value) => updateDataField("purpose", value)}
          className="font-semibold"
          readOnly={readOnly}
        />
      </InfoRow>
    </div>
    <div className="col-span-2">
      <InfoRow label="Country of Education" labelClassName="uppercase tracking-wide">
        <EditableInput
          value={data.country}
          onChange={(value) => updateDataField("country", value)}
          className="font-semibold"
          readOnly={readOnly}
        />
      </InfoRow>
    </div>
  </div>
)

type InfoRowProps = {
  label: string
  children: ReactNode
  labelClassName?: string
}

const InfoRow = ({ label, children, labelClassName = "" }: InfoRowProps) => (
  <div className="grid grid-cols-[9.5rem_1fr] items-center gap-2">
    <span className={`font-bold text-gray-500 ${labelClassName}`}>{label}:</span>
    <div>{children}</div>
  </div>
)

type SummaryRowProps = {
  label: string
  children: ReactNode
}

const SummaryRow = ({ label, children }: SummaryRowProps) => (
  <div className="grid grid-cols-[9.5rem_1fr] items-start gap-2">
    <span className="font-bold text-gray-600">{label}:</span>
    <div>{children}</div>
  </div>
)

type DetailRowProps = {
  label: string
  children: ReactNode
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <tr>
    <td className="py-1 pr-2 align-top font-semibold text-gray-600 w-[18rem] border-b border-gray-200">
      {label}:
    </td>
    <td className="py-1 align-top border-b border-gray-200">{children}</td>
  </tr>
)

type DocumentFieldRowProps = {
  label: string
  children: ReactNode
}

const DocumentFieldRow = ({ label, children }: DocumentFieldRowProps) => (
  <div className="grid grid-cols-[6.5rem_1fr] items-start gap-2">
    <span className="font-semibold text-gray-600">{label}:</span>
    <div>{children}</div>
  </div>
)

type CredentialDetailsProps = {
  data: SampleData["credential"]
  updateField: UpdateField
  readOnly?: boolean
}

const CredentialDetailsTable = ({ data, updateField, readOnly = false }: CredentialDetailsProps) => (
  <table className="w-full text-xs border-collapse mb-3 table-fixed">
    <tbody>
      <DetailRow label="Name of Awarding Institution">
        <EditableInput
          value={data.awardingInstitution}
          onChange={(value) => updateField("credential", "awardingInstitution", value)}
          className="font-semibold"
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Name of Awarding Institution in Native Language (Chinese Simplified)">
        <EditableInput
          value={data.awardingInstitutionNative}
          onChange={(value) => updateField("credential", "awardingInstitutionNative", value)}
          className="text-gray-600"
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Country">
        <EditableInput value={data.country} onChange={(value) => updateField("credential", "country", value)} readOnly={readOnly} />
      </DetailRow>
      <DetailRow label="Admission Requirements">
        <EditableTextarea
          value={data.admissionRequirements}
          onChange={(value) => updateField("credential", "admissionRequirements", value)}
          rows={1}
          className="leading-snug"
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Program">
        <EditableTextarea
          value={data.program}
          onChange={(value) => updateField("credential", "program", value)}
          rows={1}
          className="leading-snug"
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Grants Access to">
        <EditableInput
          value={data.grantsAccessTo}
          onChange={(value) => updateField("credential", "grantsAccessTo", value)}
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Standard Program Length">
        <EditableInput
          value={data.standardProgramLength}
          onChange={(value) => updateField("credential", "standardProgramLength", value)}
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Years Attended">
        <EditableInput
          value={data.yearsAttended}
          onChange={(value) => updateField("credential", "yearsAttended", value)}
          readOnly={readOnly}
        />
      </DetailRow>
      <DetailRow label="Year of Graduation">
        <EditableInput
          value={data.yearOfGraduation}
          onChange={(value) => updateField("credential", "yearOfGraduation", value)}
          readOnly={readOnly}
        />
      </DetailRow>
    </tbody>
  </table>
)

type DocumentsSectionProps = {
  documents: DocumentItem[]
  documentIndices: number[]
  updateDocument: UpdateDocument
  addDocument: () => void
  deleteDocument: DeleteDocument
  readOnly?: boolean
  title?: string
  sectionRef?: RefObject<HTMLDivElement | null>
  listRef?: RefObject<HTMLUListElement | null>
  itemRef?: (index: number) => (node: HTMLLIElement | null) => void
}

const DocumentsSection = ({
  documents,
  documentIndices,
  updateDocument,
  addDocument,
  deleteDocument,
  readOnly = false,
  title,
  sectionRef,
  listRef,
  itemRef,
}: DocumentsSectionProps) => (
  <div className="border-t border-gray-300 pt-2" ref={sectionRef}>
    {title && <div className="text-[10px] font-bold uppercase text-gray-700 mb-1">{title}</div>}
    <div className="text-[10px] font-semibold text-gray-700 mb-1">
      This evaluation is based on the following documents electronically submitted by the applicant:
    </div>
    <ul className="list-disc pl-4 space-y-2" ref={listRef}>
      {documents.map((document, index) => {
        const documentIndex = documentIndices[index]
        return (
          <li
            key={`${document.title}-${documentIndex}`}
            className={`relative ${readOnly ? "" : "pr-5"}`}
            data-document-item
            ref={itemRef ? itemRef(documentIndex) : undefined}
          >
            <EditableInput
              value={document.title}
              onChange={(value) => updateDocument(documentIndex, "title", value)}
              className="font-semibold"
              readOnly={readOnly}
            />
            <div className="mt-0.5 space-y-0.5">
              <DocumentFieldRow label="Issued By">
                <EditableTextarea
                  value={document.issuedBy}
                  onChange={(value) => updateDocument(documentIndex, "issuedBy", value)}
                  rows={1}
                  className="leading-snug"
                  readOnly={readOnly}
                />
              </DocumentFieldRow>
              <DocumentFieldRow label="Date of Issue">
                <EditableInput
                  value={document.dateIssued}
                  onChange={(value) => updateDocument(documentIndex, "dateIssued", value)}
                  readOnly={readOnly}
                />
              </DocumentFieldRow>
              <DocumentFieldRow label="Certificate No.">
                <EditableInput
                  value={document.certificateNo}
                  onChange={(value) => updateDocument(documentIndex, "certificateNo", value)}
                  readOnly={readOnly}
                />
              </DocumentFieldRow>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => deleteDocument(documentIndex)}
                className="no-print absolute right-0 top-0 text-gray-300 hover:text-red-500 transition-colors"
                title="Remove Document"
              >
                <Trash2 size={12} />
              </button>
            )}
          </li>
        )
      })}
    </ul>
    {!readOnly && (
      <button
        type="button"
        onClick={addDocument}
        className="no-print mt-2 flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 transition-colors"
      >
        <Plus size={12} /> Add Document
      </button>
    )}
  </div>
)

type CourseTableProps = {
  courses: Course[]
  updateCourse: UpdateCourse
  deleteCourse: (id: number) => void
  readOnly?: boolean
  headerRef?: RefObject<HTMLTableSectionElement | null>
  rowRef?: RefObject<HTMLTableRowElement | null>
  showEmptyState?: boolean
}

const CourseTable = ({
  courses,
  updateCourse,
  deleteCourse,
  readOnly = false,
  headerRef,
  rowRef,
  showEmptyState = true,
}: CourseTableProps) => {
  if (!courses || courses.length === 0) {
    if (!showEmptyState) return null
    return <div className="text-xs text-gray-400 italic p-2 text-center">No courses listed on this page.</div>
  }

  const showActions = !readOnly

  return (
    <table className="w-full text-[10px] text-center border-collapse border border-gray-300 table-fixed">
      <thead className="bg-gray-100 print:bg-gray-50" ref={headerRef}>
        <tr>
          <th className="border border-gray-300 p-1 w-14">Year</th>
          <th className="border border-gray-300 p-1 text-left">Course Title</th>
          <th className="border border-gray-300 p-1 w-8">Lvl</th>
          <th className="border border-gray-300 p-1 w-10">Credits</th>
          <th className="border border-gray-300 p-1 w-10">Grade</th>
          {showActions && <th className="border border-gray-300 p-1 w-6 no-print"></th>}
        </tr>
      </thead>
      <tbody>
        {courses.map((course, index) => (
          <tr key={course.id} className="group hover:bg-blue-50" ref={index === 0 ? rowRef : undefined}>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.year}
                onChange={(value) => updateCourse(course.id, "year", value)}
                className="text-center h-full"
                readOnly={readOnly}
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.name}
                onChange={(value) => updateCourse(course.id, "name", value)}
                className="text-left px-2 h-full"
                readOnly={readOnly}
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.level}
                onChange={(value) => updateCourse(course.id, "level", value)}
                className="text-center h-full"
                readOnly={readOnly}
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.credits}
                onChange={(value) => updateCourse(course.id, "credits", value)}
                className="text-center h-full"
                readOnly={readOnly}
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.grade}
                onChange={(value) => updateCourse(course.id, "grade", value)}
                className="text-center h-full"
                readOnly={readOnly}
              />
            </td>
            {showActions && (
              <td className="border border-gray-300 p-0 no-print">
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="w-full h-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Row"
                >
                  <Trash2 size={10} />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const References = () => (
  <div className="flex gap-4 text-[9px] mb-4 mt-2">
    <div className="w-1/2">
      <table className="w-full text-center border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-50">Grade Scale</th>
            <th className="border border-gray-300 bg-gray-50">US Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-0.5">80-100</td>
            <td className="border border-gray-300 p-0.5">A</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-0.5">70-79</td>
            <td className="border border-gray-300 p-0.5">B</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-0.5">60-69</td>
            <td className="border border-gray-300 p-0.5">C</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="w-1/2">
      <ul className="list-disc pl-4 space-y-1 text-gray-600">
        <li>AACRAO EDGE Database</li>
        <li>Ministry of Education of Canada</li>
        <li>Official Transcripts</li>
      </ul>
    </div>
  </div>
)

const Remarks = () => (
  <div className="text-[9px] text-gray-500 text-justify mb-4 leading-tight">
    <strong>Remarks:</strong> This report is advisory in nature and is not binding upon any institution or agency. It is
    based on the analysis of documents submitted by the applicant. AET is an Endorsed Member of the Association of
    International Credential Evaluators (AICE).
  </div>
)

const Signatures = () => (
  <div className="flex justify-between items-end mt-4">
    <div className="text-center">
      <div className="w-32 border-b border-black mb-1"></div>
      <div className="font-bold text-[10px]">Senior Evaluator</div>
    </div>
    <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center text-[9px] text-gray-300 font-bold uppercase select-none">
      Official Seal
    </div>
  </div>
)
