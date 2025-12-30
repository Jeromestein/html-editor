"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Printer, Save, RotateCcw, Bold, Italic, Underline, Loader2 } from "lucide-react"

// -----------------------------------------------------------------------------
// 1. TypeScript 类型定义 (Type Definitions)
//    这里定义了数据的结构，确保前后端数据一致，这是 TypeScript 的最大优势。
// -----------------------------------------------------------------------------

interface ApplicationData {
  id: string
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
    accreditationBody: string
    admissionReq: string
    programLength: string
    major: string
  }
  equivalence: {
    summary: string
    major: string
    gpa: string
  }
}

// -----------------------------------------------------------------------------
// 2. 模拟后端 API (Mock API) - 替代 Python 脚本
//    在实际 Next.js 中，这里会是 fetch('/api/applications/${id}')
// -----------------------------------------------------------------------------

const mockFetchApplicationData = async (id: string): Promise<ApplicationData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: id,
        refNo: "AET-2025-TS01",
        name: "ZHANG, San",
        dob: "January 15, 1998",
        country: "China",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        purpose: "Employment",
        credential: {
          native: "工学学士学位 (Bachelor of Engineering)",
          english: "Bachelor of Engineering",
          institution: "Beijing University of Technology",
          year: "2020",
          accreditationBody: "the Ministry of Education of China",
          admissionReq: "completion of the National College Entrance Examination (Gaokao)",
          programLength: "4-year",
          major: "Computer Science and Technology",
        },
        equivalence: {
          summary: "Bachelor's Degree in Computer Science",
          major: "Computer Science and Technology",
          gpa: "3.45",
        },
      })
    }, 800) // 模拟网络延迟
  })
}

// -----------------------------------------------------------------------------
// 3. 主组件 (Main Component)
// -----------------------------------------------------------------------------

export default function ReportEditor() {
  const pageSpec = {
    width: "8.5in",
    height: "11in",
    paddingX: "0.75in",
    paddingY: "0.75in",
    headerHeight: "1.1in",
    footerHeight: "0.8in",
    gap: "0.4in",
  }
  const [data, setData] = useState<ApplicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(1)
  const isPaginatingRef = useRef(false)

  // 使用 Ref 来引用可编辑区域，以便读取最终的 HTML
  const contentRef = useRef<HTMLDivElement>(null)
  const sizeCacheRef = useRef<{ [key: string]: number }>({})

  // 初始化加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await mockFetchApplicationData("12345")
      setData(result)
    } catch (error) {
      console.error("Failed to load data", error)
    } finally {
      setLoading(false)
    }
  }

  // 模拟保存功能：获取当前 DOM 的 HTML 发送给后端
  const handleSave = () => {
    if (!contentRef.current) return

    setSaving(true)
    const currentHtml = getCleanHtml(contentRef.current)

    // 在真实场景中：await fetch('/api/save-report', { method: 'POST', body: JSON.stringify({ html: currentHtml }) })
    console.log("Saving HTML content:", currentHtml)

    setTimeout(() => {
      setSaving(false)
      setLastSaved(new Date().toLocaleTimeString())
    }, 1000)
  }

  // 简单的格式化命令
  const formatDoc = (cmd: string) => {
    document.execCommand(cmd, false)
  }

  const getCleanHtml = (root: HTMLDivElement) => {
    const clone = root.cloneNode(true) as HTMLDivElement
    clone.querySelectorAll('[data-page-break="true"]').forEach((node) => node.remove())
    return clone.innerHTML
  }

  const measureCssSize = (size: string) => {
    const cached = sizeCacheRef.current[size]
    if (cached) return cached

    const probe = document.createElement("div")
    probe.style.width = size
    probe.style.position = "absolute"
    probe.style.visibility = "hidden"
    document.body.appendChild(probe)
    const px = probe.getBoundingClientRect().width
    document.body.removeChild(probe)
    sizeCacheRef.current[size] = px
    return px
  }

  const paginateContent = () => {
    if (!contentRef.current || isPaginatingRef.current) return
    isPaginatingRef.current = true

    const root = contentRef.current
    root.querySelectorAll('[data-page-break="true"]').forEach((node) => node.remove())

    const pageHeightPx = measureCssSize(pageSpec.height)
    const paddingTopPx = measureCssSize(pageSpec.paddingY)
    const paddingBottomPx = measureCssSize(pageSpec.paddingY)
    const headerHeightPx = measureCssSize(pageSpec.headerHeight)
    const footerHeightPx = measureCssSize(pageSpec.footerHeight)
    const gapPx = measureCssSize(pageSpec.gap)
    const contentHeightPx = pageHeightPx - paddingTopPx - paddingBottomPx - headerHeightPx - footerHeightPx
    const pageJumpPx = footerHeightPx + paddingBottomPx + paddingTopPx + headerHeightPx + gapPx

    let usedHeight = 0
    let breaks = 0

    const children = Array.from(root.children) as HTMLElement[]
    children.forEach((child) => {
      if (child.dataset.pageBreak === "true") return
      const style = window.getComputedStyle(child)
      const marginTop = parseFloat(style.marginTop) || 0
      const marginBottom = parseFloat(style.marginBottom) || 0
      const childHeight = child.getBoundingClientRect().height + marginTop + marginBottom

      if (usedHeight + childHeight > contentHeightPx && usedHeight > 0) {
        const breakEl = document.createElement("div")
        breakEl.dataset.pageBreak = "true"
        breakEl.contentEditable = "false"
        breakEl.style.height = `${pageJumpPx}px`
        breakEl.style.pointerEvents = "none"
        root.insertBefore(breakEl, child)
        usedHeight = 0
        breaks += 1
      }

      usedHeight += childHeight
    })

    setPageCount(breaks + 1)
    isPaginatingRef.current = false
  }

  useEffect(() => {
    if (!data) return
    const handleResize = () => {
      sizeCacheRef.current = {}
      paginateContent()
    }
    const raf = requestAnimationFrame(paginateContent)
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
    }
  }, [data])

  const pageGapCount = Math.max(0, pageCount - 1)
  const contentHeightStyle = `calc(${pageCount} * ${pageSpec.height} + ${pageGapCount} * ${pageSpec.gap})`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Application Data...</p>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-10 text-center">Error loading data.</div>

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center print:bg-white print:block">
      {/* --- 工具栏 (Toolbar) --- */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-300 shadow-sm z-50 flex items-center justify-between px-6 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-gray-800 text-lg mr-4">AET Report Editor</div>

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          <button
            onClick={() => formatDoc("bold")}
            className="p-2 hover:bg-gray-100 rounded text-gray-700"
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => formatDoc("italic")}
            className="p-2 hover:bg-gray-100 rounded text-gray-700"
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => formatDoc("underline")}
            className="p-2 hover:bg-gray-100 rounded text-gray-700"
            title="Underline"
          >
            <Underline size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {lastSaved && <span className="text-xs text-gray-400 mr-2">Last saved: {lastSaved}</span>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Reset to original data"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer size={16} />
            Print / PDF
          </button>
        </div>
      </div>

      {/* --- 报告主体 (US Letter) --- */}
      {/* mt-24 to offset fixed header */}
      <div className="mt-24 mb-10 print:mt-0 print:mb-0 print:w-full">
        <div className="relative mx-auto" style={{ width: pageSpec.width }}>
          <div className="flex flex-col [--page-gap:0.4in] print:[--page-gap:0in]" style={{ gap: "var(--page-gap)" }} aria-hidden={true}>
            {Array.from({ length: pageCount }).map((_, index) => (
              <div
                key={`page-shell-${index}`}
                className="bg-white shadow-lg print:shadow-none text-gray-900 grid"
                style={{
                  width: pageSpec.width,
                  minHeight: pageSpec.height,
                  height: pageSpec.height,
                  paddingLeft: pageSpec.paddingX,
                  paddingRight: pageSpec.paddingX,
                  paddingTop: pageSpec.paddingY,
                  paddingBottom: pageSpec.paddingY,
                  gridTemplateRows: `${pageSpec.headerHeight} 1fr ${pageSpec.footerHeight}`,
                  fontFamily: '"Noto Serif", serif',
                }}
              >
                <PageHeader />
                <div />
                <PageFooter />
              </div>
            ))}
          </div>

          <div className="absolute inset-0">
            <div
              ref={contentRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={paginateContent}
              className="outline-none"
              style={{
                width: pageSpec.width,
                minHeight: contentHeightStyle,
                paddingLeft: pageSpec.paddingX,
                paddingRight: pageSpec.paddingX,
                paddingTop: `calc(${pageSpec.paddingY} + ${pageSpec.headerHeight})`,
                paddingBottom: `calc(${pageSpec.paddingY} + ${pageSpec.footerHeight})`,
                fontFamily: '"Noto Serif", serif',
              }}
            >
              <h1 className="text-center text-xl font-bold uppercase underline decoration-double decoration-1 underline-offset-4 font-sans text-blue-900 mb-8">
                Credential Evaluation Report
              </h1>

            {/* Section 1: Subject */}
            <section className="mb-6">
              <SectionTitle>1. Subject of Evaluation</SectionTitle>
              <InfoGrid label="Name:">
                <span className="bg-blue-50 print:bg-transparent">{data.name}</span>
              </InfoGrid>
              <InfoGrid label="Date of Birth:">
                <span className="bg-blue-50 print:bg-transparent">{data.dob}</span>
              </InfoGrid>
              <InfoGrid label="Country of Education:">
                <span className="bg-blue-50 print:bg-transparent">{data.country}</span>
              </InfoGrid>
              <InfoGrid label="AET Reference No.:">{data.refNo}</InfoGrid>
              <InfoGrid label="Date:">{data.date}</InfoGrid>
            </section>

            {/* Section 2: Purpose */}
            <section className="mb-6">
              <SectionTitle>2. Purpose of Evaluation</SectionTitle>
              <p className="text-justify leading-relaxed text-sm mb-2">
                The purpose of this report is to evaluate the educational credentials of the individual named above and
                to determine the U.S. equivalent for the purpose of <strong>{data.purpose}</strong>.
              </p>
            </section>

            {/* Section 3: Analysis */}
            <section className="mb-6">
              <SectionTitle>3. Credential Analysis</SectionTitle>

              <div className="mb-4 text-sm">
                <InfoGrid label="Credential:">
                  <span className="font-bold bg-blue-50 print:bg-transparent">{data.credential.native}</span>
                </InfoGrid>
                <InfoGrid label="English Translation:">
                  <span className="italic bg-blue-50 print:bg-transparent">{data.credential.english}</span>
                </InfoGrid>
                <InfoGrid label="Institution:">
                  <span className="bg-blue-50 print:bg-transparent">{data.credential.institution}</span>
                </InfoGrid>
                <InfoGrid label="Year Awarded:">
                  <span className="bg-blue-50 print:bg-transparent">{data.credential.year}</span>
                </InfoGrid>
              </div>

              <div className="space-y-3 text-sm text-justify leading-relaxed">
                <p>
                  <strong>Institution Status: </strong>
                  <span className="bg-blue-50 print:bg-transparent">{data.credential.institution}</span> is a recognized
                  institution of higher education in {data.country}. It is accredited by{" "}
                  {data.credential.accreditationBody}.
                </p>
                <p>
                  <strong>Admission Requirements: </strong>
                  Admission to this program requires {data.credential.admissionReq}.
                </p>
                <p>
                  <strong>Program Length & Focus: </strong>
                  The program is a {data.credential.programLength} full-time course of study focusing on{" "}
                  <span className="bg-blue-50 print:bg-transparent">{data.credential.major}</span>.
                </p>
              </div>
            </section>

            {/* Section 4: Equivalence */}
            <section className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-sm print:border print:bg-transparent">
              <h2 className="font-sans font-bold text-blue-900 uppercase text-sm mb-3 border-b border-gray-300 pb-1">
                4. U.S. Equivalence Summary
              </h2>
              <p className="text-sm mb-3">
                Based on the analysis of the submitted documents, the credentials held by <strong>{data.name}</strong>{" "}
                are equivalent to the following in the United States:
              </p>

              <div className="text-lg font-bold text-center py-3 border-t border-b border-gray-300 my-3 text-blue-900 bg-white print:border-gray-800">
                {data.equivalence.summary}
              </div>

              <div className="text-sm mt-3 grid grid-cols-2">
                <div>
                  <strong>Major:</strong> {data.equivalence.major}
                </div>
                <div>
                  <strong>GPA:</strong> {data.equivalence.gpa} (on a 4.0 scale)
                </div>
              </div>
            </section>

            {/* Signatures */}
            <section className="mt-16 mb-8">
              <div className="flex justify-between items-end">
                <div className="w-1/2">
                  <div className="h-16 w-40 border-b border-gray-400 mb-1 flex items-end text-gray-400 text-xs pb-1 italic select-none">
                    [Electronic Signature]
                  </div>
                  <div className="font-bold text-sm">Senior Evaluator</div>
                  <div className="text-sm text-gray-600">AET Evaluation Team</div>
                </div>
                <div className="w-1/3 text-right flex justify-end">
                  <div className="h-20 w-20 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs text-center text-gray-400 font-sans font-bold uppercase tracking-wider select-none">
                    Official
                    <br />
                    Seal
                  </div>
                </div>
              </div>
            </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Components (Sub-components)
// -----------------------------------------------------------------------------

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-sans font-bold text-blue-900 uppercase text-sm border-b border-gray-200 mt-6 mb-2 pb-1">
    {children}
  </h2>
)

const InfoGrid = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_1fr] gap-2 mb-1">
    <div className="font-bold text-gray-600">{label}</div>
    <div>{children}</div>
  </div>
)

const PageHeader = () => (
  <header className="flex justify-between items-end border-b-2 border-blue-900 pb-4">
    <div>
      <div className="text-3xl font-bold text-blue-900 tracking-wide font-sans">AET</div>
      <div className="text-sm text-gray-600 font-sans">American Evaluation Translation Service</div>
    </div>
    <div className="text-right text-xs text-gray-500 font-sans leading-relaxed">
      <p>123 Professional Drive, Suite 100</p>
      <p>City, State, Zip Code, USA</p>
      <p>Phone: (555) 123-4567 | Web: www.aet-example.com</p>
    </div>
  </header>
)

const PageFooter = () => (
  <footer className="border-t border-gray-300 pt-4 text-[10px] text-gray-500 text-justify leading-tight">
    <p className="mb-2">
      <strong>Evaluation Methodology:</strong> This evaluation is advisory in nature and is not binding upon any
      institution or agency. It is based on original or verified copies of documents submitted by the applicant. AET
      follows the placement recommendations of the National Council on the Evaluation of Foreign Educational
      Credentials and AACRAO EDGE.
    </p>
    <p className="text-center font-sans">
      &copy; {new Date().getFullYear()} AET. All rights reserved. MEMBER OF AICE.
    </p>
  </footer>
)
