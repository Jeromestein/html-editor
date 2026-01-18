/**
 * Gemini API Schemas
 * 
 * Contains Zod schemas for runtime validation and ResponseSchema for Gemini API.
 */

import { SchemaType, type ResponseSchema } from "@google/generative-ai"
import { z } from "zod"

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
    grade: z.string().describe("Original grade (e.g., 85-100, 5, A)"),
    usGrade: z.string().describe("US equivalent (A, B, C, D, F)"),
})

export const CredentialSchema = z.object({
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

export const DocumentSchema = z.object({
    title: z.string().describe("Document title (e.g., Bachelor's Degree Diploma)"),
    issuedBy: z.string().describe("Issuing institution"),
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
})

// Export types for use in other modules
export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>
export type Course = z.infer<typeof CourseSchema>
export type Credential = z.infer<typeof CredentialSchema>

// ============================================================================
// ResponseSchema for Gemini API
// ============================================================================

export const transcriptResponseSchema: ResponseSchema = {
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
        references: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    citation: { type: SchemaType.STRING, description: "APA formatted citation" },
                },
                required: ["citation"],
            },
        },
    },
    required: ["isEnglish", "detectedLanguage", "name", "dob", "country", "credentials", "documents", "references"],
}

// ============================================================================
// System Instructions
// ============================================================================

export const TRANSCRIPT_ANALYSIS_INSTRUCTION = `You are an expert at analyzing academic transcripts, diplomas, and educational documents for Foreign Credential Evaluation (FCE).

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
7. If information is not found, use "N/A"

When you need to look up grade conversion rules, use the lookup_grade_conversion function.
When you need to calculate GPA, use the calculate_gpa function.
When you need to find references, use the lookup_references function.`
