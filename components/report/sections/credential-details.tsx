import { RefObject } from "react"
import { Trash2, Plus } from "lucide-react"
import { EditableInput, EditableTextarea } from "../ui/editable-elements"
import { DetailRow, DocumentFieldRow } from "./shared"
import { SampleData, DocumentEntry, CredentialField, UpdateCredentialField, UpdateDocument, DeleteDocument } from "../types"

type CredentialDetailsProps = {
    credential?: SampleData["credentials"][number]
    credentialIndex?: number
    documents: DocumentEntry[]
    documentsHeading?: string
    showDocumentsHeading: boolean
    showDocumentsActions: boolean
    showCredentialTable: boolean
    updateCredentialField: UpdateCredentialField
    updateDocument: UpdateDocument
    addDocument: () => void
    deleteDocument: DeleteDocument
    readOnly?: boolean
    documentsListRef?: RefObject<HTMLUListElement | null>
    documentItemRef?: RefObject<HTMLLIElement | null>
}

export const CredentialDetails = ({
    credential,
    credentialIndex,
    documents,
    documentsHeading,
    showDocumentsHeading,
    showDocumentsActions,
    showCredentialTable,
    updateCredentialField,
    updateDocument,
    addDocument,
    deleteDocument,
    readOnly = false,
    documentsListRef,
    documentItemRef,
}: CredentialDetailsProps) => {
    const canShowCredentialTable = Boolean(showCredentialTable && credential && credentialIndex !== undefined)
    const handleCredentialFieldChange = (field: CredentialField, value: string) => {
        if (credentialIndex === undefined) return
        updateCredentialField(credentialIndex, field, value)
    }

    return (
        <div className="text-sm">
            {canShowCredentialTable && (
                <table className="w-full text-sm border-collapse mb-3 table-fixed">
                    <tbody>
                        <DetailRow label="Name of Awarding Institution">
                            <EditableInput
                                value={credential!.awardingInstitution}
                                onChange={(value) => handleCredentialFieldChange("awardingInstitution", value)}
                                className="font-semibold"
                                readOnly={readOnly}
                            />
                        </DetailRow>

                        <DetailRow label="Country">
                            <EditableInput
                                value={credential!.country}
                                onChange={(value) => handleCredentialFieldChange("country", value)}
                                readOnly={readOnly}
                            />
                        </DetailRow>
                        <DetailRow label="Admission Requirements">
                            <EditableTextarea
                                value={credential!.admissionRequirements}
                                onChange={(value) => handleCredentialFieldChange("admissionRequirements", value)}
                                rows={1}
                                className="leading-snug"
                                readOnly={readOnly}
                            />
                        </DetailRow>
                        <DetailRow label="Program">
                            <EditableTextarea
                                value={credential!.program}
                                onChange={(value) => handleCredentialFieldChange("program", value)}
                                rows={1}
                                className="leading-snug"
                                readOnly={readOnly}
                            />
                        </DetailRow>
                        <DetailRow label="Grants Access to">
                            <EditableInput
                                value={credential!.grantsAccessTo}
                                onChange={(value) => handleCredentialFieldChange("grantsAccessTo", value)}
                                readOnly={readOnly}
                            />
                        </DetailRow>
                        <DetailRow label="Standard Program Length">
                            <EditableInput
                                value={credential!.standardProgramLength}
                                onChange={(value) => handleCredentialFieldChange("standardProgramLength", value)}
                                readOnly={readOnly}
                            />
                        </DetailRow>
                        <DetailRow label="Years Attended">
                            <EditableInput
                                value={credential!.yearsAttended}
                                onChange={(value) => handleCredentialFieldChange("yearsAttended", value)}
                                readOnly={readOnly}
                            />
                        </DetailRow>
                        <DetailRow label="Year of Graduation">
                            <EditableInput
                                value={credential!.yearOfGraduation}
                                onChange={(value) => handleCredentialFieldChange("yearOfGraduation", value)}
                                readOnly={readOnly}
                            />
                        </DetailRow>
                    </tbody>
                </table>
            )}

            {showDocumentsHeading && (
                <div className="border-t border-gray-300 pt-2">
                    {documentsHeading && (
                        <div className="text-[10px] font-semibold text-gray-700 mb-1">{documentsHeading}</div>
                    )}
                    <ul className="list-disc pl-4 space-y-2" ref={documentsListRef}>
                        {documents.map((entry, index) => (
                            <li
                                key={`${entry.document.title}-${entry.index}`}
                                className={`relative ${readOnly ? "" : "pr-5"}`}
                                ref={index === 0 ? documentItemRef : undefined}
                            >
                                <EditableInput
                                    value={entry.document.title}
                                    onChange={(value) => updateDocument(entry.index, "title", value)}
                                    className="font-semibold"
                                    readOnly={readOnly}
                                />
                                <div className="mt-0.5 space-y-0.5">
                                    <DocumentFieldRow label="Issued By">
                                        <EditableTextarea
                                            value={entry.document.issuedBy}
                                            onChange={(value) => updateDocument(entry.index, "issuedBy", value)}
                                            rows={1}
                                            className="leading-snug"
                                            readOnly={readOnly}
                                        />
                                    </DocumentFieldRow>
                                    <div className="grid grid-cols-2 gap-x-6">
                                        <DocumentFieldRow label="Date of Issue">
                                            <EditableInput
                                                value={entry.document.dateIssued}
                                                onChange={(value) => updateDocument(entry.index, "dateIssued", value)}
                                                readOnly={readOnly}
                                            />
                                        </DocumentFieldRow>
                                        <DocumentFieldRow label="Certificate No.">
                                            <EditableInput
                                                value={entry.document.certificateNo}
                                                onChange={(value) => updateDocument(entry.index, "certificateNo", value)}
                                                readOnly={readOnly}
                                            />
                                        </DocumentFieldRow>
                                    </div>
                                </div>
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => deleteDocument(entry.index)}
                                        className="no-print absolute right-0 top-0 text-gray-300 hover:text-red-500 transition-colors"
                                        title="Remove Document"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {!readOnly && showDocumentsActions && (
                        <button
                            type="button"
                            onClick={addDocument}
                            className="no-print mt-2 flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 transition-colors"
                        >
                            <Plus size={12} /> Add Document
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
