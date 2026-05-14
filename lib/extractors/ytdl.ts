import ytdl from "@distube/ytdl-core"
import type { ExtractionResult } from "./cobalt"

export interface VideoFormat {
  itag: number
  quality: string
  qualityLabel: string
  mimeType: string
  url: string
  contentLength: string
  fps?: number
  audioBitrate?: number
  hasVideo: boolean
  hasAudio: boolean
  container: string
}

export interface YoutubeMetadata {
  title: string
  thumbnail: string
  duration: string
  author: string
  viewCount: string
  formats: VideoFormat[]
}

function formatDuration(secondsText: string): string {
  const totalSeconds = Number(secondsText)
  if (!Number.isFinite(totalSeconds)) return ""
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds]
  return parts.map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0"))).join(":")
}

function qualityRank(label: string): number {
  const match = label.match(/\d+/)
  return match ? Number(match[0]) : 0
}

function normalizeQuality(label: string): string {
  const height = qualityRank(label)
  if (height >= 2160) return "4K"
  if (height >= 1080) return "1080p"
  if (height >= 720) return "720p"
  if (height >= 480) return "480p"
  return "360p"
}

function mapFormat(format: ytdl.videoFormat): VideoFormat {
  return {
    itag: format.itag,
    quality: format.quality,
    qualityLabel: format.qualityLabel,
    mimeType: format.mimeType ?? "",
    url: format.url,
    contentLength: format.contentLength ?? "",
    fps: format.fps,
    audioBitrate: format.audioBitrate,
    hasVideo: format.hasVideo,
    hasAudio: format.hasAudio,
    container: format.container,
  }
}

function pickBestPerQuality(formats: ytdl.videoFormat[]): ytdl.videoFormat[] {
  const seen = new Map<string, ytdl.videoFormat>()

  for (const format of formats) {
    const quality = normalizeQuality(format.qualityLabel)
    const existing = seen.get(quality)
    const currentBitrate = format.bitrate ?? format.averageBitrate ?? 0
    const existingBitrate = existing?.bitrate ?? existing?.averageBitrate ?? 0

    if (!existing || currentBitrate > existingBitrate) {
      seen.set(quality, format)
    }
  }

  return Array.from(seen.values()).sort((a, b) => qualityRank(b.qualityLabel) - qualityRank(a.qualityLabel))
}

function messageFromError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Extraction failed"
  if (/private|unavailable/i.test(message)) return "This video is unavailable or private"
  if (/sign in|login|confirm your age/i.test(message)) return "This video requires login to access"
  if (/network|fetch failed|ECONN|ETIMEDOUT/i.test(message)) return "Connection failed. Check your internet"
  return message
}

export async function extractYouTube(url: string): Promise<ExtractionResult> {
  try {
    const info = await ytdl.getInfo(url)
    const details = info.videoDetails
    const thumbnails = details.thumbnails ?? []
    const thumbnail = thumbnails[thumbnails.length - 1]?.url ?? ""
    const videoFormats = pickBestPerQuality(ytdl.filterFormats(info.formats, "videoandaudio"))
    const audioFormats = ytdl
      .filterFormats(info.formats, "audioonly")
      .sort((a, b) => (b.audioBitrate ?? 0) - (a.audioBitrate ?? 0))
    const bestAudio = audioFormats[0]

    const formats = videoFormats.map((format) => {
      const mapped = mapFormat(format)
      const quality = normalizeQuality(mapped.qualityLabel)
      return {
        url: mapped.url,
        quality,
        format: mapped.container,
        isAudio: false,
        fileSize: mapped.contentLength,
        label: `${quality} ${mapped.container.toUpperCase()}`,
      }
    })

    if (bestAudio) {
      const mappedAudio = mapFormat(bestAudio)
      formats.push({
        url: mappedAudio.url,
        quality: "audio",
        format: "mp3",
        isAudio: true,
        fileSize: mappedAudio.contentLength,
        label: "Audio Only (MP3)",
      })
    }

    return {
      success: true,
      title: details.title,
      thumbnail,
      duration: formatDuration(details.lengthSeconds),
      platform: "youtube",
      formats,
    }
  } catch (error) {
    console.error("YouTube extraction failed:", error)
    return {
      success: false,
      platform: "youtube",
      formats: [],
      error: messageFromError(error),
    }
  }
}
