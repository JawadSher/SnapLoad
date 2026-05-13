"use client"

import { DownloadItem } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Download, X, Check, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DownloadCardProps {
  item: DownloadItem
  onRemove: (id: string) => void
}

const platformColors: Record<string, string> = {
  youtube: "bg-red-600/10 text-red-400 border-red-500/20",
  tiktok: "bg-black/10 text-white border-zinc-700",
  instagram: "bg-pink-600/10 text-pink-400 border-pink-500/20",
  facebook: "bg-blue-600/10 text-blue-400 border-blue-500/20",
  twitter: "bg-sky-600/10 text-sky-400 border-sky-500/20",
  reddit: "bg-orange-600/10 text-orange-400 border-orange-500/20",
  vimeo: "bg-cyan-600/10 text-cyan-400 border-cyan-500/20",
  soundcloud: "bg-orange-600/10 text-orange-400 border-orange-500/20",
}

function getStatusBadge(status: DownloadItem["status"], progress: number) {
  switch (status) {
    case "idle":
      return { label: "Ready", variant: "default" as const }
    case "detecting":
      return { label: "Detecting...", variant: "warning" as const }
    case "ready":
      return { label: "Ready to Download", variant: "default" as const }
    case "downloading":
      return { label: `Downloading ${progress}%`, variant: "primary" as const }
    case "completed":
      return { label: "Completed ✓", variant: "success" as const }
    case "error":
      return { label: "Failed ✕", variant: "destructive" as const }
    default:
      return { label: "Unknown", variant: "default" as const }
  }
}

export function DownloadCard({ item, onRemove }: DownloadCardProps) {
  const statusBadge = getStatusBadge(item.status, item.progress)
  const platformColor = platformColors[item.platform] || platformColors.youtube

  return (
    <Card className="hover-lift overflow-hidden transition-all hover:border-indigo-500/50">
      <div className="flex gap-4 p-4">
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <Badge variant="primary" className={cn("flex-shrink-0", platformColor)}>
              {item.platform.toUpperCase()}
            </Badge>
            <span className="flex-shrink-0 text-xs text-zinc-500">{item.duration}</span>
          </div>

          <h3 className="mb-1 truncate text-sm font-medium text-white">{item.title}</h3>

          <p className="text-xs text-zinc-500">
            {item.quality} • {item.format.toUpperCase()} • {item.fileSize}
          </p>

          {item.status === "downloading" && (
            <div className="mt-2">
              <Progress value={item.progress} max={100} />
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <Badge variant={statusBadge.variant}>
            {statusBadge.label === "Detecting..." ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {statusBadge.label}
              </span>
            ) : (
              statusBadge.label
            )}
          </Badge>

          <div className="flex gap-2">
            {item.status === "completed" ? (
              <Button size="icon" variant="ghost" disabled>
                <Check className="h-4 w-4 text-green-500" />
              </Button>
            ) : item.status === "error" ? (
              <Button size="icon" variant="ghost" disabled>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </Button>
            ) : (
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
