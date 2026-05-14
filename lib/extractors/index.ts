import { extractWithCobalt, type ExtractionResult } from "./cobalt"
import { extractYouTube } from "./ytdl"
import { extractWithYtDlp } from "./ytdlp"
import { detectPlatform, isValidURL } from "../platformDetector"

function normalizeErrorMessage(message: string | undefined): string {
  const text = message ?? "Extraction failed"
  if (/private|unavailable/i.test(text)) return "This video is unavailable or private"
  if (/no playable formats|playable formats|no downloadable formats/i.test(text)) return "No downloadable formats found"
  if (/cobalt requires authentication/i.test(text)) return "Cobalt requires authentication for this request"
  if (/yt-dlp is not installed/i.test(text)) return "yt-dlp is not installed on this server"
  if (/sign in|login/i.test(text)) return "This video requires login to access"
  if (/network|fetch failed|ECONN|ETIMEDOUT/i.test(text)) return "Connection failed. Check your internet"
  if (/unsupported|not supported/i.test(text)) return "This platform is not supported yet"
  if (/too many|rate/i.test(text)) return "Too many requests. Please wait a moment"
  if (/temporarily unavailable|service/i.test(text)) return "Service temporarily unavailable"
  return text
}

export async function extractMediaInfo(
  url: string,
  options?: {
    quality?: string
    audioOnly?: boolean
    format?: string
  }
): Promise<ExtractionResult> {
  try {
    if (!isValidURL(url)) {
      return {
        success: false,
        platform: "unknown",
        formats: [],
        error: "Please enter a valid video URL",
      }
    }

    const detected = detectPlatform(url)

    if (!detected.isSupported) {
      return {
        success: false,
        platform: detected.platform,
        formats: [],
        error: "This platform is not supported yet",
      }
    }

    if (detected.platform === "youtube") {
      const ytdlResult = await extractYouTube(url)
      if (ytdlResult.success) return { ...ytdlResult, platform: detected.platform }

      const ytdlpResult = await extractWithYtDlp(url)
      if (ytdlpResult.success) return { ...ytdlpResult, platform: detected.platform }

      const cobaltResult = await extractWithCobalt(url, options)
      if (cobaltResult.success) return { ...cobaltResult, platform: detected.platform }
      const fallbackError = /auth/i.test(cobaltResult.error ?? "")
        ? ytdlpResult.error || cobaltResult.error
        : /playable formats/i.test(ytdlResult.error ?? "")
          ? cobaltResult.error || ytdlpResult.error || ytdlResult.error
          : ytdlResult.error || ytdlpResult.error || cobaltResult.error

      return {
        success: false,
        platform: detected.platform,
        formats: [],
        error: normalizeErrorMessage(fallbackError),
      }
    }

    const cobaltResult = await extractWithCobalt(url, options)
    if (cobaltResult.success) return { ...cobaltResult, platform: detected.platform }

    return {
      success: false,
      platform: detected.platform,
      formats: [],
      error: normalizeErrorMessage(cobaltResult.error),
    }
  } catch (error) {
    console.error("Media extraction failed:", error)
    return {
      success: false,
      platform: detectPlatform(url).platform,
      formats: [],
      error: "Extraction failed",
    }
  }
}

export type { ExtractionResult, ExtractedMedia } from "./cobalt"
