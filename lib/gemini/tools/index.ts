/**
 * Gemini Tools
 * 
 * Exports all function tool declarations and a unified dispatcher.
 */

import type { FunctionDeclaration } from "@google/generative-ai"

// Import tool declarations and executors
import {
    gradeConversionDeclaration,
    executeGradeConversion,
    type GradeConversionResult,
} from "./grade-conversion"

import {
    gpaCalculatorDeclaration,
    executeGpaCalculator,
    type GpaCalculatorResult,
} from "./gpa-calculator"

import {
    referenceLookupDeclaration,
    executeReferenceLookup,
    type ReferenceLookupResult,
} from "./reference-lookup"

// Export all declarations as an array for Gemini
export const toolDeclarations: FunctionDeclaration[] = [
    gradeConversionDeclaration,
    gpaCalculatorDeclaration,
    referenceLookupDeclaration,
]

// Result type union
export type ToolResult = GradeConversionResult | GpaCalculatorResult | ReferenceLookupResult

/**
 * Execute a tool by name with given arguments
 * 
 * @param name - Tool function name
 * @param args - Arguments for the tool
 * @returns Tool result with success status and optional warning
 */
export async function executeTool(
    name: string,
    args: Record<string, unknown>
): Promise<{ result: ToolResult; warning?: string }> {
    console.log(`=== FUNCTION CALL: ${name} ===`)
    console.log("Args:", JSON.stringify(args, null, 2))

    let result: ToolResult

    switch (name) {
        case "lookup_grade_conversion":
            result = await executeGradeConversion(args as Parameters<typeof executeGradeConversion>[0])
            break

        case "calculate_gpa":
            result = await executeGpaCalculator(args as Parameters<typeof executeGpaCalculator>[0])
            break

        case "lookup_references":
            result = await executeReferenceLookup(args as Parameters<typeof executeReferenceLookup>[0])
            break

        default:
            console.warn(`Unknown tool: ${name}`)
            result = {
                success: false,
                warning: `Unknown tool: ${name}`,
            } as ToolResult
    }

    console.log("Result:", JSON.stringify(result, null, 2))
    console.log("================================")

    return {
        result,
        warning: "warning" in result ? result.warning : undefined,
    }
}

// Re-export types
export type { GradeConversionResult, GpaCalculatorResult, ReferenceLookupResult }
