
import { supabase } from "@/lib/supabase"
import ReportEditor from "@/components/report"
import { notFound, redirect } from "next/navigation"
import { TABLE_NAME } from "@/lib/report-store"

interface PageProps {
    params: {
        slug: string
    }
}

// Revalidate every 0 seconds (dynamic) to ensure fresh data on edit
// or we can use on-demand revalidation. For an editor, dynamic is safer.
export const revalidate = 0

export async function generateMetadata({ params }: PageProps) {
    const { slug: rawSlug } = await params
    const slug = decodeURIComponent(rawSlug)

    // Optimistic title based on URL, or fetch valid name if needed. 
    // Since slug is the name, we can just use it directly!
    return {
        title: `${slug} - AET Smart Editor`,
    }
}

export default async function ReportPage({ params }: PageProps) {
    const { slug: rawSlug } = await params
    const slug = decodeURIComponent(rawSlug)

    console.log(`[ReportPage] ID-based or legacy name lookup for slug:`, slug)

    // First try filtering if it matches "name"
    // (Note: In a real app we might use ID in URL or handle uniqueness stricter)
    const { data: report, error } = await supabase
        .from(TABLE_NAME)
        .select('content, id, name')
        .eq('name', slug)
        // Order by updated_at desc to get the latest if duplicates exist
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Error fetching report:", error)
        throw error
    }

    if (!report) {
        // If not found, we might want to redirect to home or show 404.
        // 404 is semantically correct for a "specific resource" URL that doesn't exist.
        // However, user might want to CREATE a report with this name?
        // For now, let's 404.
        notFound()
    }

    return <ReportEditor
        initialData={report.content}
        initialName={report.name}
        initialId={report.id}
    />
}
