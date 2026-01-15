import { useRef, useLayoutEffect, useEffect } from "react"
import Image from "next/image"

export type EditableInputProps = {
    value: string
    onChange: (value: string) => void
    className?: string
    placeholder?: string
    readOnly?: boolean
}

export const EditableInput = ({ value, onChange, className = "", placeholder = "", readOnly = false }: EditableInputProps) => (
    <input
        type="text"
        value={value}
        onChange={(event) => {
            if (readOnly) return
            onChange(event.target.value)
        }}
        readOnly={readOnly}
        className={`bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:bg-blue-50 transition-colors w-full px-1 ${className}`}
        placeholder={placeholder}
    />
)

export type EditableTextareaProps = {
    value: string
    onChange: (value: string) => void
    className?: string
    rows?: number
    readOnly?: boolean
}

export const EditableTextarea = ({
    value,
    onChange,
    className = "",
    rows = 3,
    readOnly = false,
}: EditableTextareaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useLayoutEffect(() => {
        if (!textareaRef.current) return
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    })

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
                if (readOnly) return
                onChange(event.target.value)
            }}
            rows={rows}
            readOnly={readOnly}
            className={`bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:bg-blue-50 transition-colors w-full p-1 resize-none ${className}`}
        />
    )
}

export type EditableImageProps = {
    src: string
    alt: string
    width: number
    height: number
    onChange: (value: string) => void
    readOnly?: boolean
    className?: string
}

export const EditableImage = ({ src, alt, width, height, onChange, readOnly = false, className = "" }: EditableImageProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageClick = () => {
        if (readOnly) return
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result
                if (typeof result === "string") {
                    onChange(result)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    if (!src && readOnly) return null

    return (
        <>
            <div
                onClick={handleImageClick}
                className={`${className} ${!readOnly ? "cursor-pointer" : ""}`}
                title={!readOnly ? "Click to upload signature" : undefined}
            >
                {src ? (
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className="w-full h-auto"
                    />
                ) : (
                    <div className="w-full h-12 border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-gray-50/50 hover:bg-gray-100/50 transition-colors rounded">
                        Upload Signature
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
            />
        </>
    )
}
