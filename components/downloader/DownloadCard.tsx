"use client"

import Image from "next/image"
import { DownloadItem, Format, Quality } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectOption } from "@/components/ui/select"
import { AlertCircle, Check, Download, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DownloadCardProps {
  item: DownloadItem
  onDownload: (item: DownloadItem) => void
  onRemove: (id: string) => void
  onUpdateQuality: (id: string, quality: Quality) => void
  onUpdateFormat: (id: string, format: Format) => void
}

const platformColors: Record<string, string> = {
  youtube: "bg-red-600/10 text-red-400 border-red-500/20",
  tiktok: "bg-black/10 text-white border-zinc-700",
  instagram: "bg-pink-600/10 text-pink-400 border-pink-500/20",
  facebook: "bg-blue-600/10 text-blue-400 border-blue-500/20",
  twitter: "bg-sky-600/10 text-sky-400 border-sky-500/20",
  reddit: "bg-orange-600/10 text-orange-400 border-orange-500/20",
  vimeo: "bg-cyan-600/10 text-cyan-400 border-cyan-500/20",
  dailymotion: "bg-blue-600/10 text-blue-400 border-blue-500/20",
  soundcloud: "bg-orange-600/10 text-orange-400 border-orange-500/20",
  twitch: "bg-violet-600/10 text-violet-400 border-violet-500/20",
  pinterest: "bg-red-600/10 text-red-400 border-red-500/20",
  unknown: "bg-indigo-600/10 text-indigo-400 border-indigo-500/20",
}

function getStatusBadge(status: DownloadItem["status"], progress: number) {
  switch (status) {
    case "idle":
      return { label: "Ready", variant: "default" as const }
    case "detecting":
      return { label: "Detecting...", variant: "warning" as const }
    case "ready":
      return { label: "Ready", variant: "default" as const }
    case "downloading":
      return { label: `Downloading ${progress}%`, variant: "primary" as const }
    case "completed":
      return { label: "Completed", variant: "success" as const }
    case "error":
      return { label: "Failed", variant: "destructive" as const }
  }
}

function getFormatDisplay(item: DownloadItem): string {
  const selectedFormat = item.formats.find((format) => format.url === item.selectedFormatUrl)
  if (selectedFormat?.isAudio || item.quality === "audio") return "MP3"
  return item.format.toUpperCase()
}

export function DownloadCard({
  item,
  onDownload,
  onRemove,
  onUpdateQuality,
  onUpdateFormat,
}: DownloadCardProps) {
  const statusBadge = getStatusBadge(item.status, item.progress)
  const platformColor = platformColors[item.platform] || platformColors.unknown
  const canChangeOptions = item.status === "ready" || item.status === "idle"
  const imageSrc = item.thumbnail || "/file.svg"
  const qualityOptions = Array.from(new Map(item.formats.map((format) => [format.quality, format])).values())
  const formatOptions = item.formats.filter((format) => format.quality === item.quality)
  const formatDisplay = getFormatDisplay(item)

  return (
    <Card className="hover-lift overflow-hidden transition-all hover:border-indigo-500/50">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:h-20 sm:w-32">
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            unoptimized
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 640px) 128px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <Badge variant="primary" className={cn("flex-shrink-0", platformColor)}>
              {item.platform.toUpperCase()}
            </Badge>
            {item.duration && <span className="flex-shrink-0 text-xs text-zinc-500">{item.duration}</span>}
          </div>

          <h3 className="mb-1 truncate text-sm font-medium text-white">{item.title}</h3>

          {item.author && <p className="mb-1 truncate text-xs text-zinc-400">{item.author}</p>}

          <p className="text-xs text-zinc-500">
            {item.quality} | {formatDisplay}
            {item.fileSize ? ` | ${item.fileSize}` : ""}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              aria-label="Quality"
              value={item.quality}
              onChange={(event) => onUpdateQuality(item.id, event.target.value as Quality)}
              disabled={!canChangeOptions}
              className="h-10 text-sm"
            >
              {qualityOptions.map((format) => (
                <SelectOption key={format.quality} value={format.quality}>
                  {format.label}
                </SelectOption>
              ))}
            </Select>

            <Select
              aria-label="Format"
              value={item.format}
              onChange={(event) => onUpdateFormat(item.id, event.target.value as Format)}
              disabled={!canChangeOptions || formatOptions.length <= 1}
              className="h-10 text-sm"
            >
              {(formatOptions.length ? formatOptions : item.formats).map((format) => (
                <SelectOption key={`${format.quality}-${format.format}-${format.url}`} value={format.format}>
                  {format.isAudio ? "MP3" : format.format.toUpperCase()}
                </SelectOption>
              ))}
            </Select>
          </div>

          {(item.status === "downloading" || item.status === "completed") && (
            <div className="mt-3">
              <Progress value={item.progress} max={100} />
            </div>
          )}

          {item.status === "error" && item.error && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{item.error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 items-start justify-between gap-2 sm:flex-col sm:items-end">
          <Badge variant={statusBadge.variant}>
            {item.status === "downloading" ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {statusBadge.label}
              </span>
            ) : item.status === "completed" ? (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                {statusBadge.label}
              </span>
            ) : (
              statusBadge.label
            )}
          </Badge>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDownload(item)}
              disabled={item.status === "downloading"}
              aria-label="Download"
            >
              {item.status === "downloading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)} aria-label="Remove">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
