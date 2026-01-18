import { EditableTextarea } from "../ui/editable-elements"
import { UpdateDataField } from "../types"

type ReferencesProps = {
    references: string
    updateDataField: UpdateDataField
    readOnly?: boolean
}

export const References = ({ references, updateDataField, readOnly }: ReferencesProps) => (
    <div className="text-xs mb-4 mt-2">
        <EditableTextarea
            value={references || ""}
            onChange={(value) => updateDataField("references", value)}
            className="w-full min-h-[10rem] text-gray-600 whitespace-pre-wrap leading-relaxed"
            readOnly={readOnly}
        />
    </div>
)
