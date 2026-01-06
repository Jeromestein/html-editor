"use client"

import { useEffect, useState } from "react"
import ReportEditor from "@/components/report-editor"
import { buildSampleData, type SampleData } from "@/lib/report-data"

declare global {
  interface Window {
    __REPORT_DATA__?: SampleData
  }
}

export default function ReportPrintPage() {
  const [data, setData] = useState<SampleData | null>(null)

  useEffect(() => {
    if (window.__REPORT_DATA__) {
      setData(window.__REPORT_DATA__)
      window.__REPORT_DATA__ = undefined
      return
    }
    setData(buildSampleData())
  }, [])

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.reportReady
    }
  }, [])

  if (!data) return null

  return (
    <ReportEditor
      initialData={data}
      readOnly
      showToolbar={false}
      onReady={() => {
        document.documentElement.dataset.reportReady = "true"
      }}
    />
  )
}

export {}
