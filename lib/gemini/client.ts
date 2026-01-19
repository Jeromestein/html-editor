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
        tools: [{ functionDeclarations: toolDeclarations }],
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

        // Stage 2: Search for institution websites
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

    // Use Gemini 2.0 Flash with Google Search (no function calling)
    const model = client.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
        },
        tools: [{ googleSearch: {} } as any],
    })

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

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        console.log("Website search response:", response)

        // Parse the JSON array response (strip markdown code fences if present)
        let jsonText = response.trim()
        if (jsonText.startsWith("```")) {
            // Remove opening fence (e.g., ```json or ```)
            jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "")
            // Remove closing fence
            jsonText = jsonText.replace(/\n?```\s*$/, "")
        }
        const citations = JSON.parse(jsonText) as string[]
        return Array.isArray(citations) ? citations : []
    } catch (error) {
        console.warn("Website search failed:", error)
        return []
    }
}
