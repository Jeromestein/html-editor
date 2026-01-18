/**
 * DOCX Report Generator Script
 * 
 * Usage: npx tsx scripts/generate-report.ts
 * 
 * This script generates a DOCX report from the sample data
 * and saves it to the output directory.
 */

import * as fs from 'fs'
import * as path from 'path'
import { buildSampleData } from '../lib/report-data'
import { generateDocx } from '../lib/docx'

async function main() {
    console.log('🚀 Starting DOCX report generation...')

    // Get sample data
    const data = buildSampleData()
    console.log(`📄 Loaded data for: ${data.name}`)
    console.log(`   Credentials: ${data.credentials.length}`)
    console.log(`   Documents: ${data.documents.length}`)

    // Generate DOCX
    console.log('⏳ Generating DOCX...')
    const buffer = await generateDocx(data)

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    // Save to file
    const outputPath = path.join(outputDir, 'report.docx')
    fs.writeFileSync(outputPath, buffer)

    console.log(`✅ Report saved to: ${outputPath}`)
    console.log(`   File size: ${(buffer.length / 1024).toFixed(2)} KB`)
}

main().catch((error) => {
    console.error('❌ Error generating report:', error)
    process.exit(1)
})
