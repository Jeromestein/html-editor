/**
 * Gemini API Client
 * 
 * Handles Gemini client initialization and PDF analysis with function calling.
 */

import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai"
import {
    TranscriptResponseSchema,
    transcriptResponseSchema,
    TRANSCRIPT_ANALYSIS_INSTRUCTION,
    type TranscriptResponse,
} from "./schemas"
import { toolDeclarations, executeTool } from "./tools"

// Singleton instance for Gemini client
let geminiClient: GoogleGenerativeAI | null = null

/**
 * Get or create a Gemini client instance
 * @throws Error if GEMINI_API_KEY is not set
 */
export function getGeminiClient(): GoogleGenerativeAI {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not set")
        }
        geminiClient = new GoogleGenerativeAI(apiKey)
    }
    return geminiClient
}

// Maximum number of function call rounds
const MAX_FUNCTION_CALL_ROUNDS = 10

/**
 * Result type for PDF analysis
 */
export type AnalyzePdfResult = {
    isEnglish: boolean
    detectedLanguage: string
    data: TranscriptResponse | null
    warnings: string[]
}

/**
 * Analyze PDF directly using Gemini API with structured output and function calling
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @returns Structured data for report (type-safe) with warnings
 */
export async function analyzePdfWithGemini(pdfBuffer: ArrayBuffer): Promise<AnalyzePdfResult> {
    const client = getGeminiClient()
    const warnings: string[] = []

    const model = client.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: TRANSCRIPT_ANALYSIS_INSTRUCTION,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: transcriptResponseSchema,
        },
        tools: [{
            functionDeclarations: toolDeclarations,
            googleSearch: {},
        } as any],
    })

    // Convert ArrayBuffer to base64 for Gemini
    const base64Data = Buffer.from(pdfBuffer).toString("base64")

    try {
        // First call with PDF content
        console.log("=== INITIAL REQUEST ===")
        let result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64Data,
                },
            },
            { text: "Analyze this academic document and extract structured information. Use the tools available to look up grade conversion rules, calculate GPA, and find references." },
        ])

        let response = result.response
        let rounds = 0

        // Function calling loop
        while (rounds < MAX_FUNCTION_CALL_ROUNDS) {
            rounds++

            const candidate = response.candidates?.[0]
            if (!candidate) {
                throw new Error("No response candidate from Gemini")
            }

            // Check for function calls
            const functionCalls = candidate.content.parts.filter((p: Part) => "functionCall" in p)

            if (functionCalls.length === 0) {
                // No function calls - this is the final response
                console.log(`=== ROUND ${rounds}: FINAL RESPONSE (no function calls) ===`)
                break
            }

            console.log(`=== ROUND ${rounds}: ${functionCalls.length} FUNCTION CALL(S) ===`)

            // Build conversation history
            const history: Content[] = [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: "application/pdf",
                                data: base64Data,
                            },
                        },
                        { text: "Analyze this academic document and extract structured information." },
                    ],
                },
                {
                    role: "model",
                    parts: candidate.content.parts,
                },
            ]

            // Process function calls and build responses
            const functionResponseParts: Part[] = []

            for (const part of functionCalls) {
                if ("functionCall" in part && part.functionCall) {
                    const { name, args } = part.functionCall

                    // Execute the tool
                    const { result: toolResult, warning } = await executeTool(
                        name,
                        args as Record<string, unknown>
                    )

                    // Collect warnings
                    if (warning) {
                        warnings.push(warning)
                    }

                    // Add function response
                    functionResponseParts.push({
                        functionResponse: {
                            name,
                            response: toolResult as object,
                        },
                    })
                }
            }

            // Add function responses to history (must use 'function' role, not 'user')
            history.push({
                role: "function",
                parts: functionResponseParts,
            })

            // Create chat with history and send continuation request
            const chat = model.startChat({ history })
            const continueResult = await chat.sendMessage("Continue with the analysis using the function results provided.")
            response = continueResult.response
        }

        if (rounds >= MAX_FUNCTION_CALL_ROUNDS) {
            warnings.push(`Max function call rounds (${MAX_FUNCTION_CALL_ROUNDS}) reached`)
        }

        const finalResponse = response.text()

        console.log("=== GEMINI RAW RESPONSE ===")
        console.log(finalResponse)
        console.log("===========================")

        // With structured output, Gemini guarantees valid JSON
        const parsed = JSON.parse(finalResponse) as TranscriptResponse

        // Validate with Zod for runtime type safety
        const validated = TranscriptResponseSchema.parse(parsed)

        console.log("=== ZOD VALIDATED DATA ===")
        console.log(JSON.stringify(validated, null, 2))
        console.log("==========================")

        return {
            isEnglish: validated.isEnglish !== false,
            detectedLanguage: validated.detectedLanguage || "Unknown",
            data: validated,
            warnings,
        }
    } catch (error) {
        console.error("Gemini API error:", error)
        throw new Error(
            `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}
