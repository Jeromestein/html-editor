/**
 * Grade Conversion Tool
 * 
 * Allows Gemini to look up grade conversion rules from Supabase.
 */

import type { FunctionDeclaration } from "@google/generative-ai"
import { SchemaType } from "@google/generative-ai"
import { lookupGradeRule } from "@/lib/grade-conversion"

// Function declaration for Gemini
export const gradeConversionDeclaration: FunctionDeclaration = {
    name: "lookup_grade_conversion",
    description: "Look up grade conversion rules from the database. Returns US grade equivalent for a given country and grade.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            country: {
                type: SchemaType.STRING,
                description: "Country of education (e.g., 'China', 'Russia', 'India', 'UK')",
            },
            grade: {
                type: SchemaType.STRING,
                description: "Original grade to convert (e.g., '85', 'A', 'First Class')",
            },
            educationLevel: {
                type: SchemaType.STRING,
                description: "Education level: 'undergraduate' or 'graduate'",
            },
        },
        required: ["country", "grade"],
    },
}

// Tool execution result type
export type GradeConversionResult = {
    success: boolean
    usGrade: string | null
    gpaPoints: number | null
    source: "AICE_RULES" | "NOT_FOUND"
    warning?: string
}

/**
 * Execute grade conversion lookup
 */
export async function executeGradeConversion(args: {
    country: string
    grade: string
    educationLevel?: string
}): Promise<GradeConversionResult> {
    try {
        const rule = await lookupGradeRule(
            args.country,
            args.grade,
            args.educationLevel || "undergraduate"
        )

        if (rule) {
            return {
                success: true,
                usGrade: rule.us_grade,
                gpaPoints: rule.gpa_points,
                source: "AICE_RULES",
            }
        }

        // No rule found - return empty result for AI inference
        return {
            success: false,
            usGrade: null,
            gpaPoints: null,
            source: "NOT_FOUND",
            warning: `No grade conversion rule found for ${args.country} grade "${args.grade}". AI will infer.`,
        }
    } catch (error) {
        // Silent fail with warning
        console.warn(`Grade conversion lookup failed for ${args.country}/${args.grade}:`, error)
        return {
            success: false,
            usGrade: null,
            gpaPoints: null,
            source: "NOT_FOUND",
            warning: `Grade conversion lookup failed for ${args.country}. AI will infer.`,
        }
    }
}
