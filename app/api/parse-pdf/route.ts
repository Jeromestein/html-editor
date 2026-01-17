import { NextRequest, NextResponse } from "next/server"
import { extractTextFromPDF, detectLanguage, convertToSampleData } from "@/lib/pdf-parser"
import { analyzeTranscript } from "@/lib/gemini"

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
 * Parse a PDF file and extract structured data for FCE report
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

        // Extract text from PDF
        const buffer = await file.arrayBuffer()
        let extractedText: string

        try {
            extractedText = await extractTextFromPDF(buffer)
        } catch (error) {
            console.error("PDF extraction error:", error)
            return NextResponse.json(
                {
                    success: false,
                    error: "PARSE_ERROR",
                    message: "Failed to read PDF. The file may be corrupted or password-protected.",
                },
                { status: 400 }
            )
        }

        // Check if text was extracted
        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                {
                    success: false,
                    error: "PARSE_ERROR",
                    message: "Could not extract text from PDF. The file may be scanned or image-based.",
                },
                { status: 400 }
            )
        }

        // Detect language
        const languageResult = detectLanguage(extractedText)

        if (!languageResult.isEnglish) {
            return NextResponse.json(
                {
                    success: false,
                    error: "NON_ENGLISH_CONTENT",
                    message: `The document appears to contain ${languageResult.detected} content. Currently only English documents are supported.`,
                    detectedLanguage: languageResult.detected,
                },
                { status: 400 }
            )
        }

        // Analyze with Gemini AI
        let aiResult
        try {
            aiResult = await analyzeTranscript(extractedText)
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

        // Check AI's language detection
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

        // Collect warnings
        const warnings: string[] = []

        if (!parsedData.credentials || parsedData.credentials.length === 0) {
            warnings.push("No credential information was found in the document.")
        }

        if (parsedData.credentials?.some((c) => c.courses.length === 0)) {
            warnings.push("Some credentials have no course information.")
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
