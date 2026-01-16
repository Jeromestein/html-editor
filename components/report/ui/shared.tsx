import { ReactNode } from "react"

export type SectionTitleProps = {
    children: ReactNode
}

export const SectionTitle = ({ children }: SectionTitleProps) => (
    <h2 className="font-sans font-bold text-blue-900 uppercase text-[15px] border-b border-gray-200 mb-2 pb-1 mt-4">
        {children}
    </h2>
)

export const ReportTitle = ({ children }: { children: ReactNode }) => (
    <h1 className="text-center text-xl font-bold uppercase underline decoration-double decoration-1 underline-offset-4 text-blue-900 mb-6 mt-3 font-serif">
        {children}
    </h1>
)

export type InfoRowProps = {
    label: string
    children: ReactNode
    labelClassName?: string
}

export const InfoRow = ({ label, children, labelClassName = "" }: InfoRowProps) => (
    <div className="grid grid-cols-[9.5rem_1fr] items-center gap-2">
        <span className={`font-bold text-gray-500 ${labelClassName}`}>{label}:</span>
        <div>{children}</div>
    </div>
)

export type SummaryRowProps = {
    label: string
    children: ReactNode
}

export const SummaryRow = ({ label, children }: SummaryRowProps) => (
    <div className="flex items-start gap-2">
        <span className="text-gray-600 font-medium w-32 shrink-0 pt-1">{label}:</span>
        <div className="flex-1">{children}</div>
    </div>
)

export type DetailRowProps = {
    label: string
    children: ReactNode
}

export const DetailRow = ({ label, children }: DetailRowProps) => (
    <tr>
        <td className="py-1 pr-2 align-top font-semibold text-gray-600 w-[18rem] border-b border-gray-200">
            {label}:
        </td>
        <td className="py-1 align-top border-b border-gray-200">{children}</td>
    </tr>
)

export type DocumentFieldRowProps = {
    label: string
    children: ReactNode
}

export const DocumentFieldRow = ({ label, children }: DocumentFieldRowProps) => (
    <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
        <span className="font-semibold text-gray-600">{label}:</span>
        <div>{children}</div>
    </div>
)
