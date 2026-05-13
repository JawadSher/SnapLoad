import type { Metadata } from "next"
import { StandaloneDownloader } from "@/components/downloader/StandaloneDownloader"

export const metadata: Metadata = {
  title: "Free Music Downloader — SnapLoad",
  description:
    "Download music and audio from YouTube, SoundCloud, Spotify, and 1000+ sites. Convert videos to MP3, AAC, and other audio formats. Free music downloader.",
  keywords: [
    "music downloader",
    "download music",
    "audio downloader",
    "YouTube to MP3",
    "SoundCloud downloader",
    "convert video to audio",
  ],
}

export default function MusicDownloaderPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">
          Download Music & Audio From Any Site
        </h1>

        <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto text-lg">
          Extract high-quality audio from any video. Download music from YouTube, SoundCloud, Spotify, 
          TikTok, Instagram, and 1000+ other sites. Convert to MP3, AAC, FLAC, and more formats. 
          Perfect for music lovers and content creators.
        </p>

        <div className="mb-8">
          <StandaloneDownloader />
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Music Download FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download music from YouTube?</h3>
              <p className="text-zinc-400">
                Yes! Select &quot;Audio Only&quot; quality and &quot;MP3&quot; format to extract audio from any YouTube video.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What audio formats do you support?</h3>
              <p className="text-zinc-400">
                We support MP3, AAC, FLAC, WAV, OGG, and more. MP3 is the most compatible format.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I download from SoundCloud?</h3>
              <p className="text-zinc-400">
                Yes, SnapLoad supports SoundCloud tracks. Just paste the track link and download.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What about copyright music?</h3>
              <p className="text-zinc-400">
                Please respect copyright laws. Only download music you have permission to download.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What is the audio quality?</h3>
              <p className="text-zinc-400">
                Audio quality depends on the source. We extract at the highest available quality.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <p className="text-zinc-300">
            Extract audio from any video or download music directly. Use &quot;Audio Only&quot; quality for the best results.
          </p>
        </div>
      </div>
    </div>
  )
}
