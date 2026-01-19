/**
 * Gemini API Client
 * 
 * Multi-stage PDF analysis architecture:
 *   Stage 1: Pure PDF parsing - no tools, focus on data completeness
 *   Stage 2: Data processing - grade conversion, references, evaluation notes
 *   Stage 3: Website search - Google Search for institution websites
 * 
 * Uses @google/genai SDK with progress callback support.
 */

import { GoogleGenAI, type Content, type Part, type FunctionCall } from "@google/genai"
import {
    ParsedPdfResponseSchema,
    parsedPdfResponseJsonSchema,
    TranscriptResponseSchema,
    transcriptResponseJsonSchema,
    STAGE1_PDF_PARSING_INSTRUCTION,
    STAGE2_DATA_PROCESSING_INSTRUCTION,
    type ParsedPdfResponse,
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
    | "parsing_pdf"
    | "extracting_courses"
    | "converting_grades"
    | "finding_refs"
    | "calculating_gpa"
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

// ============================================================================
// Stage 1: Pure PDF Parsing
// ============================================================================

/**
 * Stage 1: Parse PDF and extract raw data
 * Focus: Data completeness - extract ALL courses without any conversion
 * 
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @param onProgress - Optional callback for progress updates
 * @returns Raw parsed PDF data (no usGrade, usCredits, references)
 */
async function stage1ParsePdf(
    pdfBuffer: ArrayBuffer,
    onProgress?: ProgressCallback
): Promise<ParsedPdfResponse> {
    const client = getGeminiClient()

    onProgress?.("parsing_pdf", "Analyzing document structure...")

    const base64Data = Buffer.from(pdfBuffer).toString("base64")

    console.log("=== STAGE 1: PDF PARSING ===")

    const result = await client.models.generateContent({
        model: "gemini-3-pro-preview",
        config: {
            systemInstruction: STAGE1_PDF_PARSING_INSTRUCTION,
            responseMimeType: "application/json" as const,
            responseSchema: parsedPdfResponseJsonSchema,
        },
        // NO tools - pure extraction
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
                    { text: "Extract ALL information from this academic document. Do NOT skip any courses." },
                ],
            },
        ],
    })

    const textPart = result.candidates?.[0]?.content?.parts?.find((p: Part) => p.text)
    const response = textPart?.text || ""

    console.log("=== STAGE 1 RAW RESPONSE ===")
    console.log(response.substring(0, 2000) + (response.length > 2000 ? "..." : ""))

    const parsed = JSON.parse(response) as ParsedPdfResponse
    const validated = ParsedPdfResponseSchema.parse(parsed)

    // Sort credentials by graduation year (ascending)
    validated.credentials.sort((a, b) => {
        const getYear = (str: string) => {
            const match = str.match(/\d{4}/)
            return match ? parseInt(match[0]) : 9999
        }
        return getYear(a.yearOfGraduation) - getYear(b.yearOfGraduation)
    })

    // Log extraction stats
    const totalCourses = validated.credentials.reduce(
        (sum, cred) => sum + cred.courses.length, 0
    )
    console.log(`=== STAGE 1 COMPLETE: Extracted ${totalCourses} courses ===`)

    onProgress?.("extracting_courses", `Extracted ${totalCourses} courses`)

    return validated
}

// ============================================================================
// Stage 2: Data Processing
// ============================================================================

/**
 * Stage 2: Process parsed data with grade conversion and references
 * 
 * @param parsedData - Raw data from Stage 1
 * @param onProgress - Optional callback for progress updates
 * @returns Full TranscriptResponse with usGrade, usCredits, references, etc.
 */
async function stage2ProcessData(
    parsedData: ParsedPdfResponse,
    gradingScaleContext?: string,
    onProgress?: ProgressCallback
): Promise<{ data: TranscriptResponse; warnings: string[] }> {
    const client = getGeminiClient()
    const warnings: string[] = []

    onProgress?.("converting_grades", "Processing grades and credits...")

    console.log("=== STAGE 2: DATA PROCESSING ===")

    const modelConfig = {
        model: "gemini-3-flash-preview",
        config: {
            systemInstruction: STAGE2_DATA_PROCESSING_INSTRUCTION,
            responseMimeType: "application/json" as const,
            responseSchema: transcriptResponseJsonSchema,
        },
        tools: [{ functionDeclarations: toolDeclarations }],
    }

    // Initial request with parsed data as context
    let result = await client.models.generateContent({
        ...modelConfig,
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Process this parsed academic document data and:
1. Convert all grades to US equivalents using lookup_grade_conversion_batch
2. Calculate US credits (1 Year = 30 US Credits)
3. Get references using lookup_references
4. Generate grade conversion table
5. Generate equivalence statement and evaluation notes

Background Information on Grading System:
${gradingScaleContext || "No specific online grading scale found."}

Parsed PDF Data:
${JSON.stringify(parsedData, null, 2)}`,
                    },
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

        const functionCalls = (candidate.content?.parts || []).filter(
            (p: Part) => p.functionCall !== undefined
        )

        if (functionCalls.length === 0) {
            console.log(`=== STAGE 2 ROUND ${rounds}: FINAL RESPONSE ===`)
            break
        }

        console.log(`=== STAGE 2 ROUND ${rounds}: ${functionCalls.length} FUNCTION CALL(S) ===`)

        // Build conversation history
        const history: Content[] = [
            {
                role: "user",
                parts: [
                    { text: `Process this parsed data: ${JSON.stringify(parsedData)}` },
                ],
            },
            {
                role: "model",
                parts: candidate.content?.parts || [],
            },
        ]

        // Process function calls
        const functionResponseParts: Part[] = []

        for (const part of functionCalls) {
            if (part.functionCall) {
                const { name, args } = part.functionCall as FunctionCall

                // Update progress
                if (name === "lookup_grade_conversion_batch") {
                    onProgress?.("converting_grades", "Looking up grade conversion rules...")
                } else if (name === "lookup_references") {
                    onProgress?.("finding_refs", "Finding references...")
                }

                const { result: toolResult, warning } = await executeTool(
                    name || "",
                    (args as Record<string, unknown>) || {}
                )

                if (warning) {
                    warnings.push(warning)
                }

                functionResponseParts.push({
                    functionResponse: {
                        name: name || "",
                        response: toolResult as Record<string, unknown>,
                    },
                })
            }
        }

        // Add function responses and continue
        history.push({
            role: "user",
            parts: functionResponseParts,
        })

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

    console.log("=== STAGE 2 RAW RESPONSE ===")
    console.log(finalResponse.substring(0, 2000) + (finalResponse.length > 2000 ? "..." : ""))

    const parsed = JSON.parse(finalResponse) as TranscriptResponse
    const validated = TranscriptResponseSchema.parse(parsed)

    console.log("=== STAGE 2 COMPLETE ===")

    return { data: validated, warnings }
}

// ============================================================================
// Stage 1.5: Institution Info Search (Website + Grading Scale)
// ============================================================================

/**
 * Stage 1.5: Search for institution websites and grading scales
 * 
 * @param institutionNames - Array of institution names to search
 * @returns Object with official website citations and grading scale context
 */
export async function searchInstitutionInfo(institutionNames: string[]): Promise<{
    officialWebsiteCitations: string[],
    gradingScaleContext: string
}> {
    if (institutionNames.length === 0) {
        return { officialWebsiteCitations: [], gradingScaleContext: "" }
    }

    const client = getGeminiClient()

    const prompt = `Perform a comprehensive search for the following educational institutions.
    
Institutions to search:
${institutionNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

Instructions:
1. SEARCH TASK 1: Find the official website URL for each institution.
   - Format as APA citation: Institution Name. (n.d.). Home. Retrieved from URL
   
2. SEARCH TASK 2: Find the specific grading scale information for each institution, preferably from Scholaro.
   - Search query format: "Institution Name grading scale Scholaro"
   - Summarize the grading scale found (e.g., "0-10 scale, passing is 5", "A-F scale").

3. OUTPUT FORMAT: Return a SINGLE JSON object with two fields:
   - "officialWebsiteCitations": Array of strings (APA citations for official websites)
   - "gradingScaleContext": A single string summarizing the grading systems found for all institutions.

Example response:
{
  "officialWebsiteCitations": [
    "Peking University. (n.d.). Home. Retrieved from https://www.pku.edu.cn"
  ],
  "gradingScaleContext": "Peking University uses a 0-100 scale where 60 is proper passing. For Scholaro, 90-100 is A, 80-89 is B..."
}

Your response (JSON object only):`

    try {
        console.log("=== STAGE 1.5: SEARCHING INSTITUTION INFO ===")
        console.log("Institutions:", institutionNames)

        const result = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            config: {
                tools: [{ googleSearch: {} }],
            },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        })

        const textPart = result.candidates?.[0]?.content?.parts?.find((p: Part) => p.text)
        const response = textPart?.text || ""

        console.log("Search response:", response.substring(0, 500) + "...")

        let jsonText = response.trim()

        // Clean markdown code blocks
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```[\s\S]*$/, "")
        } else if (jsonText.includes("```json")) {
            // Sometimes it might be embedded
            const match = jsonText.match(/```json\n([\s\S]*?)\n```/)
            if (match) jsonText = match[1]
        }

        try {
            // First try parsing as is
            const parsed = JSON.parse(jsonText)

            return {
                officialWebsiteCitations: Array.isArray(parsed.officialWebsiteCitations) ? parsed.officialWebsiteCitations : [],
                gradingScaleContext: typeof parsed.gradingScaleContext === 'string' ? parsed.gradingScaleContext : JSON.stringify(parsed.gradingScaleContext || "")
            }
        } catch (parseError) {
            console.warn("Failed to parse search JSON:", parseError)
            // Fallback: try to extract array if main parse fails
            const arrayMatch = jsonText.match(/\[[\s\S]*\]/)
            if (arrayMatch) {
                try {
                    const arr = JSON.parse(arrayMatch[0])
                    return { officialWebsiteCitations: arr, gradingScaleContext: "" }
                } catch (e) { }
            }
            return { officialWebsiteCitations: [], gradingScaleContext: "" }
        }
    } catch (error) {
        console.warn("Institution info search failed:", error)
        return { officialWebsiteCitations: [], gradingScaleContext: "" }
    }
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Analyze PDF using multi-stage Gemini processing
 * 
 * Stage 1: Pure PDF parsing (no tools) - ensures data completeness
 * Stage 2: Data processing (with tools) - grade conversion, references
 * Stage 3: Website search - institution official websites
 * 
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @param onProgress - Optional callback for progress updates
 * @returns Structured data for report with warnings
 */
export async function analyzePdfWithGemini(
    pdfBuffer: ArrayBuffer,
    onProgress?: ProgressCallback
): Promise<AnalyzePdfResult> {
    const warnings: string[] = []

    try {
        // ========== Stage 1: Pure PDF Parsing ==========
        const parsedData = await stage1ParsePdf(pdfBuffer, onProgress)

        // ========== Stage 1.5: Institution Info Search (Website + Grading Scale) ==========
        onProgress?.("searching_websites", "Searching institution info & grading scales...")

        const institutionNames = parsedData.credentials
            .map((c) => c.awardingInstitution)
            .filter((name, index, self) => self.indexOf(name) === index)

        // Search for both official websites and grading scale info (Scholaro)
        const { officialWebsiteCitations, gradingScaleContext } = await searchInstitutionInfo(institutionNames)

        console.log("=== SEARCH RESULTS ===")
        console.log("Grading Context:", gradingScaleContext.substring(0, 200) + "...")
        console.log("Official Websites:", officialWebsiteCitations)

        // ========== Stage 2: Data Processing ==========
        // Pass the grading scale context to Stage 2
        const { data: processedData, warnings: stage2Warnings } = await stage2ProcessData(
            parsedData,
            gradingScaleContext,
            onProgress
        )
        warnings.push(...stage2Warnings)

        // ========== Stage 2.5: Direct Database Reference Lookup ==========
        onProgress?.("finding_refs", "Looking up authoritative references...")

        const { executeReferenceLookup } = await import("./tools/reference-lookup")
        const country = processedData.credentials[0]?.country || processedData.country || "Global"
        const refResult = await executeReferenceLookup({ country })

        if (refResult.success && refResult.references.length > 0) {
            console.log("=== DATABASE REFERENCES ===")
            console.log(refResult.references)

            // Merge with existing references (avoid duplicates)
            const existingCitations = new Set(
                processedData.references.map(r => r.citation)
            )
            for (const ref of refResult.references) {
                if (!existingCitations.has(ref.citation)) {
                    processedData.references.push({ citation: ref.citation })
                }
            }
        }

        // Add official website citations LAST (and do NOT add detailed grading info/Scholaro links to refs)
        if (officialWebsiteCitations.length > 0) {
            const existingCitations = new Set(
                processedData.references.map(r => r.citation)
            )
            for (const citation of officialWebsiteCitations) {
                if (!existingCitations.has(citation)) {
                    processedData.references.push({ citation })
                }
            }
        }



        // ========== Complete ==========
        onProgress?.("complete", "Analysis complete!")

        console.log("=== FINAL RESULT ===")
        console.log(`Total courses: ${processedData.credentials.reduce(
            (sum, c) => sum + c.courses.length, 0
        )}`)
        console.log(`Total references: ${processedData.references.length}`)

        return {
            isEnglish: processedData.isEnglish !== false,
            detectedLanguage: processedData.detectedLanguage || "Unknown",
            data: processedData,
            warnings,
        }
    } catch (error) {
        console.error("Gemini API error:", error)
        throw new Error(
            `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}
