import type { Metadata } from "next"
import { StandaloneDownloader } from "@/components/downloader/StandaloneDownloader"

export const metadata: Metadata = {
  title: "TikTok Video Downloader — SnapLoad",
  description:
    "Download TikTok videos without watermark in high quality. Save TikToks as MP4 or extract audio as MP3. Free, fast, and works on all devices.",
  keywords: [
    "TikTok downloader",
    "download TikTok videos",
    "TikTok video saver",
    "remove TikTok watermark",
    "TikTok to MP4",
  ],
}

export default function TikTokDownloaderPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">
          Download TikTok Videos Without Watermark
        </h1>

        <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto text-lg">
          Remove TikTok watermarks and save videos in high quality. SnapLoad extracts the original 
          video from any TikTok link without the watermark. Perfect for content creators, archiving, 
          and repurposing content. Download as MP4, MP3, or other formats.
        </p>

        <div className="mb-8">
          <StandaloneDownloader />
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">TikTok Download FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Does SnapLoad remove the TikTok watermark?</h3>
              <p className="text-zinc-400">
                Yes! We download the video without the TikTok watermark, giving you clean, professional clips.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I extract audio from TikToks?</h3>
              <p className="text-zinc-400">
                Absolutely! Select &quot;Audio Only&quot; quality and &quot;MP3&quot; format to save just the audio track.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What about private TikTok videos?</h3>
              <p className="text-zinc-400">
                SnapLoad can only download videos that are publicly available on TikTok.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">How do I find a TikTok video URL?</h3>
              <p className="text-zinc-400">
                Open the TikTok app or website, tap the Share button, and copy the link. Then paste it here.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <p className="text-zinc-300">
            Paste any TikTok video link and download without watermark. Works with TikTok links, 
            short links, and profiles.
          </p>
        </div>
      </div>
    </div>
  )
}
