
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TABLE_NAME } from '@/lib/report-store' // We will keep the constant in shared file or move it here. Ideally move it.
// Actually, let's redefine table name here or import from a shared config if exists. 
// For now, hardcoding or duplicating is safer to avoid circular deps if report-store imports this.
const DB_TABLE_NAME = 'aet_fce_aice_report'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')
    const list = searchParams.get('list')
    const check = searchParams.get('check')

    try {
        if (list) {
            const { data, error } = await supabase
                .from(DB_TABLE_NAME)
                .select('id, created_at, updated_at, name')
                .order('updated_at', { ascending: false })

            if (error) throw error
            return NextResponse.json(data)
        }

        if (check) {
            const { data, error } = await supabase
                .from(DB_TABLE_NAME)
                .select('id')
                .eq('name', check)
                .maybeSingle()

            if (error) throw error
            return NextResponse.json({ exists: !!data })
        }

        if (id) {
            const { data, error } = await supabase
                .from(DB_TABLE_NAME)
                .select('content')
                .eq('id', id)
                .single()

            if (error) throw error
            return NextResponse.json(data?.content || null)
        }

        if (name) {
            const { data, error } = await supabase
                .from(DB_TABLE_NAME)
                .select('id, content, name, updated_at')
                // Use maybeSingle because name might not be unique in DB constraints yet, 
                // but we treat it as unique for this feature.
                // Prefer the most recently updated if duplicates exist.
                .eq('name', name)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) throw error
            if (!data) return NextResponse.json(null, { status: 404 })

            // Return full wrapper structure if needed, or just content + metadata
            return NextResponse.json({
                id: data.id,
                name: data.name,
                content: data.content,
                updated_at: data.updated_at
            })
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, content, id } = body

        if (!name || !content) {
            return NextResponse.json({ error: 'Name and Content are required' }, { status: 400 })
        }

        let resultData
        let error

        if (id) {
            // Update existing
            const result = await supabase
                .from(DB_TABLE_NAME)
                .update({
                    name: name,
                    content: content
                })
                .eq('id', id)
                .select()

            resultData = result.data
            error = result.error
        } else {
            // Create new
            const result = await supabase
                .from(DB_TABLE_NAME)
                .insert({
                    name: name,
                    content: content
                })
                .select()

            resultData = result.data
            error = result.error
        }

        if (error) throw error
        if (!resultData || resultData.length === 0) {
            throw new Error('Operation failed: No rows returned')
        }

        return NextResponse.json(resultData[0])

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
