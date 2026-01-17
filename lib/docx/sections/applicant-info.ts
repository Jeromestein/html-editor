/**
 * Applicant Info Section Generator
 * 
 * Creates 2-column grid with applicant details
 */

import { Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign } from 'docx'
import { SampleData } from '../../report-data'
import { COLUMN_WIDTHS, TEXT_STYLES, SPACING, PAGE_WIDTH_DXA } from '../styles'
import { createLabelValueRow } from '../utils'

export function createApplicantInfo(data: SampleData): (Paragraph | Table)[] {
    const halfWidth = PAGE_WIDTH_DXA / 2 - 100
    const labelWidth = Math.floor(halfWidth * 0.4)
    const valueWidth = Math.floor(halfWidth * 0.6)

    // Create 2x3 grid table for applicant info
    const infoTable = new Table({
        columnWidths: [labelWidth, valueWidth, labelWidth, valueWidth],
        rows: [
            // Row 1: Name | Date of Evaluation
            new TableRow({
                children: [
                    createLabelCell('NAME OF APPLICANT', labelWidth),
                    createValueCell(data.name, valueWidth, true),
                    createLabelCell('DATE OF EVALUATION', labelWidth),
                    createValueCell(data.date, valueWidth, true),
                ],
            }),
            // Row 2: DOB | Evaluation ID  
            new TableRow({
                children: [
                    createLabelCell('DATE OF BIRTH', labelWidth),
                    createValueCell(data.dob, valueWidth, true),
                    createLabelCell('EVALUATION ID', labelWidth),
                    createValueCell(data.refNo, valueWidth, true),
                ],
            }),
        ],
    })

    // Purpose row (full width)
    const purposeTable = new Table({
        columnWidths: [labelWidth, PAGE_WIDTH_DXA - labelWidth],
        rows: [
            new TableRow({
                children: [
                    createLabelCell('PURPOSE OF EVALUATION', labelWidth),
                    createValueCell(data.purpose, PAGE_WIDTH_DXA - labelWidth, true),
                ],
            }),
            new TableRow({
                children: [
                    createLabelCell('COUNTRY OF EDUCATION', labelWidth),
                    createValueCell(data.country, PAGE_WIDTH_DXA - labelWidth, true),
                ],
            }),
        ],
    })

    return [
        infoTable,
        new Paragraph({ spacing: { before: 60, after: 0 }, children: [] }),
        purposeTable,
        new Paragraph({ spacing: SPACING.section, children: [] }),
    ]
}

function createLabelCell(text: string, width: number): TableCell {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                    {
                        type: 'text',
                        text,
                        ...TEXT_STYLES.label,
                    } as any,
                ],
            }),
        ],
    })
}

function createValueCell(text: string, width: number, bold: boolean = false): TableCell {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                    {
                        type: 'text',
                        text,
                        ...(bold ? TEXT_STYLES.bodyBold : TEXT_STYLES.body),
                    } as any,
                ],
            }),
        ],
    })
}
