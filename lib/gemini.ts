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
const TRANSCRIPT_ANALYSIS_PROMPT = `You are an expert at analyzing academic transcripts, diplomas, and educational documents for Foreign Credential Evaluation (FCE).

Analyze this PDF document and extract structured information.

IMPORTANT RULES:
1. Only process English documents. If primarily in another language, set isEnglish to false.
2. Extract ALL courses with their year, name, credits, and grades.
3. Convert grades to US equivalents using AICE standards:
   - China (0-100): 85-100=A, 75-84=B, 60-74=C, <60=F
   - Russia (1-5): 5=A, 4=B, 3=C, 2=F
   - India: 60-100=A, 50-59=B, 40-49=C, <40=F
   - UK: First=A, 2:1=B+, 2:2=B, Third=C, Pass=D, Fail=F
   - For unknown scales, use best judgment and mark as "AI_INFERRED"
4. Convert credits: 1 Academic Year = 30 US Semester Credits
5. Determine course level: Years 1-2 = "LD", Years 3-4 = "UD", Graduate = "GR"
6. Be precise with dates, names, and numbers
7. If information is not found, use "N/A"

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
      "totalYearCredits": "Typical total credits per academic year at this institution",
      "courses": [
        {
          "year": "Academic year (e.g., 2015-2016)",
          "name": "Course name",
          "credits": "Original credits as string",
          "grade": "Original grade received",
          "usGrade": "Converted US grade (A, B, C, D, F)",
          "usCredits": "Converted US semester credits as string",
          "level": "LD or UD or GR",
          "conversionSource": "AICE_RULES or AI_INFERRED"
        }
      ],
      "gradeConversion": [
        {
          "grade": "Original grade (e.g., 85-100, 5, A)",
          "usGrade": "US equivalent (A, B, C, D, F)"
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
  const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" })

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
