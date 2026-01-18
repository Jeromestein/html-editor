/**
 * DOCX Generation API Route
 * 
 * POST /api/generate-docx
 * Body: SampleData JSON
 * Returns: DOCX file as blob
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docx'
import { SampleData } from '@/lib/report-data'

/**
 * Determine highest degree from credentials
 * Returns: Phd, M, or B
 */
function getHighestDegree(data: SampleData): string {
    const degreePatterns = {
        phd: /\b(ph\.?d|doctor|doctoral)\b/i,
        master: /\b(master|m\.?s\.?|m\.?a\.?|m\.?b\.?a|m\.?ed)\b/i,
        bachelor: /\b(bachelor|b\.?s\.?|b\.?a\.?|b\.?eng|undergraduate)\b/i,
    }

    for (const cred of data.credentials) {
        const text = `${cred.program} ${cred.equivalenceStatement}`.toLowerCase()
        if (degreePatterns.phd.test(text)) return 'Phd'
        if (degreePatterns.master.test(text)) return 'M'
    }
    return 'B' // Default to Bachelor
}

/**
 * Generate filename: Evaluation-{Name}-{Degree}-{Country}.docx
 */
function generateFilename(data: SampleData): string {
    const name = data.name.replace(/\s+/g, '-')
    const degree = getHighestDegree(data)
    const country = data.country.replace(/\s+/g, '-')
    return `Evaluation-${name}-${degree}-${country}.docx`
}

export async function POST(request: NextRequest) {
    try {
        const data: SampleData = await request.json()

        // Generate DOCX buffer
        const buffer = await generateDocx(data)
        const filename = generateFilename(data)

        // Return as file download
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('Error generating DOCX:', error)
        return NextResponse.json(
            { error: 'Failed to generate DOCX' },
            { status: 500 }
        )
    }
}
