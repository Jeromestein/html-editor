import { NextRequest, NextResponse } from "next/server"
import { type Content, type Part } from "@google/genai"
import { getGeminiClient } from "@/lib/gemini"
import { executeReportLookup, executeReportUpdate } from "@/lib/gemini/tools/report-storage"
import { supabase } from "@/lib/supabase"

const SYSTEM_INSTRUCTION = `You are a helpful assistant that can read and update the current report JSON.
You will be given the current report JSON and a conversation.
If changes are needed, return a JSON object with:
- "message": a plain-text reply to the user
- "patch": a partial JSON object to merge into the report
Patch rules: objects are merged, arrays are replaced.
If no changes are needed, return "patch": null.`

const MODEL_NAME = "gemini-3-flash-preview"
const CHAT_HISTORY_TABLE = "report_chat_history"

type AssistantMessage = {
  role: "user" | "assistant"
  content: string
}

type AssistRequest = {
  reportId: string
  message: string
  imageUrls?: string[]
}

type AssistResponse = {
  success: boolean
  message: string
  updated: boolean
}

type ModelReply = {
  message: string
  patch: Record<string, unknown> | null
}

export async function POST(request: NextRequest): Promise<NextResponse<AssistResponse>> {
  try {
    console.log("[ai-assist] request received")
    const body = (await request.json()) as Partial<AssistRequest>

    const message = body.message?.trim() || ""
    const imageUrls = body.imageUrls?.filter(Boolean) || []

    if (!body.reportId || (!message && imageUrls.length === 0)) {
      console.warn("[ai-assist] missing reportId or message")
      return NextResponse.json(
        {
          success: false,
          message: "Missing reportId or message.",
          updated: false,
        },
        { status: 400 }
      )
    }

    const client = getGeminiClient()
    console.log("[ai-assist] reportId:", body.reportId)
    console.log("[ai-assist] has images:", imageUrls.length)

    const lookupResult = await executeReportLookup({ reportId: body.reportId })
    if (!lookupResult.success || !lookupResult.report) {
      console.warn("[ai-assist] report lookup failed:", lookupResult.warning)
      return NextResponse.json(
        {
          success: false,
          message: lookupResult.warning || "Report not found.",
          updated: false,
        },
        { status: 404 }
      )
    }

    const { data: history, error: historyError } = await supabase
      .from(CHAT_HISTORY_TABLE)
      .select("role, content, image_urls, created_at")
      .eq("report_id", body.reportId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (historyError) {
      console.warn("[ai-assist] history lookup failed:", historyError.message)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to load chat history.",
          updated: false,
        },
        { status: 500 }
      )
    }

    const orderedHistory = (history || []).slice().reverse()
    const conversationLines = orderedHistory.map((entry: AssistantMessage & { image_urls?: string[] }) => {
      const imageNote = entry.image_urls?.length ? ` [${entry.image_urls.length} image(s)]` : ""
      return `${entry.role === "assistant" ? "Assistant" : "User"}${imageNote}: ${entry.content}`
    })

    const currentNote = imageUrls.length ? ` [${imageUrls.length} image(s)]` : ""
    const conversation = [...conversationLines, `User${currentNote}: ${message || "(no text)"}`].join("\n")

    const insertUserResult = await supabase.from(CHAT_HISTORY_TABLE).insert({
      report_id: body.reportId,
      role: "user",
      content: message,
      image_urls: imageUrls,
    })

    if (insertUserResult.error) {
      console.warn("[ai-assist] failed to store user message:", insertUserResult.error.message)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save chat message.",
          updated: false,
        },
        { status: 500 }
      )
    }

    const imageParts: Part[] = []
    if (imageUrls.length > 0) {
      try {
        const imageUploads = await Promise.all(
          imageUrls.map(async (url) => {
            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`Failed to download image: ${url}`)
            }
            const mimeType = response.headers.get("content-type") || "image/jpeg"
            const buffer = Buffer.from(await response.arrayBuffer())
            return {
              inlineData: {
                mimeType,
                data: buffer.toString("base64"),
              },
            }
          })
        )
        imageParts.push(...imageUploads)
      } catch (error) {
        console.warn("[ai-assist] failed to fetch images:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to process attached images.",
            updated: false,
          },
          { status: 500 }
        )
      }
    }

    const contents: Content[] = [
      {
        role: "user",
        parts: [
          ...imageParts,
          {
            text: `Report JSON:\n${JSON.stringify(lookupResult.report.content, null, 2)}\n\nConversation:\n${conversation}\n\nReturn a JSON object with "message" and "patch".`,
          },
        ],
      },
    ]

    const result = await client.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
      contents,
    })

    const candidate = result.candidates?.[0]
    const responseText = candidate?.content?.parts
      ?.filter((part: Part) => part.text)
      .map((part: Part) => part.text)
      .join("") || ""

    if (!responseText) {
      console.warn("[ai-assist] empty response from model")
      return NextResponse.json(
        {
          success: false,
          message: "AI assist returned empty response.",
          updated: false,
        },
        { status: 500 }
      )
    }

    let modelReply: ModelReply
    try {
      modelReply = JSON.parse(responseText) as ModelReply
    } catch (error) {
      console.warn("[ai-assist] failed to parse model JSON:", responseText)
      return NextResponse.json(
        {
          success: false,
          message: "AI assist returned invalid JSON.",
          updated: false,
        },
        { status: 500 }
      )
    }

    const patch = modelReply.patch
    let updated = false
    let finalMessage = modelReply.message || ""

    if (patch && typeof patch === "object" && Object.keys(patch).length > 0) {
      const updateResult = await executeReportUpdate({
        reportId: body.reportId,
        patch,
      })

      if (!updateResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: updateResult.warning || "Failed to update report.",
            updated: false,
          },
          { status: 500 }
        )
      }

      updated = true
    }

    if (!finalMessage && updated) {
      finalMessage = "Report updated."
    }

    const insertAssistantResult = await supabase.from(CHAT_HISTORY_TABLE).insert({
      report_id: body.reportId,
      role: "assistant",
      content: finalMessage,
      image_urls: [],
    })

    if (insertAssistantResult.error) {
      console.warn("[ai-assist] failed to store assistant message:", insertAssistantResult.error.message)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save assistant response.",
          updated: false,
        },
        { status: 500 }
      )
    }

    console.log("[ai-assist] response length:", finalMessage.length)
    return NextResponse.json({
      success: true,
      message: finalMessage,
      updated,
    })
  } catch (error) {
    console.error("AI assist error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "AI assist failed. Please try again.",
        updated: false,
      },
      { status: 500 }
    )
  }
}
