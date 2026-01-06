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

type UpdateField = <T extends EditableSection>(
  section: T,
  field: keyof SampleData[T],
  value: string
) => void

type UpdateDataField = (field: TopLevelField, value: string) => void

type UpdateCourse = (id: number, field: CourseField, value: string) => void

// -----------------------------------------------------------------------------
// 2. Pagination logic
// -----------------------------------------------------------------------------

const DEFAULT_ROWS_PER_FIRST_PAGE = 14
const DEFAULT_ROWS_PER_FULL_PAGE = 30

type PageData = {
  type: "first-page" | "course-continuation"
  courses: Course[]
  isLastPage: boolean
}

type PaginationCounts = {
  first: number
  firstWithTail: number
  full: number
  last: number
}

function paginateCourses(courses: Course[], counts: PaginationCounts): PageData[] {
  const pages: PageData[] = []
  const remainingCourses = [...courses]
  const firstCount = Math.max(1, counts.first)
  const firstWithTailCount = Math.max(1, counts.firstWithTail)
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
}: EditableTextareaProps) => (
  <textarea
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
  const contentRef = useRef<HTMLDivElement>(null)
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
  const rowRef = useRef<HTMLTableRowElement>(null)
  const tailRef = useRef<HTMLDivElement>(null)
  const readySentRef = useRef(false)
  const [fontsReady, setFontsReady] = useState(false)

  const pages = useMemo(
    () =>
      paginateCourses(data.courses, {
        first: rowsPerFirstPage,
        firstWithTail: rowsPerFirstPageWithTail,
        full: rowsPerFullPage,
        last: rowsPerLastPage,
      }),
    [data.courses, rowsPerFirstPage, rowsPerFirstPageWithTail, rowsPerFullPage, rowsPerLastPage]
  )

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
    const headerEl = tableHeaderRef.current
    const rowEl = rowRef.current
    if (!contentEl || !headerEl || !rowEl) return

    const contentRect = contentEl.getBoundingClientRect()
    const headerRect = headerEl.getBoundingClientRect()
    const rowRect = rowEl.getBoundingClientRect()

    if (contentRect.height <= 0 || rowRect.height <= 0) return

    const headerOffset = headerRect.top - contentRect.top
    const safetyPadding = 4
    let tailHeight = 0

    if (tailRef.current) {
      const tailRect = tailRef.current.getBoundingClientRect()
      const tailStyle = window.getComputedStyle(tailRef.current)
      const marginTop = Number.parseFloat(tailStyle.marginTop) || 0
      const marginBottom = Number.parseFloat(tailStyle.marginBottom) || 0
      tailHeight = tailRect.height + marginTop + marginBottom
    }

    const nextFirst = Math.max(
      1,
      Math.floor((contentRect.height - headerOffset - headerRect.height - safetyPadding) / rowRect.height)
    )
    const nextFirstWithTail = Math.max(
      1,
      Math.floor(
        (contentRect.height - headerOffset - headerRect.height - tailHeight - safetyPadding) / rowRect.height
      )
    )
    const nextFull = Math.max(
      1,
      Math.floor((contentRect.height - headerRect.height - safetyPadding) / rowRect.height)
    )
    const nextLast = Math.max(
      1,
      Math.floor((contentRect.height - headerRect.height - tailHeight - safetyPadding) / rowRect.height)
    )

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

    if (onReady && fontsReady && !readySentRef.current) {
      readySentRef.current = true
      onReady()
    }
  }, [
    data,
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

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center font-sans text-gray-900 pb-10 print:bg-white print:pb-0">
      <style>{`
        :root {
          --page-width: 8.5in;
          --page-height: 11in;
          --page-padding: 0.75in;
          --page-header-height: 0.8in;
          --page-footer-height: 0.8in;
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
            isLastPage={pageData.isLastPage}
            updateField={updateField}
            updateDataField={updateDataField}
            updateCourse={updateCourse}
            deleteCourse={deleteCourse}
            readOnly={readOnly}
            contentRef={index === 0 ? contentRef : undefined}
            tableHeaderRef={index === 0 ? tableHeaderRef : undefined}
            rowRef={index === 0 ? rowRef : undefined}
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
  isLastPage: boolean
  updateField: UpdateField
  updateDataField: UpdateDataField
  updateCourse: UpdateCourse
  deleteCourse: (id: number) => void
  readOnly: boolean
  contentRef?: RefObject<HTMLDivElement | null>
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
  isLastPage,
  updateField,
  updateDataField,
  updateCourse,
  deleteCourse,
  readOnly,
  contentRef,
  tableHeaderRef,
  rowRef,
  tailRef,
}: ReportPageProps) {
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

      <div className="flex-1 overflow-hidden flex flex-col" ref={contentRef}>
        {type === "first-page" && (
          <>
            <h1 className="text-center text-xl font-bold uppercase underline decoration-double decoration-1 underline-offset-4 text-blue-900 mb-6 mt-3 font-serif">
              Credential Evaluation Report
            </h1>

            <ApplicantInfo data={data} updateDataField={updateDataField} readOnly={readOnly} />

            <SectionTitle>1. U.S. Equivalence Summary</SectionTitle>
            <div className="mb-6 bg-blue-50 p-2 border-l-4 border-blue-600 print:bg-transparent print:border-gray-300 print:border group hover:bg-blue-100 transition-colors">
              <EditableTextarea
                value={data.equivalence.summary}
                onChange={(value) => updateField("equivalence", "summary", value)}
                className="font-bold font-serif text-lg leading-snug bg-transparent"
                rows={2}
                readOnly={readOnly}
              />
              <div className="grid grid-cols-2 gap-2 mt-1">
                <EditableInput
                  value={data.equivalence.major}
                  onChange={(value) => updateField("equivalence", "major", value)}
                  className="font-serif text-sm font-bold"
                  readOnly={readOnly}
                />
                <EditableInput
                  value={data.equivalence.regionalAccreditation}
                  onChange={(value) => updateField("equivalence", "regionalAccreditation", value)}
                  className="font-serif text-sm"
                  readOnly={readOnly}
                />
              </div>
            </div>

            <SectionTitle>2. Credential Details</SectionTitle>
            <CredentialDetails data={data.credential} updateField={updateField} readOnly={readOnly} />

            <SectionTitle>3. Course-by-Course Analysis</SectionTitle>
          </>
        )}

        <CourseTable
          courses={pageCourses}
          updateCourse={updateCourse}
          deleteCourse={deleteCourse}
          readOnly={readOnly}
          headerRef={tableHeaderRef}
          rowRef={rowRef}
        />

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

type CredentialDetailsProps = {
  data: SampleData["credential"]
  updateField: UpdateField
  readOnly?: boolean
}

const CredentialDetails = ({ data, updateField, readOnly = false }: CredentialDetailsProps) => (
  <table className="w-full text-xs border-collapse mb-4 table-fixed">
    <tbody>
      <Tr label="Credential">
        <EditableInput
          value={data.english}
          onChange={(value) => updateField("credential", "english", value)}
          className="font-bold"
          placeholder="Credential English Name"
          readOnly={readOnly}
        />
        <EditableInput
          value={data.native}
          onChange={(value) => updateField("credential", "native", value)}
          className="text-gray-500 italic"
          placeholder="Credential Native Name"
          readOnly={readOnly}
        />
      </Tr>
      <Tr label="Institution">
        <EditableInput
          value={data.institution}
          onChange={(value) => updateField("credential", "institution", value)}
          className="font-bold"
          readOnly={readOnly}
        />
      </Tr>
      <Tr label="Status">
        <EditableInput
          value={data.status}
          onChange={(value) => updateField("credential", "status", value)}
          readOnly={readOnly}
        />
      </Tr>
      <Tr label="Length">
        <div className="flex gap-2">
          <EditableInput
            value={data.programLength}
            onChange={(value) => updateField("credential", "programLength", value)}
            readOnly={readOnly}
          />
          <span className="text-gray-400">|</span>
          <EditableInput
            value={data.year}
            onChange={(value) => updateField("credential", "year", value)}
            placeholder="Year"
            className="w-20"
            readOnly={readOnly}
          />
        </div>
      </Tr>
    </tbody>
  </table>
)

type TrProps = {
  label: string
  children: ReactNode
}

const Tr = ({ label, children }: TrProps) => (
  <tr>
    <td className="p-1 w-24 align-top font-bold text-gray-500 border-b border-gray-100">{label}</td>
    <td className="p-1 align-top border-b border-gray-100">{children}</td>
  </tr>
)

type CourseTableProps = {
  courses: Course[]
  updateCourse: UpdateCourse
  deleteCourse: (id: number) => void
  readOnly?: boolean
  headerRef?: RefObject<HTMLTableSectionElement | null>
  rowRef?: RefObject<HTMLTableRowElement | null>
}

const CourseTable = ({
  courses,
  updateCourse,
  deleteCourse,
  readOnly = false,
  headerRef,
  rowRef,
}: CourseTableProps) => {
  if (!courses || courses.length === 0) {
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
