import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const HISTORY_TABLE_NAME = 'report_history'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get('reportId')
    const versionId = searchParams.get('versionId')

    try {
        if (versionId) {
            const { data, error } = await supabase
                .from(HISTORY_TABLE_NAME)
                .select('content')
                .eq('id', versionId)
                .maybeSingle()

            if (error) throw error
            if (!data) return NextResponse.json(null, { status: 404 })

            return NextResponse.json(data.content)
        }

        if (reportId) {
            const { data, error } = await supabase
                .from(HISTORY_TABLE_NAME)
                .select('id, created_at, created_by')
                .eq('report_id', reportId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return NextResponse.json(data)
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
