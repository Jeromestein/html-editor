/**
 * Simple DOCX Test Script
 * 
 * Creates a minimal DOCX to test Word compatibility
 */

import * as fs from 'fs'
import * as path from 'path'
import { Document, Packer, Paragraph, TextRun, PageOrientation } from 'docx'

async function main() {
    console.log('🧪 Creating minimal test DOCX...')

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                        size: {
                            orientation: PageOrientation.PORTRAIT,
                            width: 12240,
                            height: 15840,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: 'Hello World - Test Document', bold: true, size: 28 })],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'This is a simple test to verify Word compatibility.' })],
                    }),
                ],
            },
        ],
    })

    const buffer = await Packer.toBuffer(doc)

    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, 'test-simple.docx')
    fs.writeFileSync(outputPath, buffer)

    console.log(`✅ Test file saved to: ${outputPath}`)
    console.log(`   File size: ${(buffer.length / 1024).toFixed(2)} KB`)
}

main().catch(console.error)
