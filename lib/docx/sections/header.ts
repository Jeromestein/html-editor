/**
 * Header Section Generator
 * 
 * Creates: AET Logo + Company Name + Website
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
    AlignmentType,
    VerticalAlign,
    BorderStyle,
} from 'docx'
import { TEXT_STYLES, SPACING, PAGE_WIDTH_DXA, COLORS, NO_BORDERS } from '../styles'

export function createHeader(): (Paragraph | Table)[] {
    // Read logo image
    const logoPath = path.join(process.cwd(), 'public', 'web-app-manifest-512x512.png')
    let logoBuffer: Buffer | undefined

    try {
        logoBuffer = fs.readFileSync(logoPath)
    } catch (e) {
        console.warn('Warning: Logo image not found at', logoPath)
    }

    const children: (Paragraph | Table)[] = []

    // Create header table (logo left, text right)
    const headerTable = new Table({
        columnWidths: [1200, PAGE_WIDTH_DXA - 1200],
        rows: [
            new TableRow({
                children: [
                    // Logo cell
                    new TableCell({
                        width: { size: 1200, type: WidthType.DXA },
                        verticalAlign: VerticalAlign.CENTER,
                        borders: NO_BORDERS,
                        children: [
                            new Paragraph({
                                children: logoBuffer
                                    ? [
                                        new ImageRun({
                                            type: 'png',
                                            data: logoBuffer,
                                            transformation: { width: 60, height: 60 },
                                            altText: {
                                                title: 'AET Logo',
                                                description: 'American Evaluation & Translation Services Logo',
                                                name: 'AET Logo',
                                            },
                                        }),
                                    ]
                                    : [new TextRun({ text: '[LOGO]', ...TEXT_STYLES.body })],
                            }),
                        ],
                    }),
                    // Text cell
                    new TableCell({
                        width: { size: PAGE_WIDTH_DXA - 1200, type: WidthType.DXA },
                        verticalAlign: VerticalAlign.BOTTOM,
                        borders: NO_BORDERS,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { before: 0, after: 0 },
                                children: [
                                    new TextRun({
                                        text: 'AET',
                                        size: 56,
                                        bold: true,
                                        color: COLORS.blue900,
                                        font: 'Times New Roman',
                                    }),
                                ],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { before: 40, after: 0 },
                                children: [
                                    new TextRun({
                                        text: 'American Evaluation & Translation Services',
                                        size: 20,
                                        bold: true,
                                        color: COLORS.gray500,
                                        font: 'Arial',
                                    }),
                                ],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { before: 40, after: 0 },
                                children: [
                                    new TextRun({
                                        text: 'www.americantranslationservice.com',
                                        size: 18,
                                        color: COLORS.gray500,
                                        font: 'Arial',
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    })

    children.push(headerTable)

    // Add separator line
    children.push(
        new Paragraph({
            spacing: { before: 120, after: 200 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.blue900 },
            },
            children: [],
        })
    )

    return children
}
