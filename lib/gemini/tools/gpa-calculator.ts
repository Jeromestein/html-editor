/**
 * GPA Calculator Tool
 * 
 * Allows Gemini to calculate GPA and total credits for a set of courses.
 */

import type { FunctionDeclaration } from "@google/genai"
import { Type } from "@google/genai"
import { calculateStats } from "@/lib/gpa"
import type { Course } from "@/lib/report-data"

// Function declaration for Gemini
export const gpaCalculatorDeclaration: FunctionDeclaration = {
    name: "calculate_gpa",
    description: "Calculate GPA and total credits for a list of courses. Uses AICE 4.35-point scale.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            courses: {
                type: Type.ARRAY,
                description: "Array of courses with usGrade and usCredits",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        usGrade: {
                            type: Type.STRING,
                            description: "US grade (A, B, C, D, F, P, etc.)",
                        },
                        usCredits: {
                            type: Type.STRING,
                            description: "US semester credits as string",
                        },
                    },
                    required: ["usGrade", "usCredits"],
                },
            },
        },
        required: ["courses"],
    },
}

// Tool execution result type
export type GpaCalculatorResult = {
    success: boolean
    totalCredits: string
    gpa: string
    warning?: string
}

/**
 * Execute GPA calculation
 */
export async function executeGpaCalculator(args: {
    courses: Array<{ usGrade: string; usCredits: string }>
}): Promise<GpaCalculatorResult> {
    try {
        // Convert to Course format expected by calculateStats
        const courses: Course[] = args.courses.map((c, index) => ({
            id: index + 1,
            year: "",
            name: "",
            credits: c.usCredits,
            grade: c.usGrade,
            usGrade: c.usGrade,
            usCredits: c.usCredits,
            level: "UD",
            conversionSource: "AICE_RULES",
        }))

        const result = calculateStats(courses)

        return {
            success: true,
            totalCredits: result.totalCredits,
            gpa: result.gpa,
        }
    } catch (error) {
        // Silent fail with warning
        console.warn("GPA calculation failed:", error)
        return {
            success: false,
            totalCredits: "0.00",
            gpa: "N/A",
            warning: "GPA calculation failed. Please verify manually.",
        }
    }
}
