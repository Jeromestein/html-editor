import { useRef, useState, useEffect, useLayoutEffect, RefObject } from "react"
import { SampleData } from "../types"
import { DEFAULT_ROWS_PER_FIRST_PAGE, DEFAULT_ROWS_PER_FULL_PAGE } from "../constants"

type UseDynamicMeasureProps = {
    data: SampleData
    onReady?: () => void
}

export const useDynamicMeasure = ({ data, onReady }: UseDynamicMeasureProps) => {
    const [rowsPerFirstPage, setRowsPerFirstPage] = useState(DEFAULT_ROWS_PER_FIRST_PAGE)
    const [rowsPerFirstPageWithTail, setRowsPerFirstPageWithTail] = useState(DEFAULT_ROWS_PER_FIRST_PAGE)
    const [rowsPerFullPage, setRowsPerFullPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)
    const [rowsPerLastPage, setRowsPerLastPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)
    const [documentsPerPage, setDocumentsPerPage] = useState(() => Math.max(1, data.documents.length))
    const [documentsPerFullPage, setDocumentsPerFullPage] = useState(DEFAULT_ROWS_PER_FULL_PAGE)

    const courseContentRef = useRef<HTMLDivElement>(null)
    const introContentRef = useRef<HTMLDivElement>(null)
    const tableStartRef = useRef<HTMLDivElement>(null)
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
    const rowRef = useRef<HTMLTableRowElement>(null)
    const tailRef = useRef<HTMLDivElement>(null)
    const documentsListRef = useRef<HTMLUListElement>(null)
    const documentItemRef = useRef<HTMLLIElement>(null)
    const readySentRef = useRef(false)
    const [fontsReady, setFontsReady] = useState(false)

    useEffect(() => {
        if (!onReady) return
        let active = true
        if (document.fonts?.ready) {
            document.fonts.ready
                .then(() => {
                    if (active) setFontsReady(true)
                })
                .catch(() => {
                    if (active) setFontsReady(true)
                })
        } else {
            setFontsReady(true)
        }
        return () => {
            active = false
        }
    }, [onReady])

    useEffect(() => {
        if (!onReady) return
        readySentRef.current = false
    }, [data, onReady])

    useLayoutEffect(() => {
        const courseContentEl = courseContentRef.current
        const introContentEl = introContentRef.current
        const startEl = tableStartRef.current
        const headerEl = tableHeaderRef.current
        const rowEl = rowRef.current
        const listEl = documentsListRef.current
        const itemEl = documentItemRef.current
        let rafId = requestAnimationFrame(() => {
            let nextFirst = rowsPerFirstPage
            let nextFirstWithTail = rowsPerFirstPageWithTail
            let nextFull = rowsPerFullPage
            let nextLast = rowsPerLastPage
            let nextDocumentsPerPage = documentsPerPage
            let nextDocumentsPerFullPage = documentsPerFullPage

            if (courseContentEl && startEl && headerEl && rowEl) {
                const contentRect = courseContentEl.getBoundingClientRect()
                const startRect = startEl.getBoundingClientRect()
                const headerRect = headerEl.getBoundingClientRect()
                const rowRect = rowEl.getBoundingClientRect()

                if (contentRect.height > 0 && rowRect.height > 0) {
                    const headerOffset = Math.max(0, startRect.top - contentRect.top)
                    const safetyPadding = 36
                    let tailHeight = 0

                    if (tailRef.current) {
                        const tailRect = tailRef.current.getBoundingClientRect()
                        const tailStyle = window.getComputedStyle(tailRef.current)
                        const marginTop = Number.parseFloat(tailStyle.marginTop) || 0
                        const marginBottom = Number.parseFloat(tailStyle.marginBottom) || 0
                        tailHeight = tailRect.height + marginTop + marginBottom
                    }

                    const availableFirst = contentRect.height - headerOffset - headerRect.height - safetyPadding
                    const availableFirstWithTail = availableFirst - tailHeight
                    const availableFull = contentRect.height - headerRect.height - safetyPadding
                    const availableLast = availableFull - tailHeight

                    nextFirst = Math.max(0, Math.floor(availableFirst / rowRect.height))
                    nextFirstWithTail = Math.max(0, Math.floor(availableFirstWithTail / rowRect.height))
                    nextFull = Math.max(1, Math.floor(availableFull / rowRect.height))
                    nextLast = Math.max(1, Math.floor(availableLast / rowRect.height))

                    const overflow = courseContentEl.scrollHeight - contentRect.height
                    if (overflow > 0) {
                        const overflowRows = Math.ceil(overflow / rowRect.height)
                        nextFirst = Math.max(0, nextFirst - overflowRows)
                        nextFirstWithTail = Math.max(0, nextFirstWithTail - overflowRows)
                    }
                }
            }

            if (introContentEl && listEl && itemEl) {
                const introRect = introContentEl.getBoundingClientRect()
                const listRect = listEl.getBoundingClientRect()
                const itemRect = itemEl.getBoundingClientRect()
                const itemStyle = window.getComputedStyle(itemEl)

                const safetyPadding = 24
                const itemMarginTop = Number.parseFloat(itemStyle.marginTop) || 0
                const itemMarginBottom = Number.parseFloat(itemStyle.marginBottom) || 0
                const itemHeight = itemRect.height + itemMarginTop + itemMarginBottom
                const gap = 8
                const availableDocumentsFirst = introRect.bottom - listRect.top - safetyPadding

                nextDocumentsPerPage = Math.max(1, Math.floor((availableDocumentsFirst + gap) / (itemHeight + gap)))

                const totalDocuments = data.documents.length
                if (totalDocuments > 0 && totalDocuments <= nextDocumentsPerPage + 1) {
                    const buttonHeightApprox = 60
                    const heightForDocs = totalDocuments * itemHeight + Math.max(0, totalDocuments - 1) * gap
                    const heightWithButton = heightForDocs + gap + buttonHeightApprox

                    if (totalDocuments <= nextDocumentsPerPage && heightWithButton > availableDocumentsFirst) {
                        nextDocumentsPerPage = Math.max(1, nextDocumentsPerPage - 1)
                    }
                }

                const docOverflow = introContentEl.scrollHeight - introRect.height
                if (docOverflow > 0) {
                    const overflowRows = Math.ceil(docOverflow / (itemHeight + gap))
                    nextDocumentsPerPage = Math.max(1, nextDocumentsPerPage - overflowRows)
                }

                const sectionTitleOverhead = 60
                const availableDocumentsFull = introRect.height - sectionTitleOverhead - safetyPadding
                nextDocumentsPerFullPage = Math.max(1, Math.floor(availableDocumentsFull / itemHeight))
            }

            const changed =
                nextFirst !== rowsPerFirstPage ||
                nextFirstWithTail !== rowsPerFirstPageWithTail ||
                nextFull !== rowsPerFullPage ||
                nextLast !== rowsPerLastPage ||
                nextDocumentsPerPage !== documentsPerPage ||
                nextDocumentsPerFullPage !== documentsPerFullPage

            if (changed) {
                readySentRef.current = false
                setRowsPerFirstPage(nextFirst)
                setRowsPerFirstPageWithTail(nextFirstWithTail)
                setRowsPerFullPage(nextFull)
                setRowsPerLastPage(nextLast)
                setDocumentsPerPage(nextDocumentsPerPage)
                setDocumentsPerFullPage(nextDocumentsPerFullPage)
                return
            }

            if (onReady && fontsReady && !readySentRef.current) {
                readySentRef.current = true
                onReady()
            }
        })

        return () => {
            cancelAnimationFrame(rafId)
        }
    }, [
        data,
        documentsPerPage,
        fontsReady,
        onReady,
        rowsPerFirstPage,
        rowsPerFirstPageWithTail,
        rowsPerFullPage,
        rowsPerLastPage,
    ])

    return {
        measurements: {
            rowsPerFirstPage,
            rowsPerFirstPageWithTail,
            rowsPerFullPage,
            rowsPerLastPage,
            documentsPerPage,
            documentsPerFullPage,
        },
        refs: {
            courseContentRef,
            introContentRef,
            tableStartRef,
            tableHeaderRef,
            rowRef,
            tailRef,
            documentsListRef,
            documentItemRef,
        }
    }
}
