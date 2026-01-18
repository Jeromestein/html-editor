import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai"
import { z } from "zod"

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

// ============================================================================
// Zod Schemas for structured output
// ============================================================================

const CourseSchema = z.object({
  year: z.string().describe("Academic year (e.g., 2015-2016)"),
  name: z.string().describe("Course name"),
  credits: z.string().describe("Original credits as string"),
  grade: z.string().describe("Original grade received"),
  usGrade: z.string().describe("Converted US grade (A, B, C, D, F)"),
  usCredits: z.string().describe("Converted US semester credits as string"),
  level: z.string().describe("Course level: LD, UD, or GR"),
  conversionSource: z.string().describe("AICE_RULES or AI_INFERRED"),
})

const GradeConversionSchema = z.object({
  grade: z.string().describe("Original grade (e.g., 85-100, 5, A)"),
  usGrade: z.string().describe("US equivalent (A, B, C, D, F)"),
})

const CredentialSchema = z.object({
  awardingInstitution: z.string().describe("Full name of the institution"),
  country: z.string().describe("Country of the institution"),
  program: z.string().describe("Name of the program or major"),
  admissionRequirements: z.string().describe("Admission requirements if stated, else N/A"),
  grantsAccessTo: z.string().describe("What this credential grants access to"),
  standardProgramLength: z.string().describe("Duration of the program"),
  yearsAttended: z.string().describe("Start year - End year"),
  yearOfGraduation: z.string().describe("Graduation year"),
  totalYearCredits: z.string().describe("Typical total credits per academic year"),
  courses: z.array(CourseSchema),
  gradeConversion: z.array(GradeConversionSchema),
})

const DocumentSchema = z.object({
  title: z.string().describe("Document title (e.g., Bachelor's Degree Diploma)"),
  issuedBy: z.string().describe("Issuing institution"),
  dateIssued: z.string().describe("Issue date or N/A"),
  certificateNo: z.string().describe("Certificate/diploma number or N/A"),
})

const TranscriptResponseSchema = z.object({
  isEnglish: z.boolean().describe("Whether the document is in English"),
  detectedLanguage: z.string().describe("Detected language of the document"),
  name: z.string().describe("Full name of the student"),
  dob: z.string().describe("Date of birth (format: Month DD, YYYY) or N/A"),
  country: z.string().describe("Country where the institution is located"),
  credentials: z.array(CredentialSchema),
  documents: z.array(DocumentSchema),
})

// Export type for use in other modules
export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>

// ============================================================================
// JSON Schema for Gemini API (converted from Zod)
// ============================================================================

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isEnglish: { type: SchemaType.BOOLEAN, description: "Whether the document is in English" },
    detectedLanguage: { type: SchemaType.STRING, description: "Detected language of the document" },
    name: { type: SchemaType.STRING, description: "Full name of the student" },
    dob: { type: SchemaType.STRING, description: "Date of birth (format: Month DD, YYYY) or N/A" },
    country: { type: SchemaType.STRING, description: "Country where the institution is located" },
    credentials: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          awardingInstitution: { type: SchemaType.STRING, description: "Full name of the institution" },
          country: { type: SchemaType.STRING, description: "Country of the institution" },
          program: { type: SchemaType.STRING, description: "Name of the program or major" },
          admissionRequirements: { type: SchemaType.STRING, description: "Admission requirements if stated, else N/A" },
          grantsAccessTo: { type: SchemaType.STRING, description: "What this credential grants access to" },
          standardProgramLength: { type: SchemaType.STRING, description: "Duration of the program" },
          yearsAttended: { type: SchemaType.STRING, description: "Start year - End year" },
          yearOfGraduation: { type: SchemaType.STRING, description: "Graduation year" },
          totalYearCredits: { type: SchemaType.STRING, description: "Typical total credits per academic year" },
          courses: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                year: { type: SchemaType.STRING, description: "Academic year" },
                name: { type: SchemaType.STRING, description: "Course name" },
                credits: { type: SchemaType.STRING, description: "Original credits" },
                grade: { type: SchemaType.STRING, description: "Original grade" },
                usGrade: { type: SchemaType.STRING, description: "US grade (A, B, C, D, F)" },
                usCredits: { type: SchemaType.STRING, description: "US semester credits" },
                level: { type: SchemaType.STRING, description: "LD, UD, or GR" },
                conversionSource: { type: SchemaType.STRING, description: "AICE_RULES or AI_INFERRED" },
              },
              required: ["year", "name", "credits", "grade", "usGrade", "usCredits", "level", "conversionSource"],
            },
          },
          gradeConversion: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                grade: { type: SchemaType.STRING, description: "Original grade" },
                usGrade: { type: SchemaType.STRING, description: "US equivalent" },
              },
              required: ["grade", "usGrade"],
            },
          },
        },
        required: ["awardingInstitution", "country", "program", "admissionRequirements", "grantsAccessTo", "standardProgramLength", "yearsAttended", "yearOfGraduation", "totalYearCredits", "courses", "gradeConversion"],
      },
    },
    documents: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Document title" },
          issuedBy: { type: SchemaType.STRING, description: "Issuing institution" },
          dateIssued: { type: SchemaType.STRING, description: "Issue date or N/A" },
          certificateNo: { type: SchemaType.STRING, description: "Certificate number or N/A" },
        },
        required: ["title", "issuedBy", "dateIssued", "certificateNo"],
      },
    },
  },
  required: ["isEnglish", "detectedLanguage", "name", "dob", "country", "credentials", "documents"],
}

/**
 * System instruction for transcript/diploma PDF analysis
 */
const TRANSCRIPT_ANALYSIS_INSTRUCTION = `You are an expert at analyzing academic transcripts, diplomas, and educational documents for Foreign Credential Evaluation (FCE).

IMPORTANT RULES:
1. Only process English documents. If primarily in another language, set isEnglish to false.
2. Extract ALL courses with their year, name, credits, and grades.
3. Convert grades to US equivalents using AICE standards:
   - China (0-100): 85-100=A, 75-84=B, 60-74=C, <60=F
   - Russia (1-5): 5=A, 4=B, 3=C, 2=F
   - India: 60-100=A, 50-59=B, 40-49=C, <40=F
   - UK: First=A, 2:1=B+, 2:2=B, Third=C, Pass=D, Fail=F
   - For unknown scales, use best judgment and set conversionSource to "AI_INFERRED"
4. Convert credits: 1 Academic Year = 30 US Semester Credits
5. Determine course level: Years 1-2 = "LD", Years 3-4 = "UD", Graduate = "GR"
6. Be precise with dates, names, and numbers
7. If information is not found, use "N/A"`

/**
 * Analyze PDF directly using Gemini API with structured output
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @returns Structured data for report (type-safe)
 */
export async function analyzePdfWithGemini(pdfBuffer: ArrayBuffer): Promise<{
  isEnglish: boolean
  detectedLanguage: string
  data: TranscriptResponse | null
}> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: TRANSCRIPT_ANALYSIS_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  })

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
      { text: "Analyze this academic document and extract structured information." },
    ])

    const response = result.response
    const responseText = response.text()

    console.log("=== GEMINI RAW RESPONSE ===")
    console.log(responseText)
    console.log("===========================")

    // With structured output, Gemini guarantees valid JSON
    const parsed = JSON.parse(responseText) as TranscriptResponse

    // Validate with Zod for runtime type safety
    const validated = TranscriptResponseSchema.parse(parsed)

    console.log("=== ZOD VALIDATED DATA ===")
    console.log(JSON.stringify(validated, null, 2))
    console.log("==========================")

    return {
      isEnglish: validated.isEnglish !== false,
      detectedLanguage: validated.detectedLanguage || "Unknown",
      data: validated,
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error(
      `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}
