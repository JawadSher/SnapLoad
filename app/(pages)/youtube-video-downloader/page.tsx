import type { Metadata } from "next"
import { StandaloneDownloader } from "@/components/downloader/StandaloneDownloader"

export const metadata: Metadata = {
  title: "YouTube Video Downloader — SnapLoad",
  description:
    "Download YouTube videos in high quality (up to 4K) with SnapLoad. Free, fast, and no registration required. Works with playlists, shorts, and all video types.",
  keywords: [
    "YouTube downloader",
    "download YouTube videos",
    "YouTube to MP4",
    "YouTube video saver",
  ],
}

export default function YouTubeDownloaderPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">
          Download YouTube Videos Free
        </h1>

        {/* Description */}
        <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto text-lg">
          SnapLoad makes it easy to download YouTube videos in the highest quality available. 
          Choose from 4K, 1080p, 720p, and more formats. Perfect for offline viewing, archiving, 
          and sharing content. No registration, completely free.
        </p>

        {/* URL Input */}
        <div className="mb-8">
          <StandaloneDownloader />
        </div>

        {/* FAQ Section */}
        <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">YouTube Download FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download YouTube Shorts?</h3>
              <p className="text-zinc-400">
                Yes! SnapLoad supports YouTube Shorts, long-form videos, livestreams, and everything in between.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Is downloading YouTube videos legal?</h3>
              <p className="text-zinc-400">
                Please respect copyright laws and only download content you have permission to download.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What is the maximum quality available?</h3>
              <p className="text-zinc-400">
                We can download up to 4K (2160p) depending on what the video uploader has made available.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download playlists?</h3>
              <p className="text-zinc-400">
                Use our Bulk Download feature to download multiple videos at once by pasting multiple URLs.
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <p className="text-zinc-300">
            Paste any YouTube video URL above and click &quot;Detect &amp; Fetch&quot; to get started. 
            Download in any quality and format you prefer.
          </p>
        </div>
      </div>
    </div>
  )
}
