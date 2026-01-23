import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const CHAT_HISTORY_TABLE = "report_chat_history"

type HistoryMessage = {
  role: "user" | "assistant"
  content: string
  created_at: string
  image_urls: string[] | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reportId = searchParams.get("reportId")

  if (!reportId) {
    return NextResponse.json({ message: "Missing reportId." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from(CHAT_HISTORY_TABLE)
    .select("role, content, created_at, image_urls")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  const messages = (data as HistoryMessage[] | null)?.slice().reverse().map((message) => ({
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    imageUrls: message.image_urls || [],
  }))

  return NextResponse.json({ messages: messages || [] })
}
