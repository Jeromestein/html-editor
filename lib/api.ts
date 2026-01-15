import { supabase } from './supabase'
import { SampleData } from './report-data'

export type ReportMetadata = {
    id: string
    created_at: string
    name: string
}

export const TABLE_NAME = 'aet_fce_aice_report'

export async function saveReport(data: SampleData, name: string) {
    // We'll treat 'name' as a unique identifier for simplicity in this user flow, 
    // or just always insert a new one if user wants. 
    // For now, let's just insert a new row every time "Save" is clicked 
    // or we could try to update if we had an ID.
    // Given the request, "Save" implies persistence.

    // To allow updating, we would need to track the current report ID in the editor state.
    // For this first pass, let's just insert.

    const { data: result, error } = await supabase
        .from(TABLE_NAME)
        .insert({
            name: name,
            content: data as any, // jsonb
        })
        .select()

    if (error) {
        throw error
    }

    return result?.[0]
}

export async function updateReport(id: string, data: SampleData, name: string) {
    const { data: result, error } = await supabase
        .from(TABLE_NAME)
        .update({
            name: name,
            content: data as any
        })
        .eq('id', id)
        .select()

    if (error) {
        throw error
    }


    if (!result || result.length === 0) {
        throw new Error("Update failed: No rows affected. Check RLS or ID.")
    }

    return result[0]
}

export async function fetchReports(): Promise<ReportMetadata[]> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, created_at, name')
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data || []
}

export async function fetchReportContent(id: string): Promise<SampleData | null> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('content')
        .eq('id', id)
        .single()

    if (error) {
        throw error
    }

    return data?.content || null
}
