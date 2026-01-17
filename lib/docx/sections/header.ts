/**
 * Header Section Generator
 * 
 * Creates: AET Logo + Company Name + Website as a page header
 * This appears on every page of the document
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
    Header,
} from 'docx'
import { TEXT_STYLES, PAGE_WIDTH_DXA, COLORS, NO_BORDERS } from '../styles'

/**
 * Create the page header with AET logo and company info
 * This will appear on every page
 */
export function createPageHeader(): Header {
    // Read logo image
    const logoPath = path.join(process.cwd(), 'public', 'web-app-manifest-512x512.png')
    let logoBuffer: Buffer | undefined

    try {
        logoBuffer = fs.readFileSync(logoPath)
    } catch (e) {
        console.warn('Warning: Logo image not found at', logoPath)
    }

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
                                            transformation: { width: 50, height: 50 },
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
                        verticalAlign: VerticalAlign.CENTER,
                        borders: NO_BORDERS,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { before: 0, after: 0 },
                                children: [
                                    new TextRun({
                                        text: 'AET',
                                        size: 48,
                                        bold: true,
                                        color: COLORS.blue900,
                                        font: 'Times New Roman',
                                    }),
                                    new TextRun({
                                        text: '  American Evaluation & Translation Services',
                                        size: 18,
                                        bold: true,
                                        color: COLORS.gray500,
                                        font: 'Arial',
                                    }),
                                ],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { before: 20, after: 0 },
                                children: [
                                    new TextRun({
                                        text: 'www.americantranslationservice.com',
                                        size: 16,
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

    // Separator line
    const separatorLine = new Paragraph({
        spacing: { before: 60, after: 0 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.blue900 },
        },
        children: [],
    })

    return new Header({
        children: [headerTable, separatorLine],
    })
}

