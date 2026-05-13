"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clipboard, Loader2 } from "lucide-react"
import { QualitySelector } from "./QualitySelector"
import { FormatSelector } from "./FormatSelector"
import { BulkURLInput } from "./BulkURLInput"
import { DownloadItem, Platform, Quality, Format } from "@/types"

interface URLInputProps {
  onAddDownloads: (items: DownloadItem[]) => void
}

function detectPlatform(url: string): Platform {
  const urlStr = url.toLowerCase()
  if (urlStr.includes("youtube.com") || urlStr.includes("youtu.be")) return "youtube"
  if (urlStr.includes("tiktok.com")) return "tiktok"
  if (urlStr.includes("instagram.com")) return "instagram"
  if (urlStr.includes("facebook.com")) return "facebook"
  if (urlStr.includes("twitter.com") || urlStr.includes("x.com")) return "twitter"
  if (urlStr.includes("reddit.com")) return "reddit"
  if (urlStr.includes("vimeo.com")) return "vimeo"
  if (urlStr.includes("dailymotion.com")) return "dailymotion"
  if (urlStr.includes("soundcloud.com")) return "soundcloud"
  return "unknown"
}

function generateMockDownload(url: string, index: number = 0): DownloadItem {
  const platform = detectPlatform(url)
  const titles: Record<string, string> = {
    youtube: `Video from YouTube - ${index + 1}`,
    tiktok: `TikTok Video #${index + 1}`,
    instagram: `Instagram Reel - ${index + 1}`,
    facebook: `Facebook Video - ${index + 1}`,
    twitter: `Tweet Video - ${index + 1}`,
    reddit: `Reddit Post - ${index + 1}`,
    vimeo: `Vimeo Video - ${index + 1}`,
    dailymotion: `Dailymotion Video - ${index + 1}`,
    soundcloud: `SoundCloud Track - ${index + 1}`,
    unknown: `Video ${index + 1}`,
  }

  return {
    id: `download-${Date.now()}-${index}`,
    url,
    platform,
    title: titles[platform],
    thumbnail: `https://picsum.photos/120/68?random=${Date.now() + index}`,
    duration: "15:42",
    quality: "1080p",
    format: "mp4",
    status: "ready",
    progress: 0,
    fileSize: "245 MB",
  }
}

export function URLInput({ onAddDownloads }: URLInputProps) {
  const [singleUrl, setSingleUrl] = useState("")
  const [bulkUrls, setBulkUrls] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null)
  const [quality, setQuality] = useState<Quality>("1080p")
  const [format, setFormat] = useState<Format>("mp4")
  const [activeTab, setActiveTab] = useState("single")

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (activeTab === "single") {
        setSingleUrl(text)
      } else {
        setBulkUrls(text)
      }
    } catch {
      console.log("Failed to read clipboard")
    }
  }

  const handleDetect = useCallback(async () => {
    setIsLoading(true)
    // Simulate 2 second detection time
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const platform = detectPlatform(singleUrl)
    setDetectedPlatform(platform)
    setIsLoading(false)
  }, [singleUrl])

  const handleDownloadNow = () => {
    if (singleUrl && detectedPlatform) {
      // Simulate 3 second download
      const newItem = generateMockDownload(singleUrl)
      onAddDownloads([newItem])
      
      // Simulate download progress
      setTimeout(() => {
        // Progress simulation will be handled by the parent
      }, 100)
      
      setSingleUrl("")
      setDetectedPlatform(null)
      setQuality("1080p")
      setFormat("mp4")
    }
  }

  const handleBulkDetect = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const urls = bulkUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .slice(0, 10)

    const downloads = urls.map((url, index) =>
      generateMockDownload(url, index)
    )

    onAddDownloads(downloads)
    setBulkUrls("")
    setIsLoading(false)
  }

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
          {/* Single URL Tab */}
          <TabsContent value="single" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Paste video URL here... (YouTube, TikTok, Instagram...)"
                value={singleUrl}
                onChange={(e) => {
                  setSingleUrl(e.target.value)
                  setDetectedPlatform(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && singleUrl) {
                    handleDetect()
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePasteClick}
                title="Paste from clipboard"
              >
                <Clipboard className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleDetect}
                disabled={!singleUrl || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  "Detect & Fetch"
                )}
              </Button>
            </div>

            {/* Detected Platform Badge */}
            {detectedPlatform && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-zinc-400">Platform:</span>
                <Badge variant="primary">
                  {detectedPlatform.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Quality & Format Selectors */}
            {detectedPlatform && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <QualitySelector value={quality} onValueChange={setQuality} />
                <FormatSelector
                  value={format}
                  onValueChange={setFormat}
                  quality={quality}
                />
              </div>
            )}

            {/* Download Button */}
            {detectedPlatform && (
              <Button
                onClick={handleDownloadNow}
                className="w-full"
                size="lg"
              >
                Download Now
              </Button>
            )}

            {/* Popular Platforms */}
            {!detectedPlatform && (
              <p className="text-sm text-zinc-500 mt-4">
                Popular: <span className="text-zinc-400">YouTube • TikTok • Instagram • Facebook • Twitter</span>
              </p>
            )}
          </TabsContent>

          {/* Bulk Download Tab */}
          <TabsContent value="bulk">
            <BulkURLInput
              value={bulkUrls}
              onChange={setBulkUrls}
              onDetect={handleBulkDetect}
              isLoading={isLoading}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}
