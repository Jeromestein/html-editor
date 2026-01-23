/**
 * Report Storage Tools
 *
 * Allows Gemini to read and patch report data stored in Supabase.
 */

import type { FunctionDeclaration } from "@google/genai"
import { Type } from "@google/genai"
import { supabase } from "@/lib/supabase"
import { TABLE_NAME } from "@/lib/report-store"
import type { SampleData } from "@/lib/report-data"

const REPORT_HISTORY_TABLE = "report_history"

type ReportRecord = {
    id: string
    name: string
    content: SampleData
    updated_at: string
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Deep merge helper for patch updates.
 * - Objects: recursive merge
 * - Arrays/primitives: replaced by patch
 */
export function deepMerge<T>(target: T, patch: Partial<T>): T {
    if (!isPlainObject(patch)) {
        return patch as T
    }

    if (!isPlainObject(target)) {
        return { ...(patch as Record<string, unknown>) } as T
    }

    const result: Record<string, unknown> = { ...target }

    for (const [key, value] of Object.entries(patch)) {
        if (isPlainObject(value) && isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], value)
        } else {
            result[key] = value
        }
    }

    return result as T
}

export const reportStorageDeclarations: FunctionDeclaration[] = [
    {
        name: "lookup_report",
        description: "Fetch a report by ID from Supabase. Returns report metadata and content.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                reportId: {
                    type: Type.STRING,
                    description: "Report ID in the aet_fce_aice_report table.",
                },
            },
            required: ["reportId"],
        },
    },
    {
        name: "update_report",
        description: "Patch-update a report by ID using a partial JSON object. Arrays are replaced; objects are merged.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                reportId: {
                    type: Type.STRING,
                    description: "Report ID in the aet_fce_aice_report table.",
                },
                patch: {
                    type: Type.OBJECT,
                    description: "Partial report data to merge into the stored JSON content.",
                    additionalProperties: true,
                },
            },
            required: ["reportId", "patch"],
        },
    },
]

export type ReportLookupResult = {
    success: boolean
    report?: ReportRecord
    warning?: string
}

export type ReportUpdateResult = {
    success: boolean
    report?: Pick<ReportRecord, "id" | "name" | "updated_at">
    warning?: string
}

export async function executeReportLookup(args: {
    reportId: string
}): Promise<ReportLookupResult> {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("id, name, content, updated_at")
            .eq("id", args.reportId)
            .single()

        if (error) {
            return {
                success: false,
                warning: error.message,
            }
        }

        if (!data) {
            return {
                success: false,
                warning: "Report not found.",
            }
        }

        return {
            success: true,
            report: data as ReportRecord,
        }
    } catch (error) {
        console.warn("Report lookup failed:", error)
        return {
            success: false,
            warning: "Report lookup failed.",
        }
    }
}

export async function executeReportUpdate(args: {
    reportId: string
    patch: Partial<SampleData>
}): Promise<ReportUpdateResult> {
    try {
        const { data: existing, error: fetchError } = await supabase
            .from(TABLE_NAME)
            .select("id, name, content")
            .eq("id", args.reportId)
            .single()

        if (fetchError || !existing) {
            return {
                success: false,
                warning: fetchError?.message || "Report not found.",
            }
        }

        const mergedContent = deepMerge(existing.content as SampleData, args.patch)

        const { data: updated, error: updateError } = await supabase
            .from(TABLE_NAME)
            .update({
                content: mergedContent,
            })
            .eq("id", args.reportId)
            .select("id, name, updated_at")
            .single()

        if (updateError || !updated) {
            return {
                success: false,
                warning: updateError?.message || "Failed to update report.",
            }
        }

        const historyResult = await supabase
            .from(REPORT_HISTORY_TABLE)
            .insert({
                report_id: updated.id,
                content: mergedContent,
                created_by: "ai",
            })

        if (historyResult.error) {
            return {
                success: false,
                warning: historyResult.error.message,
            }
        }

        return {
            success: true,
            report: updated,
        }
    } catch (error) {
        console.warn("Report update failed:", error)
        return {
            success: false,
            warning: "Report update failed.",
        }
    }
}
