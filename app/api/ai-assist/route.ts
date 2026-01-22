import { NextRequest, NextResponse } from "next/server"
import { type Content, type Part } from "@google/genai"
import { getGeminiClient } from "@/lib/gemini"
import { executeReportLookup, executeReportUpdate } from "@/lib/gemini/tools/report-storage"

const SYSTEM_INSTRUCTION = `You are a helpful assistant that can read and update the current report JSON.
You will be given the current report JSON and a conversation.
If changes are needed, return a JSON object with:
- "message": a plain-text reply to the user
- "patch": a partial JSON object to merge into the report
Patch rules: objects are merged, arrays are replaced.
If no changes are needed, return "patch": null.`

const MODEL_NAME = "gemini-3-flash-preview"

type AssistantMessage = {
  role: "user" | "assistant"
  content: string
}

type AssistRequest = {
  reportId: string
  messages: AssistantMessage[]
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

    if (!body.reportId || !body.messages || body.messages.length === 0) {
      console.warn("[ai-assist] missing reportId or messages")
      return NextResponse.json(
        {
          success: false,
          message: "Missing reportId or messages.",
          updated: false,
        },
        { status: 400 }
      )
    }

    const client = getGeminiClient()
    console.log("[ai-assist] reportId:", body.reportId)
    console.log("[ai-assist] messages count:", body.messages.length)

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

    const conversation = body.messages
      .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
      .join("\n")

    const contents: Content[] = [
      {
        role: "user",
        parts: [
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
