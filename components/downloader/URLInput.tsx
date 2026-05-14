"use client"

import { useEffect, useRef, useState, type ClipboardEvent } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, AlertTriangle, Clipboard, Loader2 } from "lucide-react"
import { BulkURLInput } from "./BulkURLInput"
import type { UseDownloaderReturn } from "@/hooks/useDownloader"

interface URLInputProps {
  downloader: UseDownloaderReturn
}

export function URLInput({ downloader }: URLInputProps) {
  const {
    url,
    setUrl,
    bulkUrls,
    setBulkUrls,
    isExtracting,
    loadingMessage,
    detectedPlatform,
    error,
    handleExtract,
    handleBulkExtract,
  } = downloader
  const [activeTab, setActiveTab] = useState("single")
  const searchParams = useSearchParams()
  const queryExtractedRef = useRef(false)
  const pendingAutoExtractUrlRef = useRef<string | null>(null)
  const isYouTubeDetected = detectedPlatform?.platform === "youtube"
  const youtubeWarning =
    "YouTube is currently not supported due to platform restrictions. Try TikTok, Instagram, Facebook, Twitter or Vimeo instead."

  const bulkCount = bulkUrls
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10).length

  async function handlePasteClick() {
    try {
      const text = await navigator.clipboard.readText()
      if (activeTab === "single") {
        setUrl(text)
      } else {
        setBulkUrls(text)
      }
    } catch {
      // Clipboard access may be blocked until the browser sees a user gesture.
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedUrl = event.clipboardData.getData("text").trim()
    if (!pastedUrl) return
    pendingAutoExtractUrlRef.current = pastedUrl
  }

  useEffect(() => {
    const queryUrl = searchParams.get("url")
    if (!queryUrl || queryExtractedRef.current) return

    queryExtractedRef.current = true
    setUrl(queryUrl)
    pendingAutoExtractUrlRef.current = queryUrl
  }, [searchParams, setUrl])

  useEffect(() => {
    if (!pendingAutoExtractUrlRef.current || url.trim() !== pendingAutoExtractUrlRef.current) return

    pendingAutoExtractUrlRef.current = null
    if (isYouTubeDetected) return
    void handleExtract()
  }, [handleExtract, isYouTubeDetected, url])

  return (
    <Card className="hover-lift overflow-hidden border-indigo-500/20 shadow-lg shadow-indigo-500/20">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-zinc-800 px-6 pt-6">
          <TabsList>
            <TabsTrigger value="single">Single URL</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Download</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="single" className="space-y-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <Input
                placeholder="Paste video URL here... (YouTube, TikTok, Instagram...)"
                value={url}
                className="h-11 flex-1"
                onChange={(event) => setUrl(event.target.value)}
                onPaste={handlePaste}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isExtracting && url && !isYouTubeDetected) {
                    void handleExtract()
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePasteClick}
                title="Paste from clipboard"
                className="h-11 w-11 shrink-0"
              >
                <Clipboard className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => void handleExtract()}
                disabled={isExtracting || !url || isYouTubeDetected}
                className="h-11 shrink-0 px-5"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingMessage ? "Waking up..." : "Detecting..."}
                  </>
                ) : (
                  "Detect & Fetch"
                )}
              </Button>
            </div>

            {isYouTubeDetected && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{youtubeWarning}</span>
              </div>
            )}

            {detectedPlatform && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-zinc-400">Platform:</span>
                <Badge variant="default" className="gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: detectedPlatform.color }}
                  />
                  {detectedPlatform.name}
                </Badge>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loadingMessage && (
              <div className="flex items-center gap-2 text-sm text-indigo-300">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>{loadingMessage}</span>
              </div>
            )}

            {!detectedPlatform && (
              <p className="mt-4 text-sm text-zinc-500">
                Popular: <span className="text-zinc-400">YouTube, TikTok, Instagram, Facebook, Twitter</span>
              </p>
            )}
          </TabsContent>

          <TabsContent value="bulk">
            <BulkURLInput
              value={bulkUrls}
              onChange={setBulkUrls}
              onDetect={handleBulkExtract}
              isLoading={isExtracting}
              loadingMessage={loadingMessage}
              submitLabel={bulkCount > 0 ? `Detect ${bulkCount} URL${bulkCount === 1 ? "" : "s"}` : "Detect URLs"}
            />
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}
