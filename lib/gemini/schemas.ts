/**
 * Gemini API Schemas
 * 
 * Contains Zod schemas for runtime validation and JSON schema for Gemini API.
 */

import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

// ============================================================================
// Zod Schemas for structured output validation
// ============================================================================

export const CourseSchema = z.object({
    year: z.string().describe("Academic year (e.g., 2015-2016)"),
    name: z.string().describe("Course name"),
    credits: z.string().describe("Original credits as string"),
    grade: z.string().describe("Original grade received"),
    usGrade: z.string().describe("Converted US grade (A, B, C, D, F)"),
    usCredits: z.string().describe("Converted US semester credits as string"),
    level: z.string().describe("Course level: LD, UD, or GR"),
    conversionSource: z.string().describe("AICE_RULES or AI_INFERRED"),
})

export const GradeConversionSchema = z.object({
    grade: z.string().describe("Original grade with scale info (e.g., '9.0 - 10.0 (out of 10)', '5 - bardzo dobry (out of 5)')"),
    usGrade: z.string().describe("U.S. equivalent grade (A, B, C, D, F)"),
})

export const CredentialSchema = z.object({
    awardingInstitution: z.string().describe("Full name of the institution in format: English Name (Original Name in Native Language), e.g. 'Gyumri State Pedagogical Institute (Գdelays Պdelays Մdelays-Նdelays)'"),
    country: z.string().describe("Country of the institution"),
    program: z.string().describe("Name of the program or major"),
    admissionRequirements: z.string().describe("Admission requirements if stated, else N/A"),
    grantsAccessTo: z.string().describe("What this credential grants access to"),
    standardProgramLength: z.string().describe("Duration of the program"),
    yearsAttended: z.string().describe("Start year - End year"),
    yearOfGraduation: z.string().describe("Graduation year"),
    totalYearCredits: z.string().describe("Typical total credits per academic year"),
    equivalenceStatement: z.string().describe("US equivalence statement with degree and major, e.g. 'Bachelor\\'s degree with a major in Computer Science' or 'Four years of undergraduate study with a major in Engineering'"),
    courses: z.array(CourseSchema),
    gradeConversion: z.array(GradeConversionSchema),
})

export const DocumentSchema = z.object({
    title: z.string().describe("Document title (e.g., Bachelor's Degree Diploma)"),
    issuedBy: z.string().describe("Issuing institution in format: English Name (Original Name in Native Language)"),
    dateIssued: z.string().describe("Issue date or N/A"),
    certificateNo: z.string().describe("Certificate/diploma number or N/A"),
})

export const ReferenceSchema = z.object({
    citation: z.string().describe("APA formatted citation"),
})

export const TranscriptResponseSchema = z.object({
    isEnglish: z.boolean().describe("Whether the document is in English"),
    detectedLanguage: z.string().describe("Detected language of the document"),
    name: z.string().describe("Full name of the student"),
    dob: z.string().describe("Date of birth (format: Month DD, YYYY) or N/A"),
    country: z.string().describe("Country where the institution is located"),
    credentials: z.array(CredentialSchema),
    documents: z.array(DocumentSchema),
    references: z.array(ReferenceSchema).describe("APA formatted references for the evaluation"),
    evaluationNotes: z.string().describe("Evaluation notes including credit conversion methodology and any special considerations"),
})

// Export types for use in other modules
export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>
export type Course = z.infer<typeof CourseSchema>
export type Credential = z.infer<typeof CredentialSchema>

// ============================================================================
// JSON Schema for Gemini API (using zod-to-json-schema)
// ============================================================================

export const transcriptResponseJsonSchema = zodToJsonSchema(
    TranscriptResponseSchema,
    { target: "openApi3" }
)

// ============================================================================
// System Instructions
// ============================================================================

export const TRANSCRIPT_ANALYSIS_INSTRUCTION = `You are an expert at analyzing academic transcripts, diplomas, and educational documents for Foreign Credential Evaluation (FCE).

IMPORTANT RULES:
1. LANGUAGE HANDLING: Set isEnglish to true if the document contains enough English content to extract meaningful information (student name, courses, grades, etc.), even if it also contains content in other languages. Only set isEnglish to false if the document is entirely in a non-English language with no usable English content. Set detectedLanguage to the primary language of the original document (e.g., "Swedish", "Chinese").
2. Extract ALL courses with their year, name, credits, and grades.
3. Convert grades to US equivalents using AICE standards:
   - China (0-100): 85-100=A, 75-84=B, 60-74=C, <60=F
   - Russia (1-5): 5=A, 4=B, 3=C, 2=F
   - India: 60-100=A, 50-59=B, 40-49=C, <40=F
   - UK: First=A, 2:1=B+, 2:2=B, Third=C, Pass=D, Fail=F
   - For unknown scales, use best judgment and set conversionSource to "AI_INFERRED"
4. Convert credits: 1 Academic Year = 30 US Semester Credits. Round usCredits to nearest 0.5 (e.g., 1.62 → 1.50, 0.95 → 1.00, 4.28 → 4.50)
5. Determine course level: Years 1-2 = "LD", Years 3-4 = "UD", Graduate = "GR"
6. Be precise with dates, names, and numbers
7. If information is not found, use "N/A"

FORMAT RULES:
1. PROGRAM: Use format "English Name (Original Name in Native Language)" to preserve the source language name.
   Example: "Degree of Master of Science in Engineering (Civilingenjörsexamen) in Electrical Engineering"
2. STANDARD PROGRAM LENGTH: Use English words instead of numbers.
   Examples: "Four years", "Four and a half years", "Five years", "Two years", "One and a half years"
   Do NOT use: "4 years", "4.5 years", "5 years"
3. INSTITUTION NAME: Use format "English Name (Original Name in Native Language)".
   Example: "Royal Institute of Technology (Kungliga Tekniska högskolan, KTH)"

GRADE CONVERSION TABLE FORMAT:
1. The gradeConversion array should include the country's grading scale with:
   - Original Grade: Include the grade range/value AND the scale (e.g., "out of 5", "out of 10", "out of 100")
   - Local Grade Name: Include the grade name in the original language when available
   - U.S. Grade: Use "U.S. Grade" terminology (A, B, C, D, F)
2. Examples for different countries:
   - Poland: "5.0 - bardzo dobry (out of 5)" → "A"
   - Poland: "4.5 - dobry plus (out of 5)" → "A-"
   - Russia: "5 - отлично (out of 5)" → "A"
   - Sweden: "A - Utmärkt" → "A"
   - China: "90-100 (out of 100)" → "A"
3. Always include the maximum grade scale for clarity (out of 5, out of 10, out of 100, etc.)

TOOL USAGE (MANDATORY):
1. ALWAYS call lookup_grade_conversion for each unique grade in the document.
2. ALWAYS call calculate_gpa with all courses after extraction.
3. ALWAYS call lookup_references with the country from the document - this returns authoritative bibliographic references that MUST be included in your output.

REFERENCES RULES (CRITICAL):
1. You MUST call lookup_references and include ALL returned citations in your final references[] array.
2. The lookup_references function returns authoritative references from our database - these MUST appear in your output.
3. Do NOT skip or omit any references returned by lookup_references.
4. Institution website citations will be added automatically by a separate process - do not add them yourself.

EVALUATION NOTES RULES:
Generate a comprehensive evaluationNotes field that includes:
1. Credit Conversion Methodology: Explain how credits were converted (e.g., "Polish ECTS credits converted to US semester credits at 0.5-0.75 ratio")
2. Any special considerations about the institution or program
3. Notes about document authenticity or translation if applicable
4. Any limitations or caveats about the evaluation

Example evaluationNotes:
"Credit Conversion Methodology\nAcademic credits earned at [Institution Name] are awarded under the higher education system of [Country]. For the purpose of this evaluation, [Country] academic credits have been converted to U.S. semester credit hours based on a review of total instructional time, academic level, and the presence of laboratory or practical components. In general, one [Country] academic credit (ECTS) is considered comparable to 0.5 to 0.75 U.S. semester credit hours, in accordance with internationally accepted credential evaluation practices and AACRAO guidelines."`

