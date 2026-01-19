/**
 * Gemini Module
 * 
 * Re-exports all Gemini-related functionality.
 */

// Client
export { getGeminiClient, analyzePdfWithGemini, searchInstitutionWebsites, type AnalyzePdfResult } from "./client"

// Schemas
export {
    TranscriptResponseSchema,
    CourseSchema,
    CredentialSchema,
    DocumentSchema,
    GradeConversionSchema,
    transcriptResponseSchema,
    TRANSCRIPT_ANALYSIS_INSTRUCTION,
    type TranscriptResponse,
    type Course,
    type Credential,
} from "./schemas"

// Tools
export { toolDeclarations, executeTool } from "./tools"
export type {
    GradeConversionResult,
    GpaCalculatorResult,
    ReferenceLookupResult,
} from "./tools"
