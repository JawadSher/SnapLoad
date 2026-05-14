import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { ExtractionResult } from "./cobalt"

const execFileAsync = promisify(execFile)

interface YtDlpFormat {
  format_id?: string
  url?: string
  ext?: string
  filesize?: number
  filesize_approx?: number
  height?: number
  vcodec?: string
  acodec?: string
  abr?: number
  tbr?: number
  protocol?: string
}

interface YtDlpInfo {
  title?: string
  thumbnail?: string
  duration?: number
  formats?: YtDlpFormat[]
}

function formatDuration(seconds: number | undefined): string {
  if (!Number.isFinite(seconds)) return ""
  const totalSeconds = Math.max(0, Math.floor(seconds ?? 0))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60
  const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds]
  return parts.map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0"))).join(":")
}

function qualityFromHeight(height: number | undefined): string {
  if (!height) return "360p"
  if (height >= 2160) return "4K"
  if (height >= 1080) return "1080p"
  if (height >= 720) return "720p"
  if (height >= 480) return "480p"
  return "360p"
}

function sizeFromFormat(format: YtDlpFormat): string | undefined {
  const size = format.filesize ?? format.filesize_approx
  return size ? String(size) : undefined
}

function formatRank(format: YtDlpFormat): number {
  return format.height ?? format.abr ?? format.tbr ?? 0
}

function supportsDirectDownload(format: YtDlpFormat): boolean {
  if (!format.url) return false
  if (format.protocol && !/^https?$/i.test(format.protocol)) return false
  return true
}

function messageFromError(error: unknown): string {
  const message = error instanceof Error ? error.message : "yt-dlp extraction failed"
  if (/ENOENT|not recognized|cannot find/i.test(message)) return "yt-dlp is not installed on this server"
  if (/private|unavailable/i.test(message)) return "This video is unavailable or private"
  if (/sign in|login|cookies/i.test(message)) return "This video requires login or cookies to access"
  if (/network|timed out|ECONN|ETIMEDOUT/i.test(message)) return "Connection failed. Check your internet"
  return message
}

export async function extractWithYtDlp(url: string): Promise<ExtractionResult> {
  const command = process.env.YTDLP_PATH || "yt-dlp"

  try {
    const { stdout } = await execFileAsync(command, ["--dump-json", "--no-playlist", "--no-warnings", url], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20,
      timeout: 30000,
      windowsHide: true,
    })
    const info = JSON.parse(stdout) as YtDlpInfo
    const formats = info.formats ?? []
    const progressive = formats
      .filter((format) => supportsDirectDownload(format) && format.vcodec !== "none" && format.acodec !== "none")
      .sort((a, b) => formatRank(b) - formatRank(a))
    const audioOnly = formats
      .filter((format) => supportsDirectDownload(format) && format.acodec !== "none" && format.vcodec === "none")
      .sort((a, b) => formatRank(b) - formatRank(a))

    const seenQualities = new Set<string>()
    const extractedFormats = progressive
      .map((format) => {
        const quality = qualityFromHeight(format.height)
        if (seenQualities.has(quality)) return null
        seenQualities.add(quality)
        const outputFormat = format.ext ?? "mp4"
        return {
          url: format.url ?? "",
          quality,
          format: outputFormat,
          isAudio: false,
          fileSize: sizeFromFormat(format),
          label: `${quality} ${outputFormat.toUpperCase()}`,
        }
      })
      .filter((format) => format !== null)

    const bestAudio = audioOnly[0]
    if (bestAudio?.url) {
      extractedFormats.push({
        url: bestAudio.url,
        quality: "audio",
        format: bestAudio.ext ?? "mp3",
        isAudio: true,
        fileSize: sizeFromFormat(bestAudio),
        label: `Audio Only (${(bestAudio.ext ?? "mp3").toUpperCase()})`,
      })
    }

    if (!extractedFormats.length) {
      return {
        success: false,
        platform: "youtube",
        formats: [],
        error: "No downloadable formats found",
      }
    }

    return {
      success: true,
      title: info.title ?? "",
      thumbnail: info.thumbnail ?? "",
      duration: formatDuration(info.duration),
      platform: "youtube",
      formats: extractedFormats,
    }
  } catch (error) {
    console.error("yt-dlp extraction failed:", error)
    return {
      success: false,
      platform: "youtube",
      formats: [],
      error: messageFromError(error),
    }
  }
}
