"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/hooks/use-toast"

export type AssistantMessage = {
  role: "user" | "assistant"
  content: string
}

type ReportAssistantProps = {
  reportId: string | null
}

export function ReportAssistant({ reportId }: ReportAssistantProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const canSend = useMemo(() => !isLoading && input.trim().length > 0, [input, isLoading])

  useEffect(() => {
    if (!open) return
    const scrollEl = scrollRef.current
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
  }, [messages, open])

  const handleSubmit = async () => {
    if (!reportId) {
      toast({
        title: "Save required",
        description: "Please save the report before using the assistant.",
      })
      return
    }

    if (!canSend) return

    const nextMessage: AssistantMessage = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, nextMessage])
    setInput("")
    setIsLoading(true)

    const pendingToast = toast({
      title: "AI is editing...",
      description: "Changes will be saved to the report.",
      duration: 100000,
    })

    try {
      const response = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          messages: [...messages, nextMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get assistant response")
      }

      const payload = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.message || "(No response)",
        },
      ])

      if (payload.updated) {
        toast({
          title: "Report Updated",
          description: "Refresh to see the latest changes.",
          action: (
            <ToastAction altText="Refresh" onClick={() => window.location.reload()}>
              Refresh
            </ToastAction>
          ),
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Assistant error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      pendingToast.dismiss()
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <MessageSquare size={16} />
          Chat with Report
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Report Assistant</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
          <div className="text-sm text-gray-600">
            Ask Gemini to review or update the current report. The assistant can read and patch saved data.
          </div>
          <ScrollArea className="min-h-0 flex-1 rounded-md border border-gray-200 bg-white" >
            <div ref={scrollRef} className="flex flex-col gap-3 p-4">
              {messages.length === 0 && (
                <div className="text-sm text-gray-500">
                  Start a conversation to update your report.
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-sm text-gray-500">Thinking...</div>
              )}
            </div>
          </ScrollArea>
          <div className="flex flex-col gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for an update or suggestion..."
              className="min-h-[80px] text-sm"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {reportId ? "Report connected" : "Save the report to enable edits"}
              </span>
              <Button onClick={handleSubmit} disabled={!canSend} className="gap-2">
                <Send size={16} />
                Send
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
