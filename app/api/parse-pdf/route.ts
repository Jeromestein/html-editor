import { NextRequest, NextResponse } from "next/server"
import { analyzePdfWithGemini } from "@/lib/gemini"
import { convertToSampleData } from "@/lib/pdf-parser"

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * API error response type
 */
type ErrorResponse = {
    success: false
    error: string
    message: string
    detectedLanguage?: string
}

/**
 * API success response type
 */
type SuccessResponse = {
    success: true
    data: Record<string, unknown>
    warnings: string[]
}

/**
 * POST /api/parse-pdf
 * Parse a PDF file using Gemini AI and extract structured data for FCE report
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<ErrorResponse | SuccessResponse>> {
    try {
        // Parse form data
        const formData = await request.formData()
        const file = formData.get("file")

        // Validate file exists
        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "INVALID_FILE",
                    message: "No file uploaded. Please provide a PDF file.",
                },
                { status: 400 }
            )
        }

        // Validate file type
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "INVALID_FILE",
                    message: "Please upload a valid PDF file.",
                },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    error: "FILE_TOO_LARGE",
                    message: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
                },
                { status: 400 }
            )
        }

        // Get PDF buffer
        const buffer = await file.arrayBuffer()

        // Analyze PDF directly with Gemini (no text extraction needed!)
        let aiResult
        try {
            aiResult = await analyzePdfWithGemini(buffer)
        } catch (error) {
            console.error("AI analysis error:", error)
            return NextResponse.json(
                {
                    success: false,
                    error: "AI_ERROR",
                    message: "AI analysis failed. Please try again later.",
                },
                { status: 500 }
            )
        }

        // Check if document is in English
        if (!aiResult.isEnglish) {
            return NextResponse.json(
                {
                    success: false,
                    error: "NON_ENGLISH_CONTENT",
                    message: `The AI detected ${aiResult.detectedLanguage} content. Currently only English documents are supported.`,
                    detectedLanguage: aiResult.detectedLanguage,
                },
                { status: 400 }
            )
        }

        // Convert to SampleData format
        const parsedData = convertToSampleData(aiResult.data || {})

        // Collect warnings (merge AI warnings with local warnings)
        const warnings: string[] = [...(aiResult.warnings || [])]

        if (!parsedData.credentials || parsedData.credentials.length === 0) {
            warnings.push("No credential information was found in the document.")
        }

        if (parsedData.credentials?.some((c) => c.courses.length === 0)) {
            warnings.push("Some credentials have no course information.")
        }

        // Log warnings to backend console
        if (warnings.length > 0) {
            console.warn("=== PDF IMPORT WARNINGS ===")
            warnings.forEach((w) => console.warn(`  - ${w}`))
            console.warn("===========================")
        }

        return NextResponse.json({
            success: true,
            data: parsedData,
            warnings,
        })
    } catch (error) {
        console.error("Unexpected error in parse-pdf:", error)
        return NextResponse.json(
            {
                success: false,
                error: "INTERNAL_ERROR",
                message: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        )
    }
}
