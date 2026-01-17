// Use legacy build for Node.js server-side compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs")
import type { SampleData, Credential, CredentialDocument, Course, GradeConversionRow } from "./report-data"

// Disable worker in Node.js environment (use main thread)
pdfjsLib.GlobalWorkerOptions.workerSrc = ""


/**
 * Parsed course data from PDF
 */
export type ParsedCourse = {
    year: string
    name: string
    credits: string
    grade: string
}

/**
 * Parsed credential data from PDF
 */
export type ParsedCredential = {
    awardingInstitution: string
    country: string
    program: string
    admissionRequirements: string
    grantsAccessTo: string
    standardProgramLength: string
    yearsAttended: string
    yearOfGraduation: string
    courses: ParsedCourse[]
    gradeConversion: GradeConversionRow[]
}

/**
 * Parsed document info from PDF
 */
export type ParsedDocument = {
    title: string
    issuedBy: string
    dateIssued: string
    certificateNo: string
}

/**
 * Complete parsed data from PDF
 */
export type ParsedPdfData = {
    name?: string
    dob?: string
    country?: string
    credentials: ParsedCredential[]
    documents: ParsedDocument[]
}

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as ArrayBuffer
 * @returns Extracted text from all pages
 */
export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
        const uint8Array = new Uint8Array(buffer)
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
        const pdf = await loadingTask.promise

        const textParts: string[] = []

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
                .map((item: { str?: string }) => ("str" in item ? item.str : ""))
                .join(" ")
            textParts.push(pageText)
        }

        return textParts.join("\n\n--- Page Break ---\n\n")
    } catch (error) {
        console.error("PDF extraction error:", error)
        throw new Error(
            `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}

/**
 * Detect if text is primarily English
 * Uses a simple heuristic based on character distribution
 * @param text - Text to analyze
 * @returns Language detection result
 */
export function detectLanguage(text: string): {
    isEnglish: boolean
    detected: string
    confidence: number
} {
    // Remove whitespace and common punctuation for analysis
    const cleanText = text.replace(/[\s\d.,;:!?'"()\-–—]/g, "")

    if (cleanText.length === 0) {
        return { isEnglish: true, detected: "Unknown", confidence: 0 }
    }

    // Count ASCII letters (a-z, A-Z) vs non-ASCII characters
    let asciiCount = 0
    let nonAsciiCount = 0
    let chineseCount = 0
    let cyrillicCount = 0
    let arabicCount = 0

    for (const char of cleanText) {
        const code = char.charCodeAt(0)

        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
            asciiCount++
        } else if (code > 127) {
            nonAsciiCount++

            // Chinese characters (CJK Unified Ideographs)
            if (code >= 0x4e00 && code <= 0x9fff) {
                chineseCount++
            }
            // Cyrillic
            else if (code >= 0x0400 && code <= 0x04ff) {
                cyrillicCount++
            }
            // Arabic
            else if (code >= 0x0600 && code <= 0x06ff) {
                arabicCount++
            }
        }
    }

    const total = asciiCount + nonAsciiCount
    const asciiRatio = asciiCount / total

    // Determine detected language
    let detected = "English"
    if (chineseCount > total * 0.2) {
        detected = "Chinese"
    } else if (cyrillicCount > total * 0.2) {
        detected = "Russian/Cyrillic"
    } else if (arabicCount > total * 0.2) {
        detected = "Arabic"
    } else if (nonAsciiCount > total * 0.3) {
        detected = "Non-English"
    }

    // Consider English if ASCII ratio is above 70%
    const isEnglish = asciiRatio >= 0.7

    return {
        isEnglish,
        detected: isEnglish ? "English" : detected,
        confidence: Math.round(asciiRatio * 100),
    }
}

/**
 * Convert parsed AI response to SampleData format
 * @param aiData - Data from Gemini API
 * @returns Partial SampleData for merging
 */
export function convertToSampleData(
    aiData: Record<string, unknown>
): Partial<SampleData> {
    const result: Partial<SampleData> = {}

    // Top-level fields
    if (typeof aiData.name === "string") {
        result.name = aiData.name
    }
    if (typeof aiData.dob === "string") {
        result.dob = aiData.dob
    }
    if (typeof aiData.country === "string") {
        result.country = aiData.country
    }

    // Credentials
    if (Array.isArray(aiData.credentials)) {
        result.credentials = aiData.credentials.map(
            (cred: Record<string, unknown>, index: number): Credential => ({
                id: index + 1,
                awardingInstitution: String(cred.awardingInstitution || "N/A"),
                country: String(cred.country || "N/A"),
                program: String(cred.program || "N/A"),
                admissionRequirements: String(cred.admissionRequirements || "N/A"),
                grantsAccessTo: String(cred.grantsAccessTo || "N/A"),
                standardProgramLength: String(cred.standardProgramLength || "N/A"),
                yearsAttended: String(cred.yearsAttended || "N/A"),
                yearOfGraduation: String(cred.yearOfGraduation || "N/A"),
                equivalenceStatement: "", // To be filled by evaluator
                gpa: "", // Will be calculated
                totalCredits: "", // Will be calculated
                courses: Array.isArray(cred.courses)
                    ? cred.courses.map(
                        (course: Record<string, unknown>, courseIndex: number): Course => ({
                            id: (index + 1) * 1000 + courseIndex + 1,
                            year: String(course.year || ""),
                            name: String(course.name || ""),
                            level: "L", // Default level
                            credits: String(course.credits || "0"),
                            grade: String(course.grade || ""),
                        })
                    )
                    : [],
                gradeConversion: Array.isArray(cred.gradeConversion)
                    ? cred.gradeConversion.map(
                        (gc: Record<string, unknown>): GradeConversionRow => ({
                            grade: String(gc.grade || ""),
                            usGrade: String(gc.usGrade || ""),
                        })
                    )
                    : [],
            })
        )
    }

    // Documents
    if (Array.isArray(aiData.documents)) {
        result.documents = aiData.documents.map(
            (doc: Record<string, unknown>): CredentialDocument => ({
                title: String(doc.title || "N/A"),
                issuedBy: String(doc.issuedBy || "N/A"),
                dateIssued: String(doc.dateIssued || "N/A"),
                certificateNo: String(doc.certificateNo || "N/A"),
            })
        )
    }

    return result
}
