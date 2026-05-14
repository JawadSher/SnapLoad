"use client"

import { DownloadItem, Format, Quality } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DownloadCloud } from "lucide-react"
import { DownloadCard } from "./DownloadCard"

interface DownloadQueueProps {
  downloads: DownloadItem[]
  onDownload: (item: DownloadItem) => void
  onRemove: (id: string) => void
  onClearAll: () => void
  onUpdateQuality: (id: string, quality: Quality) => void
  onUpdateFormat: (id: string, format: Format) => void
}

export function DownloadQueue({
  downloads,
  onDownload,
  onRemove,
  onClearAll,
  onUpdateQuality,
  onUpdateFormat,
}: DownloadQueueProps) {
  const isEmpty = downloads.length === 0

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white">Download Queue</h2>
          <Badge variant="default">{downloads.length}</Badge>
        </div>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {isEmpty ? (
        <Card className="hover-lift flex flex-col items-center justify-center px-4 py-12">
          <DownloadCloud className="mb-4 h-12 w-12 text-zinc-700" />
          <p className="mb-2 text-lg font-medium text-white">No downloads yet</p>
          <p className="text-center text-zinc-500">Paste a URL above to get started</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {downloads.map((item) => (
            <DownloadCard
              key={item.id}
              item={item}
              onDownload={onDownload}
              onRemove={onRemove}
              onUpdateQuality={onUpdateQuality}
              onUpdateFormat={onUpdateFormat}
            />
          ))}
        </div>
      )}
    </div>
  )
}
