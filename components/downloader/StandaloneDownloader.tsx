"use client"

import { Suspense } from "react"
import { URLInput } from "@/components/downloader/URLInput"
import { DownloadQueue } from "@/components/downloader/DownloadQueue"
import { useDownloader } from "@/hooks/useDownloader"

export function StandaloneDownloader() {
  const downloader = useDownloader()

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <URLInput downloader={downloader} />
      </Suspense>
      <DownloadQueue
        downloads={downloader.downloads}
        onDownload={(item) => void downloader.handleDownload(item)}
        onRemove={downloader.handleRemove}
        onClearAll={downloader.handleClearAll}
        onUpdateQuality={downloader.updateItemQuality}
        onUpdateFormat={downloader.updateItemFormat}
      />
    </div>
  )
}
