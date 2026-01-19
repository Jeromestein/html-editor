/**
 * Gemini Module
 * 
 * Re-exports all Gemini-related functionality.
 * Multi-stage architecture:
 *   - Stage 1: Pure PDF parsing (ParsedPdfResponseSchema)
 *   - Stage 2: Data processing (TranscriptResponseSchema)
 *   - Stage 3: Website search
 */

// Client
export {
    getGeminiClient,
    analyzePdfWithGemini,
    searchInstitutionWebsites,
    type AnalyzePdfResult,
    type ProgressPhase,
    type ProgressCallback,
} from "./client"

// Schemas - Stage 1 (Raw PDF Parsing)
export {
    RawCourseSchema,
    RawCredentialSchema,
    ParsedPdfResponseSchema,
    parsedPdfResponseJsonSchema,
    STAGE1_PDF_PARSING_INSTRUCTION,
    type ParsedPdfResponse,
    type RawCourse,
    type RawCredential,
} from "./schemas"

// Schemas - Stage 2 (Final Output)
export {
    TranscriptResponseSchema,
    CourseSchema,
    CredentialSchema,
    DocumentSchema,
    GradeConversionSchema,
    transcriptResponseJsonSchema,
    STAGE2_DATA_PROCESSING_INSTRUCTION,
    TRANSCRIPT_ANALYSIS_INSTRUCTION,
    type TranscriptResponse,
    type Course,
    type Credential,
} from "./schemas"

// Tools
export { toolDeclarations, executeTool } from "./tools"
export type {
    GradeConversionResult,
    ReferenceLookupResult,
} from "./tools"


