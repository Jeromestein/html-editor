/**
 * Signatures Section Generator
 * 
 * Creates signature area with images
 */

import * as fs from 'fs'
import * as path from 'path'
import {
    Paragraph,
    TextRun,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    VerticalAlign,
    AlignmentType,
} from 'docx'
import { SampleData } from '../../report-data'
import { TEXT_STYLES, SPACING, PAGE_WIDTH_DXA, COLORS } from '../styles'

export function createSignatures(data: SampleData): (Paragraph | Table)[] {
    const children: (Paragraph | Table)[] = []

    const halfWidth = PAGE_WIDTH_DXA / 2 - 200

    // Load signature images
    const evaluatorSig = loadSignatureImage(data.evaluatorSignature)
    const seniorEvaluatorSig = loadSignatureImage(data.seniorEvaluatorSignature)

    // Signature table (2 columns)
    const signatureTable = new Table({
        columnWidths: [halfWidth, halfWidth],
        rows: [
            // Signature images row
            new TableRow({
                children: [
                    createSignatureCell(evaluatorSig, halfWidth),
                    createSignatureCell(seniorEvaluatorSig, halfWidth),
                ],
            }),
            // Names row
            new TableRow({
                children: [
                    createNameCell(data.evaluatorName, halfWidth),
                    createNameCell(data.seniorEvaluatorName, halfWidth),
                ],
            }),
            // Titles row
            new TableRow({
                children: [
                    createTitleCell('Evaluator', halfWidth),
                    createTitleCell('Senior Evaluator', halfWidth),
                ],
            }),
        ],
    })

    children.push(new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }))
    children.push(signatureTable)

    return children
}

function loadSignatureImage(imagePath: string): Buffer | undefined {
    if (!imagePath) return undefined

    // Handle both absolute and relative paths
    const fullPath = imagePath.startsWith('/')
        ? path.join(process.cwd(), 'public', imagePath)
        : path.join(process.cwd(), 'public', imagePath)

    try {
        return fs.readFileSync(fullPath)
    } catch (e) {
        console.warn('Warning: Signature image not found at', fullPath)
        return undefined
    }
}

function createSignatureCell(imageBuffer: Buffer | undefined, width: number): TableCell {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: VerticalAlign.BOTTOM,
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40 },
                children: imageBuffer
                    ? [
                        new ImageRun({
                            type: 'png',
                            data: imageBuffer,
                            transformation: { width: 120, height: 45 },
                            altText: {
                                title: 'Signature',
                                description: 'Evaluator signature',
                                name: 'Signature',
                            },
                        }),
                    ]
                    : [new TextRun({ text: '________________', ...TEXT_STYLES.body })],
            }),
        ],
    })
}

function createNameCell(name: string, width: number): TableCell {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: SPACING.tight,
                children: [
                    new TextRun({
                        text: name,
                        ...TEXT_STYLES.bodyBold,
                        color: COLORS.blue900,
                    }),
                ],
            }),
        ],
    })
}

function createTitleCell(title: string, width: number): TableCell {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: SPACING.tight,
                children: [new TextRun({ text: title, ...TEXT_STYLES.smallGray })],
            }),
        ],
    })
}
