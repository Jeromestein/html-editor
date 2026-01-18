import { GoogleGenerativeAI } from "@google/generative-ai"

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

/**
 * Prompt template for transcript/diploma PDF analysis
 */
const TRANSCRIPT_ANALYSIS_PROMPT = `You are an expert at analyzing academic transcripts, diplomas, and educational documents.

Analyze this PDF document and extract structured information for a Foreign Credential Evaluation (FCE) report.

IMPORTANT RULES:
1. Only process English documents. If the document is primarily in another language, set isEnglish to false and indicate the detected language.
2. Extract ALL courses with their year, name, credits, and grades
3. Identify the grading scale used and provide US grade equivalents
4. If information is not found, use "N/A"
5. Be precise with dates, names, and numbers

Return a JSON object with this EXACT structure (no additional text, just valid JSON):
{
  "isEnglish": true,
  "detectedLanguage": "English",
  "name": "Full name of the student",
  "dob": "Date of birth (format: Month DD, YYYY) or N/A",
  "country": "Country where the institution is located",
  "credentials": [
    {
      "awardingInstitution": "Full name of the institution",
      "country": "Country of the institution",
      "program": "Name of the program or major",
      "admissionRequirements": "Description of admission requirements if stated, else N/A",
      "grantsAccessTo": "What this credential grants access to (e.g., Graduate Programs)",
      "standardProgramLength": "Duration of the program (e.g., Four years)",
      "yearsAttended": "Start year - End year (e.g., 2015 - 2019)",
      "yearOfGraduation": "Graduation year",
      "courses": [
        {
          "year": "Academic year (e.g., 2015-2016)",
          "name": "Course name",
          "credits": "Number of credits as string",
          "grade": "Grade received"
        }
      ],
      "gradeConversion": [
        {
          "grade": "Original grade (e.g., 5.0, A, Excellent)",
          "usGrade": "US equivalent (A, A-, B+, B, C+, C, D, F)"
        }
      ]
    }
  ],
  "documents": [
    {
      "title": "Document title (e.g., Bachelor's Degree Diploma)",
      "issuedBy": "Issuing institution",
      "dateIssued": "Issue date or N/A",
      "certificateNo": "Certificate/diploma number or N/A"
    }
  ]
}`

/**
 * Analyze PDF directly using Gemini API (no text extraction needed)
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @returns Structured data for report
 */
export async function analyzePdfWithGemini(pdfBuffer: ArrayBuffer): Promise<{
  isEnglish: boolean
  detectedLanguage: string
  data: Record<string, unknown> | null
}> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({ model: "gemini-3-pro" })

  // Convert ArrayBuffer to base64 for Gemini
  const base64Data = Buffer.from(pdfBuffer).toString("base64")

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
      { text: TRANSCRIPT_ANALYSIS_PROMPT },
    ])

    const response = result.response
    const responseText = response.text()

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const parsed = JSON.parse(jsonStr)

    return {
      isEnglish: parsed.isEnglish !== false,
      detectedLanguage: parsed.detectedLanguage || "Unknown",
      data: parsed,
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error(
      `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}
