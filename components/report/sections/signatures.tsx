import { EditableInput, EditableImage } from "../ui/editable-elements"
import { SampleData, UpdateDataField } from "../types"

type SignaturesProps = {
    data: SampleData
    updateDataField: UpdateDataField
    readOnly?: boolean
}

export const Signatures = ({
    data,
    updateDataField,
    readOnly = false,
}: SignaturesProps) => {
    return (
        <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
                <div className="mb-1 pb-1">
                    <EditableImage
                        src={data.evaluatorSignature}
                        alt="Evaluator Signature"
                        width={128}
                        height={48}
                        onChange={(value) => updateDataField("evaluatorSignature", value)}
                        readOnly={readOnly}
                        className="h-12 w-auto mb-1"
                    />
                </div>
                <div className="font-bold text-blue-900 text-sm">
                    <EditableInput
                        value={data.evaluatorName}
                        onChange={(value) => updateDataField("evaluatorName", value)}
                        className="font-bold text-center"
                        readOnly={readOnly}
                    />
                </div>
                <div className="text-xs text-gray-500 text-center">Evaluator</div>
            </div>
            <div>
                <div className="mb-1 pb-1">
                    <EditableImage
                        src={data.seniorEvaluatorSignature}
                        alt="Senior Evaluator Signature"
                        width={128}
                        height={48}
                        onChange={(value) => updateDataField("seniorEvaluatorSignature", value)}
                        readOnly={readOnly}
                        className="h-12 w-auto mb-1"
                    />
                </div>
                <div className="font-bold text-blue-900 text-sm">
                    <EditableInput
                        value={data.seniorEvaluatorName}
                        onChange={(value) => updateDataField("seniorEvaluatorName", value)}
                        className="font-bold text-center"
                        readOnly={readOnly}
                    />
                </div>
                <div className="text-xs text-gray-500 text-center">Senior Evaluator</div>
            </div>
        </div>
    )
}
