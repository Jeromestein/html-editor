import { NextRequest } from "next/server"
import { analyzePdfWithGemini, type ProgressPhase } from "@/lib/gemini"
import { convertToSampleData } from "@/lib/pdf-parser"

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * POST /api/parse-pdf-stream
 * Parse a PDF file using Gemini AI with SSE streaming for progress updates
 */
export async function POST(request: NextRequest) {
    // Parse form data
    let file: File | null = null

    try {
        const formData = await request.formData()
        file = formData.get("file") as File | null
    } catch {
        return createErrorResponse("Invalid form data")
    }

    // Validate file exists
    if (!file || !(file instanceof File)) {
        return createErrorResponse("No file uploaded. Please provide a PDF file.")
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return createErrorResponse("Please upload a valid PDF file.")
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return createErrorResponse(
            `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`
        )
    }

    // Get PDF buffer
    const buffer = await file.arrayBuffer()

    // Create SSE stream
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (type: string, data: Record<string, unknown>) => {
                const payload = JSON.stringify({ type, ...data })
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
            }

            // Progress callback for Gemini analysis
            const onProgress = (phase: ProgressPhase, detail?: string) => {
                sendEvent("progress", { phase, detail })
            }

            try {
                // Start with uploading phase
                sendEvent("progress", { phase: "uploading", detail: "Processing uploaded file..." })

                // Analyze PDF with Gemini
                const aiResult = await analyzePdfWithGemini(buffer, onProgress)

                // Check if document is in English
                if (!aiResult.isEnglish) {
                    sendEvent("error", {
                        message: `The AI detected ${aiResult.detectedLanguage} content. Currently only English documents are supported.`,
                        detectedLanguage: aiResult.detectedLanguage,
                    })
                    controller.close()
                    return
                }

                // Convert to SampleData format
                const parsedData = convertToSampleData(aiResult.data || {})

                // Collect warnings
                const warnings: string[] = [...(aiResult.warnings || [])]

                if (!parsedData.credentials || parsedData.credentials.length === 0) {
                    warnings.push("No credential information was found in the document.")
                }

                if (parsedData.credentials?.some((c) => c.courses.length === 0)) {
                    warnings.push("Some credentials have no course information.")
                }

                // Send complete event
                sendEvent("complete", {
                    data: parsedData,
                    warnings,
                })
            } catch (error) {
                console.error("AI analysis error:", error)
                sendEvent("error", {
                    message: error instanceof Error ? error.message : "AI analysis failed. Please try again.",
                })
            }

            controller.close()
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    })
}

/**
 * Create an error response for validation failures
 */
function createErrorResponse(message: string) {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        start(controller) {
            const payload = JSON.stringify({ type: "error", message })
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
            controller.close()
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    })
}
