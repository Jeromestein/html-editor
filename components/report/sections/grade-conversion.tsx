import { EditableInput } from "../ui/editable-elements"
import { GradeConversionRow, GradeConversionField } from "../types"

type GradeConversionProps = {
    rows: GradeConversionRow[]
    onUpdate: (rowIndex: number, field: GradeConversionField, value: string) => void
    readOnly?: boolean
}

export const GradeConversion = ({ rows, onUpdate, readOnly = false }: GradeConversionProps) => (
    <table className="w-1/2 text-xs text-center border-collapse border border-gray-300">
        <thead className="bg-gray-100 print:bg-gray-50">
            <tr>
                <th className="border border-gray-300 p-1">Grade</th>
                <th className="border border-gray-300 p-1">U.S. Grade</th>
            </tr>
        </thead>
        <tbody>
            {rows.map((row, index) => (
                <tr key={index} className="hover:bg-blue-50">
                    <td className="border border-gray-300 p-0 editable-cell">
                        <EditableInput
                            value={row.grade}
                            onChange={(value) => onUpdate(index, "grade", value)}
                            className="text-center h-full"
                            readOnly={readOnly}
                        />
                    </td>
                    <td className="border border-gray-300 p-0 editable-cell">
                        <EditableInput
                            value={row.usGrade}
                            onChange={(value) => onUpdate(index, "usGrade", value)}
                            className="text-center h-full"
                            readOnly={readOnly}
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
)
