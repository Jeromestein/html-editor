"use client"

import { useRef, useState } from "react"
import { Printer, Bold, Italic, Underline, Save, RotateCcw } from "lucide-react"

// -----------------------------------------------------------------------------
// 1. 类型定义与模拟数据
// -----------------------------------------------------------------------------

type Course = {
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

const SAMPLE_DATA: SampleData = {
  refNo: "AET-2024-0926",
  name: "Maha Qadri",
  dob: "September 5, 2003",
  country: "Canada",
  date: "September 5, 2024",
  purpose: "Other",
  credential: {
    native: "N/A",
    english: "Bachelor of Science, Honors (Major in Bio-Medical Science)",
    institution: "University of Guelph",
    year: "2025",
    status: "Public institution recognized by the Ministry of Colleges and Universities of Ontario, Canada",
    admissionReq:
      "Secondary School Diploma or its equivalent (college preparatory program at an accredited high school in the United States)",
    programLength: "4 years (2021-2025)",
    access: "N/A",
  },
  equivalence: {
    summary: "Bachelor of Science degree",
    regionalAccreditation:
      "earned at a regionally accredited institution of higher education in the United States",
    major: "Biomedical Science",
    gpa: "3.72",
    totalCredits: "120.00",
  },
  courses: [
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
    { year: "2022-2023", name: "Foundations of Molecular Biology & Genetics", level: "L", credits: "3.00", grade: "A-" },
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
  ],
}

// -----------------------------------------------------------------------------
// 2. 主编辑器组件
// -----------------------------------------------------------------------------

export default function ReportEditor() {
  const [data, setData] = useState(SAMPLE_DATA)
  const contentRef = useRef<HTMLDivElement | null>(null)

  // 简单的格式化命令
  const format = (command: string) => {
    document.execCommand(command, false, undefined)
    if (contentRef.current) {
      contentRef.current.focus()
    }
  }

  // 打印功能
  const handlePrint = () => {
    window.print()
  }

  // 重置数据
  const handleReset = () => {
    if (window.confirm("Reset will discard all changes. Continue?")) {
      setData({ ...SAMPLE_DATA })
      if (contentRef.current) {
        window.location.reload()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900 print:bg-white print:block">
      {/* 工具栏 (Print Hidden) */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-blue-900 tracking-tight">AET Report Editor</h1>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex gap-1">
            <ToolbarButton onClick={() => format("bold")} icon={<Bold size={18} />} label="Bold" />
            <ToolbarButton onClick={() => format("italic")} icon={<Italic size={18} />} label="Italic" />
            <ToolbarButton onClick={() => format("underline")} icon={<Underline size={18} />} label="Underline" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors border border-blue-200">
            <Save size={16} /> Save Draft
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
          >
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {/* 编辑区域 (US Letter) */}
      <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
        <div
          className="mx-auto bg-white shadow-lg print:shadow-none print:w-full"
          style={{
            width: "8.5in",
            minHeight: "11in",
            padding: "0.75in",
            boxSizing: "border-box",
          }}
        >
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className="outline-none focus:outline-none report-content"
            style={{ minHeight: "9.5in" }}
          >
            {/* --- 报告头部 Header --- */}
            <header className="flex justify-between items-end border-b-2 border-blue-900 pb-4 mb-8">
              <div>
                <div className="text-4xl font-black text-blue-900 tracking-wider font-serif">AET</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                  American Evaluation & <br />
                  Translation Services
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 leading-relaxed font-sans">
                <p>1234 Academic Way, Suite 100</p>
                <p>New York, NY 10001, USA</p>
                <p>Phone: (212) 555-0199 | www.aet-service.com</p>
              </div>
            </header>

            {/* --- 报告标题 --- */}
            <h1 className="text-center text-xl font-bold uppercase underline decoration-double decoration-1 underline-offset-4 text-blue-900 mb-8 font-serif">
              Credential Evaluation Report
            </h1>

            {/* --- 顶部信息栏 (Applicant & Report Details) --- */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm border-b border-gray-200 pb-6">
              <div>
                <h3 className="font-bold text-blue-900 uppercase text-xs mb-3 tracking-wider">Applicant Information</h3>
                <InfoRow label="Name">{data.name}</InfoRow>
                <InfoRow label="Date of Birth">{data.dob}</InfoRow>
                <InfoRow label="Country">{data.country}</InfoRow>
                <InfoRow label="Purpose">{data.purpose}</InfoRow>
              </div>
              <div>
                <h3 className="font-bold text-blue-900 uppercase text-xs mb-3 tracking-wider">Report Details</h3>
                <InfoRow label="Evaluation ID">{data.refNo}</InfoRow>
                <InfoRow label="Date">{data.date}</InfoRow>
                <InfoRow label="Page">1 of 2</InfoRow>
              </div>
            </div>

            {/* --- Section 1: Equivalence Summary (Bottom Line Up Front) --- */}
            <section className="mb-8 bg-blue-50 p-4 border-l-4 border-blue-600 print:bg-transparent print:border-l-0 print:border print:border-gray-300 print:p-2">
              <h2 className="font-bold text-blue-900 uppercase text-sm mb-2">1. U.S. Equivalence Summary</h2>
              <p className="text-lg font-bold text-gray-900 font-serif leading-snug">
                This is the equivalent of the U.S. degree of {data.equivalence.summary} in {data.equivalence.major}{" "}
                {data.equivalence.regionalAccreditation}.
              </p>
            </section>

            {/* --- Section 2: Credential Analysis (Consolidated Table) --- */}
            <section className="mb-8">
              <SectionTitle>2. Credential Details</SectionTitle>
              <table className="w-full text-sm border-collapse border border-gray-300 mt-3">
                <tbody>
                  <TableRow label="Country of Education" value={data.country} />
                  <TableRow
                    label="Credential Name"
                    value={
                      <>
                        <div className="font-bold">{data.credential.english}</div>
                        <div className="text-gray-500 italic">({data.credential.native})</div>
                      </>
                    }
                  />
                  <TableRow
                    label="Issuing Institution"
                    value={
                      <>
                        <div className="font-bold">{data.credential.institution}</div>
                      </>
                    }
                  />
                  <TableRow label="Institution Status" value={data.credential.status} />
                  <TableRow label="Admission Req" value={data.credential.admissionReq} />
                  <TableRow label="Program Length" value={data.credential.programLength} />
                  <TableRow label="Year Awarded" value={data.credential.year} />
                  <TableRow label="Access" value={data.credential.access} />
                </tbody>
              </table>
            </section>

            {/* --- Section 3: Course Analysis (Only for Detailed Report) --- */}
            <section className="mb-8">
              <SectionTitle>3. Course-by-Course Analysis</SectionTitle>
              <p className="text-xs text-gray-500 mb-2 italic">Based on original transcripts submitted by the applicant.</p>

              <table className="w-full text-sm border-collapse border border-gray-300 text-center">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-50">
                    <th className="border border-gray-300 p-1 w-1/6">Year</th>
                    <th className="border border-gray-300 p-1 w-1/3 text-left pl-2">Course Title</th>
                    <th className="border border-gray-300 p-1 w-1/12">Level*</th>
                    <th className="border border-gray-300 p-1 w-1/6">U.S. Credits</th>
                    <th className="border border-gray-300 p-1 w-1/6">U.S. Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((course, idx) => (
                    <tr key={`${course.name}-${idx}`}>
                      <td className="border border-gray-300 p-1">{course.year}</td>
                      <td className="border border-gray-300 p-1 text-left pl-2">{course.name}</td>
                      <td className="border border-gray-300 p-1">{course.level}</td>
                      <td className="border border-gray-300 p-1">{course.credits}</td>
                      <td className="border border-gray-300 p-1">{course.grade}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50 print:bg-transparent">
                    <td className="border border-gray-300 p-1" colSpan={3}>
                      TOTALS
                    </td>
                    <td className="border border-gray-300 p-1">{data.equivalence.totalCredits}</td>
                    <td className="border border-gray-300 p-1">GPA: {data.equivalence.gpa}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-gray-500 mt-1">
                *Level: L=Lower Division (Freshman/Sophomore), U=Upper Division (Junior/Senior), G=Graduate
              </p>
            </section>

            {/* --- Section 4: References (AICE 2025 Requirement) --- */}
            <section className="mb-8">
              <SectionTitle>4. Scales & References</SectionTitle>
              <div className="flex gap-8 text-xs">
                <div className="w-1/2">
                  <h4 className="font-bold mb-1">Grade Conversion Scale:</h4>
                  <table className="w-full border-collapse border border-gray-300 text-center">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 p-1">Canadian %</th>
                        <th className="border border-gray-300 p-1">U.S. Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-1">85-100</td>
                        <td className="border border-gray-300 p-1">A</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">80-84</td>
                        <td className="border border-gray-300 p-1">A-</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">77-79</td>
                        <td className="border border-gray-300 p-1">B+</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">73-76</td>
                        <td className="border border-gray-300 p-1">B</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">70-72</td>
                        <td className="border border-gray-300 p-1">B-</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">67-69</td>
                        <td className="border border-gray-300 p-1">C+</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">63-66</td>
                        <td className="border border-gray-300 p-1">C</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">60-62</td>
                        <td className="border border-gray-300 p-1">C-</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">50-59</td>
                        <td className="border border-gray-300 p-1">D</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-1">0-49</td>
                        <td className="border border-gray-300 p-1">F</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="w-1/2">
                  <h4 className="font-bold mb-1">References Consulted:</h4>
                  <ul className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>University of Guelph Undergraduate Calendar: Grading System and Grade Interpretation.</li>
                    <li>Ontario Ministry of Colleges and Universities: Postsecondary education guidelines.</li>
                    <li>Universities Canada: institutional overview and degree structures.</li>
                    <li>AACRAO Electronic Database for Global Education (EDGE).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* --- Footer / Remarks --- */}
            <section className="mt-8 pt-4 border-t-2 border-gray-300">
              <div className="text-[10px] text-justify text-gray-500 mb-6 leading-tight">
                <strong>Remarks: </strong>
                This evaluation report is advisory in nature and is not binding upon any institution, agency, or third
                party. It is based on the analysis of documents submitted by the applicant. AET is an Endorsed Member of
                the Association of International Credential Evaluators (AICE).
                <strong> Unit Conversion: </strong>1 year of full-time undergraduate study is generally equivalent to
                30-32 U.S. semester credits.
              </div>

              <div className="flex justify-between items-end gap-6">
                <div>
                  <div className="w-48 border-b border-black mb-1"></div>
                  <div className="font-bold text-sm">Senior Evaluator</div>
                  <div className="text-xs text-gray-600">AET Evaluation Committee</div>
                </div>
                <div>
                  <div className="w-48 border-b border-black mb-1"></div>
                  <div className="font-bold text-sm">Evaluator</div>
                  <div className="text-xs text-gray-600">AET Evaluation Committee</div>
                </div>
                <div className="w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center text-center p-2 text-xs font-bold text-gray-300 uppercase tracking-widest select-none">
                  Official
                  <br />
                  AET
                  <br />
                  Seal
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Helper Components ---

type ToolbarButtonProps = {
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function ToolbarButton({ onClick, icon, label }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
    >
      {icon}
    </button>
  )
}

type SectionTitleProps = {
  children: React.ReactNode
}

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="font-sans font-bold text-blue-900 uppercase text-sm border-b border-gray-200 mb-2 pb-1">
      {children}
    </h2>
  )
}

type InfoRowProps = {
  label: string
  children: React.ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex mb-1">
      <span className="w-28 font-bold text-gray-600 shrink-0">{label}:</span>
      <span className="text-gray-900">{children}</span>
    </div>
  )
}

type TableRowProps = {
  label: string
  value: React.ReactNode
}

function TableRow({ label, value }: TableRowProps) {
  return (
    <tr>
      <td className="border border-gray-300 p-2 bg-gray-50 w-1/3 font-bold text-gray-700 align-top print:bg-transparent">
        {label}
      </td>
      <td className="border border-gray-300 p-2 align-top text-gray-900">{value}</td>
    </tr>
  )
}
