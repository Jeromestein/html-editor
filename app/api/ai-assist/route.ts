import { NextRequest, NextResponse } from "next/server"
import { type Content, type FunctionCall, type Part } from "@google/genai"
import { getGeminiClient, toolDeclarations, executeTool } from "@/lib/gemini"

const SYSTEM_INSTRUCTION = `You are a helpful assistant that can read and update the current report stored in Supabase.
Use the lookup_report tool to fetch the report by ID, and update_report to patch the JSON content.
Patch rules: objects are merged, arrays are replaced.
Always use the provided reportId when calling tools.`

const MAX_FUNCTION_CALL_ROUNDS = 8

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

export async function POST(request: NextRequest): Promise<NextResponse<AssistResponse>> {
  try {
    const body = (await request.json()) as Partial<AssistRequest>

    if (!body.reportId || !body.messages || body.messages.length === 0) {
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
    const history: Content[] = body.messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }))

    const modelConfig = {
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\nCurrent reportId: ${body.reportId}`,
      },
      tools: [{ functionDeclarations: toolDeclarations }],
    }

    let result = await client.models.generateContent({
      ...modelConfig,
      contents: history,
    })

    let rounds = 0
    let updated = false

    while (rounds < MAX_FUNCTION_CALL_ROUNDS) {
      rounds += 1

      const candidate = result.candidates?.[0]
      if (!candidate) {
        throw new Error("No response candidate from Gemini")
      }

      history.push({
        role: "model",
        parts: candidate.content?.parts || [],
      })

      const functionCalls = (candidate.content?.parts || []).filter(
        (part: Part) => part.functionCall !== undefined
      )

      if (functionCalls.length === 0) {
        break
      }

      const functionResponseParts: Part[] = []

      for (const part of functionCalls) {
        if (!part.functionCall) continue

        const { name, args } = part.functionCall as FunctionCall

        if (name === "update_report") {
          updated = true
        }

        const { result: toolResult } = await executeTool(
          name || "",
          (args as Record<string, unknown>) || {}
        )

        functionResponseParts.push({
          functionResponse: {
            name: name || "",
            response: toolResult as Record<string, unknown>,
          },
        })
      }

      history.push({
        role: "user",
        parts: functionResponseParts,
      })

      result = await client.models.generateContent({
        ...modelConfig,
        contents: history,
      })
    }

    const finalCandidate = result.candidates?.[0]
    const textPart = finalCandidate?.content?.parts?.find((part: Part) => part.text)
    const finalText = textPart?.text || ""

    return NextResponse.json({
      success: true,
      message: finalText,
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
