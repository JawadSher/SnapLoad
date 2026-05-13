import type { Metadata } from "next"
import { StandaloneDownloader } from "@/components/downloader/StandaloneDownloader"

export const metadata: Metadata = {
  title: "Facebook Video Downloader — SnapLoad",
  description:
    "Download Facebook videos in HD quality. Save videos from pages, profiles, and groups. Free Facebook video downloader with no registration.",
  keywords: [
    "Facebook downloader",
    "download Facebook videos",
    "Facebook video saver",
    "save Facebook videos",
  ],
}

export default function FacebookDownloaderPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">
          Download Facebook Videos Free
        </h1>

        <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto text-lg">
          Download Facebook videos from pages, profiles, and groups in high quality. SnapLoad works 
          with public videos and supports multiple formats. Perfect for archiving, sharing, and 
          repurposing content from Facebook.
        </p>

        <div className="mb-8">
          <StandaloneDownloader />
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Facebook Download FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download videos from any Facebook page?</h3>
              <p className="text-zinc-400">
                We can download any publicly available Facebook video. Private videos from friends require special access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What quality options are available?</h3>
              <p className="text-zinc-400">
                Download in up to 1080p depending on the video source quality. We download in the original quality.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">How do I find a Facebook video link?</h3>
              <p className="text-zinc-400">
                Right-click the video, select &quot;Copy video URL&quot; or use the video share option to get the link.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download Facebook Watch videos?</h3>
              <p className="text-zinc-400">
                Yes, Facebook Watch videos can be downloaded if they are publicly available.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <p className="text-zinc-300">
            Download any public Facebook video. Paste the video URL and choose your preferred quality and format.
          </p>
        </div>
      </div>
    </div>
  )
}
