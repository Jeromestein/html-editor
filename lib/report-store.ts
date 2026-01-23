
import { SampleData } from './report-data'

export type ReportMetadata = {
    id: string
    created_at: string
    updated_at: string
    name: string
}

export type ReportHistoryItem = {
    id: string
    created_at: string
    created_by: string
}

export const TABLE_NAME = 'aet_fce_aice_report'

const API_URL = '/api/save-load-report'
const HISTORY_API_URL = '/api/report-history'

const stripImageData = (value: string) => (value?.startsWith('data:') ? '' : value)

const sanitizeReportContent = (data: SampleData): SampleData => ({
    ...data,
    evaluatorSignature: stripImageData(data.evaluatorSignature),
    seniorEvaluatorSignature: stripImageData(data.seniorEvaluatorSignature),
})

export async function saveReport(data: SampleData, name: string, createdBy: string = 'user') {
    const sanitizedContent = sanitizeReportContent(data)
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content: sanitizedContent, created_by: createdBy }),
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save report')
    }

    return response.json()
}

export async function updateReport(id: string, data: SampleData, name: string, createdBy: string = 'user') {
    const sanitizedContent = sanitizeReportContent(data)
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, content: sanitizedContent, created_by: createdBy }), // Sending ID triggers update logic
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to update report')
    }

    return response.json()
}

export async function fetchReports(): Promise<ReportMetadata[]> {
    const response = await fetch(`${API_URL}?list=true`)

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch reports')
    }

    return response.json()
}

export async function fetchReportContent(id: string): Promise<SampleData | null> {
    const response = await fetch(`${API_URL}?id=${id}`)

    if (!response.ok) {
        if (response.status === 404) return null
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch report content')
    }

    return response.json()
}

export async function fetchReportByName(name: string): Promise<{ id: string, content: SampleData, name: string, updated_at: string } | null> {
    const encodedName = encodeURIComponent(name)
    const response = await fetch(`${API_URL}?name=${encodedName}`)

    if (!response.ok) {
        if (response.status === 404) return null
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch report by name')
    }

    return response.json()
}

export async function checkReportExists(name: string): Promise<boolean> {
    const encodedName = encodeURIComponent(name)
    const response = await fetch(`${API_URL}?check=${encodedName}`)

    if (!response.ok) {
        return false
    }

    const data = await response.json()
    return !!data.exists
}

export async function fetchReportHistory(reportId: string): Promise<ReportHistoryItem[]> {
    const encodedId = encodeURIComponent(reportId)
    const response = await fetch(`${HISTORY_API_URL}?reportId=${encodedId}`)

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch report history')
    }

    return response.json()
}

export async function fetchReportVersion(versionId: string): Promise<SampleData | null> {
    const encodedId = encodeURIComponent(versionId)
    const response = await fetch(`${HISTORY_API_URL}?versionId=${encodedId}`)

    if (!response.ok) {
        if (response.status === 404) return null
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch report version')
    }

    return response.json()
}
