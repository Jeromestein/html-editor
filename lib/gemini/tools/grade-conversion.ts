/**
 * Grade Conversion Tool
 * 
 * Allows Gemini to look up grade conversion rules from Supabase.
 * Supports batch lookup for multiple grades at once.
 */

import type { FunctionDeclaration } from "@google/genai"
import { Type } from "@google/genai"
import { lookupGradeRule } from "@/lib/grade-conversion"

// Function declaration for Gemini - batch version
export const gradeConversionDeclaration: FunctionDeclaration = {
    name: "lookup_grade_conversion_batch",
    description: "Look up grade conversion rules for multiple grades at once. Returns US grade equivalents for each unique grade in a country.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            country: {
                type: Type.STRING,
                description: "Country of education (e.g., 'China', 'Russia', 'India', 'UK')",
            },
            grades: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of unique original grades to convert (e.g., ['85', '92', 'Pass', '78'])",
            },
            educationLevel: {
                type: Type.STRING,
                description: "Education level: 'undergraduate' or 'graduate'",
            },
        },
        required: ["country", "grades"],
    },
}

// Single grade conversion result
export type SingleGradeResult = {
    originalGrade: string
    usGrade: string | null
    gpaPoints: number | null
    source: "AICE_RULES" | "NOT_FOUND"
}

// Batch result type
export type GradeConversionResult = {
    success: boolean
    country: string
    results: SingleGradeResult[]
    warning?: string
}

/**
 * Execute batch grade conversion lookup
 */
export async function executeGradeConversion(args: {
    country: string
    grades: string[]
    educationLevel?: string
}): Promise<GradeConversionResult> {
    const results: SingleGradeResult[] = []
    const notFoundGrades: string[] = []

    try {
        // Process each grade
        for (const grade of args.grades) {
            const rule = await lookupGradeRule(
                args.country,
                grade,
                args.educationLevel || "undergraduate"
            )

            if (rule) {
                results.push({
                    originalGrade: grade,
                    usGrade: rule.us_grade,
                    gpaPoints: rule.gpa_points,
                    source: "AICE_RULES",
                })
            } else {
                // No rule found - AI will need to infer
                results.push({
                    originalGrade: grade,
                    usGrade: null,
                    gpaPoints: null,
                    source: "NOT_FOUND",
                })
                notFoundGrades.push(grade)
            }
        }

        // Generate warning for grades not found
        const warning = notFoundGrades.length > 0
            ? `No conversion rules found for ${args.country} grades: ${notFoundGrades.join(", ")}. AI will infer.`
            : undefined

        return {
            success: results.some(r => r.source === "AICE_RULES"),
            country: args.country,
            results,
            warning,
        }
    } catch (error) {
        console.warn(`Grade conversion batch lookup failed for ${args.country}:`, error)

        // Return empty results for all grades on error
        return {
            success: false,
            country: args.country,
            results: args.grades.map(grade => ({
                originalGrade: grade,
                usGrade: null,
                gpaPoints: null,
                source: "NOT_FOUND" as const,
            })),
            warning: `Grade conversion lookup failed for ${args.country}. AI will infer all grades.`,
        }
    }
}
