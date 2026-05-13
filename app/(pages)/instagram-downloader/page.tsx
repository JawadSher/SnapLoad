import type { Metadata } from "next"
import { StandaloneDownloader } from "@/components/downloader/StandaloneDownloader"

export const metadata: Metadata = {
  title: "Instagram Video Downloader — SnapLoad",
  description:
    "Download Instagram videos and Reels in HD quality. Save Instagram posts, stories, and IGTV content. Works with posts, Reels, and carousel videos.",
  keywords: [
    "Instagram downloader",
    "download Instagram videos",
    "Instagram Reels downloader",
    "save Instagram stories",
    "Instagram video saver",
  ],
}

export default function InstagramDownloaderPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">
          Download Instagram Videos & Reels
        </h1>

        <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto text-lg">
          Download Instagram Reels, videos, and carousel posts in high quality. SnapLoad supports 
          all Instagram content types including IGTV, Stories, and regular posts. No registration 
          needed, completely free and easy to use.
        </p>

        <div className="mb-8">
          <StandaloneDownloader />
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Instagram Download FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download Instagram Reels?</h3>
              <p className="text-zinc-400">
                Yes! Download Instagram Reels in full quality. Just paste the Reel link and we will get it for you.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What about carousel videos?</h3>
              <p className="text-zinc-400">
                We support carousel posts with multiple videos. Download individual items or all at once.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download private Instagram videos?</h3>
              <p className="text-zinc-400">
                Only public videos can be downloaded. Private accounts are not accessible.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">How do I get an Instagram video link?</h3>
              <p className="text-zinc-400">
                Open Instagram, find the video, tap the three dots, and select &quot;Copy link&quot;. Then paste it here.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <p className="text-zinc-300">
            Download Instagram Reels, videos, and carousel posts easily. Paste any Instagram URL to get started.
          </p>
        </div>
      </div>
    </div>
  )
}
