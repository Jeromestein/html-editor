import { NextResponse } from "next/server"
import { chromium } from "playwright"
import type { SampleData } from "@/lib/report-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const sanitizeFilename = (value: string) => value.replace(/[^a-zA-Z0-9_-]+/g, "-")

export async function POST(request: Request) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null

  try {
    const data = (await request.json()) as SampleData
    if (!data) {
      return NextResponse.json({ error: "Missing report data." }, { status: 400 })
    }

    const origin = new URL(request.url).origin

    browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()
    await page.addInitScript((payload) => {
      window.__REPORT_DATA__ = payload
    }, data)

    await page.goto(`${origin}/report/print`, { waitUntil: "networkidle" })
    await page.waitForFunction(() => document.documentElement.dataset.reportReady === "true")
    await page.emulateMedia({ media: "print" })

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0in", right: "0in", bottom: "0in", left: "0in" },
    })

    const ref = data.refNo ? sanitizeFilename(data.refNo) : "report"
    const filename = `${ref}.pdf`

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to generate PDF." }, { status: 500 })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
