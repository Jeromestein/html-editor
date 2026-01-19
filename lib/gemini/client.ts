/**
 * Gemini API Client
 * 
 * Handles Gemini client initialization and PDF analysis with function calling.
 * Uses @google/genai SDK with progress callback support.
 */

import { GoogleGenAI, type Content, type Part, type FunctionCall } from "@google/genai"
import {
    TranscriptResponseSchema,
    transcriptResponseJsonSchema,
    TRANSCRIPT_ANALYSIS_INSTRUCTION,
    type TranscriptResponse,
} from "./schemas"
import { toolDeclarations, executeTool } from "./tools"

// Singleton instance for Gemini client
let geminiClient: GoogleGenAI | null = null

/**
 * Get or create a Gemini client instance
 * @throws Error if GEMINI_API_KEY is not set
 */
export function getGeminiClient(): GoogleGenAI {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not set")
        }
        geminiClient = new GoogleGenAI({ apiKey })
    }
    return geminiClient
}

// Maximum number of function call rounds
const MAX_FUNCTION_CALL_ROUNDS = 10

/**
 * Progress phase types for UI feedback
 */
export type ProgressPhase =
    | "uploading"
    | "detecting"
    | "extracting_student"
    | "extracting_courses"
    | "converting_grades"
    | "calculating_gpa"
    | "finding_refs"
    | "generating"
    | "searching_websites"
    | "complete"

export type ProgressCallback = (phase: ProgressPhase, detail?: string) => void

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
 * Map function call name to progress phase
 */
function getFunctionCallPhase(name: string): ProgressPhase {
    switch (name) {
        case "lookup_grade_conversion":
            return "converting_grades"
        case "calculate_gpa":
            return "calculating_gpa"
        case "lookup_references":
            return "finding_refs"
        default:
            return "generating"
    }
}

/**
 * Analyze PDF directly using Gemini API with structured output and function calling
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @param onProgress - Optional callback for progress updates
 * @returns Structured data for report (type-safe) with warnings
 */
export async function analyzePdfWithGemini(
    pdfBuffer: ArrayBuffer,
    onProgress?: ProgressCallback
): Promise<AnalyzePdfResult> {
    const client = getGeminiClient()
    const warnings: string[] = []

    // Notify: detecting document type
    onProgress?.("detecting", "Starting AI analysis...")

    // Convert ArrayBuffer to base64 for Gemini
    const base64Data = Buffer.from(pdfBuffer).toString("base64")

    try {
        // Prepare model configuration
        const modelConfig = {
            model: "gemini-3-flash-preview",
            systemInstruction: TRANSCRIPT_ANALYSIS_INSTRUCTION,
            config: {
                responseMimeType: "application/json" as const,
                responseSchema: transcriptResponseJsonSchema,
            },
            tools: [{ functionDeclarations: toolDeclarations }],
        }

        // First call with PDF content
        console.log("=== INITIAL REQUEST ===")
        onProgress?.("extracting_student", "Extracting student information...")

        let result = await client.models.generateContent({
            ...modelConfig,
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: "application/pdf",
                                data: base64Data,
                            },
                        },
                        { text: "Analyze this academic document and extract structured information. Use the tools available to look up grade conversion rules, calculate GPA, and find references." },
                    ],
                },
            ],
        })

        let rounds = 0

        // Function calling loop
        while (rounds < MAX_FUNCTION_CALL_ROUNDS) {
            rounds++

            const candidate = result.candidates?.[0]
            if (!candidate) {
                throw new Error("No response candidate from Gemini")
            }

            // Check for function calls
            const functionCalls = (candidate.content?.parts || []).filter(
                (p: Part) => p.functionCall !== undefined
            )

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
                    parts: candidate.content?.parts || [],
                },
            ]

            // Process function calls and build responses
            const functionResponseParts: Part[] = []

            for (const part of functionCalls) {
                if (part.functionCall) {
                    const { name, args } = part.functionCall as FunctionCall

                    // Notify progress for this function call
                    const phase = getFunctionCallPhase(name || "")
                    onProgress?.(phase, `Processing ${name}...`)

                    // Execute the tool
                    const { result: toolResult, warning } = await executeTool(
                        name || "",
                        (args as Record<string, unknown>) || {}
                    )

                    // Collect warnings
                    if (warning) {
                        warnings.push(warning)
                    }

                    // Add function response
                    functionResponseParts.push({
                        functionResponse: {
                            name: name || "",
                            response: toolResult as Record<string, unknown>,
                        },
                    })
                }
            }

            // Add function responses to history
            history.push({
                role: "user",
                parts: functionResponseParts,
            })

            onProgress?.("generating", "Generating final report...")

            // Continue with function results
            result = await client.models.generateContent({
                ...modelConfig,
                contents: history,
            })
        }

        if (rounds >= MAX_FUNCTION_CALL_ROUNDS) {
            warnings.push(`Max function call rounds (${MAX_FUNCTION_CALL_ROUNDS}) reached`)
        }

        const finalCandidate = result.candidates?.[0]
        const textPart = finalCandidate?.content?.parts?.find((p: Part) => p.text)
        const finalResponse = textPart?.text || ""

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

        // Stage 2: Search for institution websites
        onProgress?.("searching_websites", "Searching institution websites...")

        const institutionNames = validated.credentials
            .map((c) => c.awardingInstitution)
            .filter((name, index, self) => self.indexOf(name) === index) // unique

        const websiteCitations = await searchInstitutionWebsites(institutionNames)

        // Append website citations to references
        if (websiteCitations.length > 0) {
            console.log("=== WEBSITE CITATIONS ===")
            console.log(websiteCitations)
            console.log("=========================")

            for (const citation of websiteCitations) {
                validated.references.push({ citation })
            }
        }

        onProgress?.("complete", "Analysis complete!")

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

/**
 * Stage 2: Search for institution websites using Gemini 2.0 Flash with Google Search
 * @param institutionNames - Array of institution names to search
 * @returns Array of APA-formatted website citations
 */
export async function searchInstitutionWebsites(institutionNames: string[]): Promise<string[]> {
    if (institutionNames.length === 0) {
        return []
    }

    const client = getGeminiClient()

    const prompt = `Search for the official websites of the following educational institutions and return APA-formatted citations.

Institutions to search:
${institutionNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

For each institution, search for its official website URL and format as an APA citation:
Format: Institution Name. (n.d.). Home. URL

Return a JSON array of citation strings. Example:
["Peking University. (n.d.). Home. https://www.pku.edu.cn", "Tsinghua University. (n.d.). Home. https://www.tsinghua.edu.cn"]

If you cannot find the official website for an institution, skip it.`

    try {
        console.log("=== STAGE 2: SEARCHING INSTITUTION WEBSITES ===")
        console.log("Institutions:", institutionNames)

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            config: {
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }],
            },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        })

        const textPart = result.candidates?.[0]?.content?.parts?.find((p: Part) => p.text)
        const response = textPart?.text || ""

        console.log("Website search response:", response)

        // Handle empty response
        if (!response || response.trim() === "") {
            console.warn("Website search returned empty response")
            return []
        }

        // Parse the JSON array response (handle various formats)
        let jsonText = response.trim()

        // Try to extract JSON array using regex (handles markdown fences and extra content)
        const jsonArrayMatch = jsonText.match(/\[[\s\S]*?\]/)
        if (jsonArrayMatch) {
            jsonText = jsonArrayMatch[0]
        } else {
            // Fallback: strip markdown fences
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "")
                jsonText = jsonText.replace(/\n?```[\s\S]*$/, "")
            }
        }

        // Validate before parsing
        if (!jsonText || jsonText.trim() === "" || !jsonText.includes("[")) {
            console.warn("Website search response is not a valid JSON array")
            return []
        }

        try {
            const citations = JSON.parse(jsonText) as string[]
            return Array.isArray(citations) ? citations : []
        } catch (parseError) {
            console.warn("Failed to parse website search JSON:", parseError)
            return []
        }
    } catch (error) {
        console.warn("Website search failed:", error)
        return []
    }
}
