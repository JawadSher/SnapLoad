"use client"

import { DownloadItem } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DownloadCloud } from "lucide-react"
import { DownloadCard } from "./DownloadCard"

interface DownloadQueueProps {
  items: DownloadItem[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function DownloadQueue({ items, onRemove, onClearAll }: DownloadQueueProps) {
  const isEmpty = items.length === 0

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white">Download Queue</h2>
          <Badge variant="default">{items.length}</Badge>
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
          {items.map((item) => (
            <DownloadCard key={item.id} item={item} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
