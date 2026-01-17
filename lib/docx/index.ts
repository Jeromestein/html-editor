/**
 * DOCX Generator - Main Entry Point
 * 
 * Exports the main generateDocx function that creates a Word document
 * from report data.
 */

import { Document, Packer, Paragraph, Table, PageOrientation } from 'docx'
import { SampleData } from '../report-data'
import { PAGE_MARGINS } from './styles'
import { BULLET_LIST_CONFIG } from './utils'

// Import section generators
import { createHeader } from './sections/header'
import { createApplicantInfo } from './sections/applicant-info'
import { createEquivalenceSummary } from './sections/equivalence-summary'
import { createDocumentsList } from './sections/documents-list'
import { createCredentialDetails } from './sections/credential-details'
import { createCourseTable } from './sections/course-table'
import { createGradeConversion } from './sections/grade-conversion'
import { createNotes } from './sections/notes'
import { createReferences } from './sections/references'
import { createSignatures } from './sections/signatures'

export type GenerateDocxOptions = {
    includeNotes?: boolean
    includeReferences?: boolean
}

/**
 * Generate a DOCX document from report data
 */
export async function generateDocx(
    data: SampleData,
    options: GenerateDocxOptions = {}
): Promise<Buffer> {
    const { includeNotes = true, includeReferences = true } = options

    // Collect all document children
    const children: (Paragraph | Table)[] = []

    // 1. Header
    children.push(...createHeader())

    // 2. Applicant Info
    children.push(...createApplicantInfo(data))

    // 3. Equivalence Summary
    children.push(...createEquivalenceSummary(data))

    // 4. Documents List
    children.push(...createDocumentsList(data))

    // 5. For each credential: Details + Courses + Grade Conversion
    data.credentials.forEach((credential, idx) => {
        children.push(...createCredentialDetails(credential, idx))
        children.push(...createCourseTable(credential))
        children.push(...createGradeConversion(credential.gradeConversion))
    })

    // 6. Notes (optional)
    if (includeNotes && data.evaluationNotes) {
        children.push(...createNotes(data.evaluationNotes))
    }

    // 7. References (optional)
    if (includeReferences && data.references) {
        children.push(...createReferences(data.references))
    }

    // 8. Signatures
    children.push(...createSignatures(data))

    // Create document
    const doc = new Document({
        numbering: BULLET_LIST_CONFIG,
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Arial',
                        size: 22, // 11pt default
                    },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: PAGE_MARGINS,
                        size: {
                            orientation: PageOrientation.PORTRAIT,
                            width: 12240, // Letter width in DXA (8.5")
                            height: 15840, // Letter height in DXA (11")
                        },
                    },
                },
                children,
            },
        ],
    })

    // Generate buffer
    return Packer.toBuffer(doc)
}

// Re-export types
export type { SampleData } from '../report-data'
