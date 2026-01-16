import { SampleData, UpdateDataField } from "../types"
import { EditableInput } from "../ui/editable-elements"
import { SummaryRow } from "../ui/shared"

type ApplicantInfoProps = {
    data: SampleData
    updateDataField: UpdateDataField
    readOnly?: boolean
}

export const ApplicantInfo = ({ data, updateDataField, readOnly = false }: ApplicantInfoProps) => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm border-b border-gray-200 pb-4">
        <SummaryRow label="Name of Applicant">
            <EditableInput
                value={data.name}
                onChange={(value) => updateDataField("name", value)}
                className="font-semibold"
                readOnly={readOnly}
            />
        </SummaryRow>
        <SummaryRow label="Evaluation ID">
            <EditableInput
                value={data.refNo}
                onChange={(value) => updateDataField("refNo", value)}
                className="font-semibold"
                readOnly={readOnly}
            />
        </SummaryRow>
        <SummaryRow label="Date of Birth">
            <EditableInput
                value={data.dob}
                onChange={(value) => updateDataField("dob", value)}
                className="font-semibold"
                readOnly={readOnly}
            />
        </SummaryRow>
        <SummaryRow label="Date of Evaluation">
            <EditableInput
                value={data.date}
                onChange={(value) => updateDataField("date", value)}
                className="font-semibold"
                readOnly={readOnly}
            />
        </SummaryRow>
        <div className="col-span-2">
            <SummaryRow label="Purpose of evaluation">
                <EditableInput
                    value={data.purpose}
                    onChange={(value) => updateDataField("purpose", value)}
                    className="font-semibold"
                    readOnly={readOnly}
                />
            </SummaryRow>
        </div>
        <div className="col-span-2">
            <SummaryRow label="Country of Education">
                <EditableInput
                    value={data.country}
                    onChange={(value) => updateDataField("country", value)}
                    className="font-semibold"
                    readOnly={readOnly}
                />
            </SummaryRow>
        </div>
    </div>
)
