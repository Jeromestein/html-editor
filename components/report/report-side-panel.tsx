"use client"

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { ImagePlus, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export type ReportChatMessage = {
  role: "user" | "assistant"
  content: string
  createdAt: string
  imageUrls: string[]
}

type ReportSidePanelProps = {
  reportId: string | null
  onClose: () => void
}

export function ReportSidePanel({ reportId, onClose }: ReportSidePanelProps) {
  const [messages, setMessages] = useState<ReportChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSend = useMemo(() => {
    return !isLoading && (input.trim().length > 0 || selectedImages.length > 0)
  }, [input, isLoading, selectedImages.length])

  useEffect(() => {
    if (!reportId) {
      setMessages([])
      return
    }

    let isActive = true

    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/ai-assist/history?reportId=${reportId}`)
        if (!response.ok) {
          throw new Error("Failed to load chat history")
        }
        const payload = (await response.json()) as { messages?: ReportChatMessage[] }
        if (isActive) {
          setMessages(payload.messages || [])
        }
      } catch (error) {
        console.error(error)
        toast({
          title: "Chat history error",
          description: "Unable to load previous assistant messages.",
          variant: "destructive",
        })
      }
    }

    loadHistory()

    return () => {
      isActive = false
    }
  }, [reportId])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
  }, [messages, isLoading])

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleString()
  }

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - selectedImages.length

    if (files.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can attach up to ${MAX_IMAGES} images at once.`,
        variant: "destructive",
      })
    }

    const nextFiles = files.slice(0, remainingSlots)
    const validFiles = nextFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image.`,
          variant: "destructive",
        })
        return false
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "Image too large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles])
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ""
    handleFiles(files)
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = Array.from(event.clipboardData.items)
    const imageFiles: File[] = []

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) {
          imageFiles.push(file)
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault()
      handleFiles(imageFiles)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files)
    handleFiles(files)
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
  }

  const uploadImages = async (files: File[]) => {
    if (!reportId) return []
    if (!supabaseClient) {
      throw new Error("Supabase client is not configured")
    }

    const uploads = files.map(async (file) => {
      const extension = file.name.split(".").pop() || "jpg"
      const filename = `${crypto.randomUUID()}.${extension}`
      const path = `${reportId}/${filename}`

      const { error } = await supabaseClient.storage.from("chat-images").upload(path, file)
      if (error) {
        throw new Error(error.message)
      }

      const { data } = supabaseClient.storage.from("chat-images").getPublicUrl(path)
      return data.publicUrl
    })

    return Promise.all(uploads)
  }

  const handleSubmit = async () => {
    if (!reportId) {
      toast({
        title: "Save required",
        description: "Please save the report before using the assistant.",
      })
      return
    }

    if (!canSend) return

    if (selectedImages.length > 0 && !supabaseClient) {
      toast({
        title: "Image uploads unavailable",
        description: "Supabase storage is not configured for this environment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const trimmedInput = input.trim()
    setInput("")

    let uploadedUrls: string[] = []

    try {
      if (selectedImages.length > 0) {
        uploadedUrls = await uploadImages(selectedImages)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Image upload failed",
        description: "Unable to upload images. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const userMessage: ReportChatMessage = {
      role: "user",
      content: trimmedInput,
      createdAt: new Date().toISOString(),
      imageUrls: uploadedUrls,
    }

    setMessages((prev) => [...prev, userMessage])
    setSelectedImages([])

    try {
      const response = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          message: trimmedInput,
          imageUrls: uploadedUrls,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get assistant response")
      }

      const payload = (await response.json()) as { message?: string; updated?: boolean }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.message || "(No response)",
          createdAt: new Date().toISOString(),
          imageUrls: [],
        },
      ])

      if (payload.updated) {
        toast({
          title: "Report Updated",
          description: "Refresh to see the latest changes.",
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
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex h-full flex-col border-l border-gray-200 bg-white"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Report Assistant</h2>
          <p className="text-xs text-gray-500">
            Review or update the report with Gemini. Chat history is saved automatically.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close assistant">
          <X size={18} />
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-50/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <ImagePlus size={48} />
              <p className="text-lg font-medium">Drop images here</p>
            </div>
          </div>
        )}
        <ScrollArea className="min-h-0 flex-1 rounded-md border border-gray-200 bg-white">
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
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  <div className="text-[10px] opacity-70">
                    {formatTimestamp(message.createdAt)}
                  </div>
                  {message.content && <div className="mt-1 whitespace-pre-wrap">{message.content}</div>}
                  {message.imageUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {message.imageUrls.map((url, imageIndex) => (
                        <img
                          key={`${url}-${imageIndex}`}
                          src={url}
                          alt="Uploaded reference"
                          className="h-20 w-full rounded object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-sm text-gray-500">Thinking...</div>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col gap-2">
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedImages.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                >
                  <span className="max-w-[140px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(index)}
                    className="rounded-full p-0.5 text-gray-500 hover:text-gray-700"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPaste={handlePaste}
            placeholder="Ask for an update or suggestion..."
            className="min-h-[90px] text-sm"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImageClick}
                disabled={selectedImages.length >= MAX_IMAGES || isLoading}
                className="gap-1"
              >
                <ImagePlus size={16} />
                Attach images
              </Button>
              <span className="text-xs text-gray-500">Max {MAX_IMAGES} images</span>
            </div>

            <Button onClick={handleSubmit} disabled={!canSend} className="gap-2">
              <Send size={16} />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
