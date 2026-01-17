/**
 * DOCX Debug Script
 * 
 * Step by step add sections to find the problem
 */

import * as fs from 'fs'
import * as path from 'path'
import { Document, Packer, Paragraph, TextRun, PageOrientation } from 'docx'
import { buildSampleData } from '../lib/report-data'
import { PAGE_MARGINS } from '../lib/docx/styles'
import { BULLET_LIST_CONFIG } from '../lib/docx/utils'

// Import sections one by one
import { createHeader } from '../lib/docx/sections/header'
import { createApplicantInfo } from '../lib/docx/sections/applicant-info'
import { createEquivalenceSummary } from '../lib/docx/sections/equivalence-summary'
import { createDocumentsList } from '../lib/docx/sections/documents-list'
import { createCredentialDetails } from '../lib/docx/sections/credential-details'
import { createCourseTable } from '../lib/docx/sections/course-table'
import { createGradeConversion } from '../lib/docx/sections/grade-conversion'
import { createNotes } from '../lib/docx/sections/notes'
import { createReferences } from '../lib/docx/sections/references'
import { createSignatures } from '../lib/docx/sections/signatures'

async function testSection(
    name: string,
    children: any[],
    outputName: string
) {
    console.log(`🧪 Testing: ${name}...`)

    const doc = new Document({
        numbering: BULLET_LIST_CONFIG,
        sections: [
            {
                properties: {
                    page: {
                        margin: PAGE_MARGINS,
                        size: {
                            orientation: PageOrientation.PORTRAIT,
                            width: 12240,
                            height: 15840,
                        },
                    },
                },
                children,
            },
        ],
    })

    const buffer = await Packer.toBuffer(doc)
    const outputPath = path.join(process.cwd(), 'output', outputName)
    fs.writeFileSync(outputPath, buffer)
    console.log(`   ✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(2)} KB)`)
}

async function main() {
    const data = buildSampleData()
    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    // Test each section individually
    try {
        await testSection('Header', [...createHeader()], 'test-1-header.docx')
    } catch (e) {
        console.log('   ❌ Header failed:', e)
    }

    try {
        await testSection('Applicant Info', [...createApplicantInfo(data)], 'test-2-applicant.docx')
    } catch (e) {
        console.log('   ❌ Applicant Info failed:', e)
    }

    try {
        await testSection('Equivalence Summary', [...createEquivalenceSummary(data)], 'test-3-equivalence.docx')
    } catch (e) {
        console.log('   ❌ Equivalence Summary failed:', e)
    }

    try {
        await testSection('Documents List', [...createDocumentsList(data)], 'test-4-documents.docx')
    } catch (e) {
        console.log('   ❌ Documents List failed:', e)
    }

    try {
        await testSection(
            'Credential Details',
            [...createCredentialDetails(data.credentials[0], 0)],
            'test-5-credential.docx'
        )
    } catch (e) {
        console.log('   ❌ Credential Details failed:', e)
    }

    try {
        await testSection(
            'Course Table',
            [...createCourseTable(data.credentials[0])],
            'test-6-courses.docx'
        )
    } catch (e) {
        console.log('   ❌ Course Table failed:', e)
    }

    try {
        await testSection(
            'Grade Conversion',
            [...createGradeConversion(data.credentials[0].gradeConversion)],
            'test-7-grades.docx'
        )
    } catch (e) {
        console.log('   ❌ Grade Conversion failed:', e)
    }

    try {
        await testSection('Notes', [...createNotes(data.evaluationNotes)], 'test-8-notes.docx')
    } catch (e) {
        console.log('   ❌ Notes failed:', e)
    }

    try {
        await testSection('References', [...createReferences(data.references)], 'test-9-references.docx')
    } catch (e) {
        console.log('   ❌ References failed:', e)
    }

    try {
        await testSection('Signatures', [...createSignatures(data)], 'test-10-signatures.docx')
    } catch (e) {
        console.log('   ❌ Signatures failed:', e)
    }

    console.log('\n✨ All tests complete. Please check each file in Word.')
}

main().catch(console.error)
