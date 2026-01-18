// Data conversion utilities for PDF analysis results
import type { SampleData, Credential, CredentialDocument, Course, GradeConversionRow } from "./report-data"

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
                            level: String(course.level || "LD"),
                            credits: String(course.credits || "0"),
                            grade: String(course.grade || ""),
                            usGrade: course.conversionSource === "AI_INFERRED"
                                ? `${String(course.usGrade || "")} (AI_INFERRED)`
                                : String(course.usGrade || ""),
                            usCredits: String(course.usCredits || ""),
                            conversionSource: String(course.conversionSource || "AI_INFERRED"),
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
