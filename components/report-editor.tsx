"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Printer, RotateCcw, Plus, Trash2 } from "lucide-react"

// -----------------------------------------------------------------------------
// 1. Type definitions and sample data
// -----------------------------------------------------------------------------

type Course = {
  id: number
  year: string
  name: string
  level: string
  credits: string
  grade: string
}

type SampleData = {
  refNo: string
  name: string
  dob: string
  country: string
  date: string
  purpose: string
  credential: {
    native: string
    english: string
    institution: string
    year: string
    status: string
    admissionReq: string
    programLength: string
    access: string
  }
  equivalence: {
    summary: string
    regionalAccreditation: string
    major: string
    gpa: string
    totalCredits: string
  }
  courses: Course[]
}

type CourseSeed = Omit<Course, "id">

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

const SAMPLE_COURSES: CourseSeed[] = [
  { year: "2021-2022", name: "Art Historical Studies I", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "Intro to Molecular & Cell Biology", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "General Chemistry I", level: "L", credits: "3.00", grade: "A" },
  { year: "2021-2022", name: "Elements of Calculus I", level: "L", credits: "3.00", grade: "A" },
  { year: "2021-2022", name: "Fundamentals of Physics", level: "L", credits: "3.00", grade: "C" },
  { year: "2021-2022", name: "Discovering Biodiversity", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "Biological Concepts of Health", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "General Chemistry II", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "Physics for Life Sciences", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "ST: Horror Night in Canada", level: "L", credits: "3.00", grade: "A-" },
  { year: "2022-2023", name: "Introduction to Biochemistry", level: "L", credits: "3.00", grade: "A-" },
  { year: "2022-2023", name: "Intro Nutritional & Food Sci", level: "L", credits: "3.00", grade: "B-" },
  {
    year: "2022-2023",
    name: "Foundations of Molecular Biology & Genetics",
    level: "L",
    credits: "3.00",
    grade: "A-",
  },
  { year: "2022-2023", name: "Introduction to Psychology", level: "L", credits: "3.00", grade: "A-" },
  { year: "2022-2023", name: "Statistics I", level: "L", credits: "3.00", grade: "B-" },
  { year: "2022-2023", name: "Biomedical Physiology", level: "L", credits: "6.00", grade: "A-" },
  { year: "2023-2024", name: "Molecular Biology of the Cell", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Fundamentals of Nutrition", level: "U", credits: "3.00", grade: "A-" },
  { year: "2023-2024", name: "Epidemiology", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Structure & Function in Biochemistry", level: "U", credits: "3.00", grade: "A-" },
  { year: "2023-2024", name: "Introduction to Computing", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Foundations in Critical Reading", level: "U", credits: "3.00", grade: "A-" },
  { year: "2023-2024", name: "Human Anatomy: Dissection", level: "U", credits: "4.50", grade: "A-" },
  { year: "2023-2024", name: "Social Psychology", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Principles of Pharmacology", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Cardiology", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Human Anatomy: Dissection II", level: "U", credits: "4.50", grade: "A-" },
  { year: "2024-2025", name: "Principles of Learning", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Immunology", level: "U", credits: "3.00", grade: "C-" },
  { year: "2024-2025", name: "Principles of Disease", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Epidemiology of Food-Borne Diseases", level: "U", credits: "3.00", grade: "B+" },
  { year: "2024-2025", name: "Medical Toxicology", level: "U", credits: "3.00", grade: "A" },
  { year: "2024-2025", name: "Nutrition of Fish & Crustacea", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Endocrine Physiology", level: "U", credits: "3.00", grade: "A+" },
  { year: "2024-2025", name: "Biomedical Aspects of Aging", level: "U", credits: "3.00", grade: "A" },
  { year: "2024-2025", name: "Business & Professional Ethics", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Homicide", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Dynamics of Sport Fans", level: "U", credits: "3.00", grade: "A+" },
]

const buildSampleData = (): SampleData => ({
  refNo: "AET-2024-0926",
  name: "Maha Qadri",
  dob: "September 5, 2003",
  country: "Canada",
  date: "September 5, 2024",
  purpose: "Employment",
  credential: {
    english: "Bachelor of Science, Honors (Major in Bio-Medical Science)",
    native: "N/A",
    institution: "University of Guelph",
    year: "2025",
    status: "Public institution recognized by the Ministry of Colleges and Universities of Ontario, Canada",
    admissionReq: "Secondary School Diploma or equivalent",
    programLength: "4 years (2021-2025)",
    access: "N/A",
  },
  equivalence: {
    summary: "Bachelor of Science degree",
    major: "Biomedical Science",
    regionalAccreditation: "regionally accredited institution",
    gpa: "3.72",
    totalCredits: "120.00",
  },
  courses: SAMPLE_COURSES.map((course, index) => ({
    id: index + 1,
    ...course,
  })),
})

// -----------------------------------------------------------------------------
// 2. Pagination logic
// -----------------------------------------------------------------------------

const ROWS_PER_FIRST_PAGE = 14
const ROWS_PER_FULL_PAGE = 30

type PageData = {
  type: "first-page" | "course-continuation"
  courses: Course[]
  isLastPage: boolean
}

function paginateCourses(courses: Course[]): PageData[] {
  const pages: PageData[] = []
  const remainingCourses = [...courses]

  const firstPageCourses = remainingCourses.splice(0, ROWS_PER_FIRST_PAGE)
  pages.push({
    type: "first-page",
    courses: firstPageCourses,
    isLastPage: remainingCourses.length === 0,
  })

  while (remainingCourses.length > 0) {
    const pageCourses = remainingCourses.splice(0, ROWS_PER_FULL_PAGE)
    pages.push({
      type: "course-continuation",
      courses: pageCourses,
      isLastPage: remainingCourses.length === 0,
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
}

const EditableInput = ({ value, onChange, className = "", placeholder = "" }: EditableInputProps) => (
  <input
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:bg-blue-50 transition-colors w-full px-1 ${className}`}
    placeholder={placeholder}
  />
)

type EditableTextareaProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  rows?: number
}

const EditableTextarea = ({ value, onChange, className = "", rows = 3 }: EditableTextareaProps) => (
  <textarea
    value={value}
    onChange={(event) => onChange(event.target.value)}
    rows={rows}
    className={`bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:bg-blue-50 transition-colors w-full p-1 resize-none ${className}`}
  />
)

// -----------------------------------------------------------------------------
// 4. Main editor
// -----------------------------------------------------------------------------

export default function ReportEditor() {
  const [data, setData] = useState(buildSampleData)
  const pages = useMemo(() => paginateCourses(data.courses), [data.courses])

  const handlePrint = () => window.print()

  const handleReset = () => {
    if (window.confirm("Reset data to sample?")) {
      setData(buildSampleData())
    }
  }

  const updateField: UpdateField = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateDataField: UpdateDataField = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateCourse: UpdateCourse = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      courses: prev.courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)),
    }))
  }

  const deleteCourse = (id: number) => {
    setData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course.id !== id),
    }))
  }

  const addCourse = () => {
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
          --page-header-height: 1.1in;
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
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm transition-colors"
          >
            <Printer size={18} /> Print / PDF
          </button>
        </div>
      </div>

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

      <div className="flex-1 overflow-hidden flex flex-col">
        {type === "first-page" && (
          <>
            <h1 className="text-center text-xl font-bold uppercase underline decoration-double decoration-1 underline-offset-4 text-blue-900 mb-6 font-serif">
              Credential Evaluation Report
            </h1>

            <ApplicantInfo data={data} updateDataField={updateDataField} />

            <SectionTitle>1. U.S. Equivalence Summary</SectionTitle>
            <div className="mb-6 bg-blue-50 p-2 border-l-4 border-blue-600 print:bg-transparent print:border-gray-300 print:border group hover:bg-blue-100 transition-colors">
              <EditableTextarea
                value={data.equivalence.summary}
                onChange={(value) => updateField("equivalence", "summary", value)}
                className="font-bold font-serif text-lg leading-snug bg-transparent"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2 mt-1">
                <EditableInput
                  value={data.equivalence.major}
                  onChange={(value) => updateField("equivalence", "major", value)}
                  className="font-serif text-sm font-bold"
                />
                <EditableInput
                  value={data.equivalence.regionalAccreditation}
                  onChange={(value) => updateField("equivalence", "regionalAccreditation", value)}
                  className="font-serif text-sm"
                />
              </div>
            </div>

            <SectionTitle>2. Credential Details</SectionTitle>
            <CredentialDetails data={data.credential} updateField={updateField} />

            <SectionTitle>3. Course-by-Course Analysis</SectionTitle>
          </>
        )}

        <CourseTable courses={pageCourses} updateCourse={updateCourse} deleteCourse={deleteCourse} />

        {isLastPage && (
          <div className="mt-4">
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
                    />
                  </div>
                  <div className="flex items-center">
                    <span>GPA:</span>
                    <EditableInput
                      value={data.equivalence.gpa}
                      onChange={(value) => updateField("equivalence", "gpa", value)}
                      className="w-12 text-right font-bold"
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
        American Evaluation & Translation
      </div>
    </div>
    <div className="text-right text-[9px] text-gray-500 leading-tight font-sans">
      <p>1234 Academic Way, Suite 100, New York, NY 10001</p>
      <p>Phone: (212) 555-0199 | www.aet-service.com</p>
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
    <span>Ref: {refNo}</span>
    <span>
      Page {pageIndex + 1} of {totalPages}
    </span>
    <span>© 2025 AET Corp.</span>
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
}

const ApplicantInfo = ({ data, updateDataField }: ApplicantInfoProps) => (
  <div className="grid grid-cols-2 gap-8 mb-6 text-xs border-b border-gray-200 pb-4">
    <div className="space-y-0.5">
      <div className="font-bold text-blue-900 uppercase text-[10px] mb-1">Applicant</div>
      <InfoRow label="Name">
        <EditableInput value={data.name} onChange={(value) => updateDataField("name", value)} className="font-bold" />
      </InfoRow>
      <InfoRow label="DOB">
        <EditableInput value={data.dob} onChange={(value) => updateDataField("dob", value)} />
      </InfoRow>
      <InfoRow label="Country">
        <EditableInput value={data.country} onChange={(value) => updateDataField("country", value)} />
      </InfoRow>
    </div>
    <div className="space-y-0.5">
      <div className="font-bold text-blue-900 uppercase text-[10px] mb-1">Report</div>
      <InfoRow label="ID">
        <EditableInput value={data.refNo} onChange={(value) => updateDataField("refNo", value)} />
      </InfoRow>
      <InfoRow label="Date">
        <EditableInput value={data.date} onChange={(value) => updateDataField("date", value)} />
      </InfoRow>
      <InfoRow label="Purpose">
        <EditableInput value={data.purpose} onChange={(value) => updateDataField("purpose", value)} />
      </InfoRow>
    </div>
  </div>
)

type InfoRowProps = {
  label: string
  children: ReactNode
}

const InfoRow = ({ label, children }: InfoRowProps) => (
  <div className="flex items-center">
    <span className="w-16 font-bold text-gray-500 shrink-0">{label}:</span>
    <div className="flex-1">{children}</div>
  </div>
)

type CredentialDetailsProps = {
  data: SampleData["credential"]
  updateField: UpdateField
}

const CredentialDetails = ({ data, updateField }: CredentialDetailsProps) => (
  <table className="w-full text-xs border-collapse mb-4 table-fixed">
    <tbody>
      <Tr label="Credential">
        <EditableInput
          value={data.english}
          onChange={(value) => updateField("credential", "english", value)}
          className="font-bold"
          placeholder="Credential English Name"
        />
        <EditableInput
          value={data.native}
          onChange={(value) => updateField("credential", "native", value)}
          className="text-gray-500 italic"
          placeholder="Credential Native Name"
        />
      </Tr>
      <Tr label="Institution">
        <EditableInput
          value={data.institution}
          onChange={(value) => updateField("credential", "institution", value)}
          className="font-bold"
        />
      </Tr>
      <Tr label="Status">
        <EditableInput value={data.status} onChange={(value) => updateField("credential", "status", value)} />
      </Tr>
      <Tr label="Length">
        <div className="flex gap-2">
          <EditableInput
            value={data.programLength}
            onChange={(value) => updateField("credential", "programLength", value)}
          />
          <span className="text-gray-400">|</span>
          <EditableInput
            value={data.year}
            onChange={(value) => updateField("credential", "year", value)}
            placeholder="Year"
            className="w-20"
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
}

const CourseTable = ({ courses, updateCourse, deleteCourse }: CourseTableProps) => {
  if (!courses || courses.length === 0) {
    return <div className="text-xs text-gray-400 italic p-2 text-center">No courses listed on this page.</div>
  }

  return (
    <table className="w-full text-[10px] text-center border-collapse border border-gray-300 table-fixed">
      <thead className="bg-gray-100 print:bg-gray-50">
        <tr>
          <th className="border border-gray-300 p-1 w-14">Year</th>
          <th className="border border-gray-300 p-1 text-left">Course Title</th>
          <th className="border border-gray-300 p-1 w-8">Lvl</th>
          <th className="border border-gray-300 p-1 w-10">Credits</th>
          <th className="border border-gray-300 p-1 w-10">Grade</th>
          <th className="border border-gray-300 p-1 w-6 no-print"></th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.id} className="group hover:bg-blue-50">
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.year}
                onChange={(value) => updateCourse(course.id, "year", value)}
                className="text-center h-full"
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.name}
                onChange={(value) => updateCourse(course.id, "name", value)}
                className="text-left px-2 h-full"
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.level}
                onChange={(value) => updateCourse(course.id, "level", value)}
                className="text-center h-full"
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.credits}
                onChange={(value) => updateCourse(course.id, "credits", value)}
                className="text-center h-full"
              />
            </td>
            <td className="border border-gray-300 p-0 editable-cell">
              <EditableInput
                value={course.grade}
                onChange={(value) => updateCourse(course.id, "grade", value)}
                className="text-center h-full"
              />
            </td>
            <td className="border border-gray-300 p-0 no-print">
              <button
                onClick={() => deleteCourse(course.id)}
                className="w-full h-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Row"
              >
                <Trash2 size={10} />
              </button>
            </td>
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
