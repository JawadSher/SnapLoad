import { detectPlatform } from "@/lib/platformDetector"
import type { Format, Quality } from "@/types"

interface CobaltRequest {
  url: string
  videoQuality: "144" | "240" | "360" | "480" | "720" | "1080" | "1440" | "2160" | "4320" | "max"
  audioFormat: "best" | "mp3" | "ogg" | "wav" | "opus"
  downloadMode: "auto" | "audio" | "mute"
  disableMetadata: boolean
  convertGif: boolean
  tiktokFullAudio: boolean
  youtubeVideoContainer: "auto" | "mp4" | "webm" | "mkv"
}

interface CobaltResponse {
  status: "stream" | "redirect" | "tunnel" | "local-processing" | "picker" | "error"
  url?: string
  urls?: string[]
  text?: string
  filename?: string
  tunnel?: string[]
  audio?: string
  audioFilename?: string
  error?: {
    code?: string
    context?: {
      service?: string
      limit?: number
    }
  }
  output?: {
    filename?: string
    type?: string
    metadata?: {
      title?: string
    }
  }
  picker?: Array<{
    type: string
    url: string
    thumb?: string
  }>
}

export interface ExtractedMedia {
  url: string
  quality: string
  format: string
  isAudio: boolean
  fileSize?: string
  label?: string
}

export interface ExtractionResult {
  success: boolean
  title?: string
  thumbnail?: string
  duration?: string
  platform: string
  formats: ExtractedMedia[]
  error?: string
}

const QUALITY_MAP: Record<string, CobaltRequest["videoQuality"]> = {
  "4K": "2160",
  "1080p": "1080",
  "720p": "720",
  "480p": "480",
  "360p": "360",
  audio: "max",
}

function formatFromUrl(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname
    const extension = pathname.split(".").pop()?.toLowerCase()
    return extension && extension.length <= 5 ? extension : fallback
  } catch {
    return fallback
  }
}

function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Service temporarily unavailable"
}

function messageFromCobaltCode(code: string | undefined, fallback = "Service temporarily unavailable"): string {
  if (!code) return fallback
  if (/auth|token|turnstile/i.test(code)) return "Cobalt requires authentication for this request"
  if (/rate|limit/i.test(code)) return "Too many requests. Please wait a moment"
  if (/youtube|blocked|unavailable|fetch/i.test(code)) return "This video is unavailable or blocked by the upstream service"
  if (/unsupported|service\.unsupported/i.test(code)) return "This platform is not supported yet"
  if (/picker\.empty|no.*format|empty/i.test(code)) return "No downloadable formats found"
  return code.replace(/^error\./, "").replace(/[._-]+/g, " ")
}

async function readCobaltError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as Partial<CobaltResponse>
    const message = data.text || messageFromCobaltCode(data.error?.code, "")
    if (message) return message
  } catch {
    // Fall back to the HTTP status below when the response is not JSON.
  }

  if (response.status === 401 || response.status === 403) return "Cobalt requires authentication for this request"
  if (response.status === 404) return "This platform is not supported yet"
  if (response.status >= 500) return "Service temporarily unavailable"
  return `Cobalt rejected the request (${response.status})`
}

export async function extractWithCobalt(
  url: string,
  options?: {
    quality?: string
    audioOnly?: boolean
    format?: string
  }
): Promise<ExtractionResult> {
  try {
    const platform = detectPlatform(url)
    const audioOnly = options?.audioOnly === true || options?.quality === "audio"
    const quality = options?.quality ?? "1080p"
    const apiUrl = process.env.COBALT_API_URL || "https://api.cobalt.tools/"
    const apiKey = process.env.COBALT_API_KEY
    const requestBody: CobaltRequest = {
      url,
      videoQuality: QUALITY_MAP[quality] ?? "1080",
      audioFormat: audioOnly ? ((options?.format as CobaltRequest["audioFormat"] | undefined) ?? "mp3") : "best",
      downloadMode: audioOnly ? "audio" : "auto",
      disableMetadata: false,
      convertGif: true,
      tiktokFullAudio: true,
      youtubeVideoContainer: "mp4",
    }
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (apiKey) {
      requestHeaders.Authorization = `Api-Key ${apiKey}`
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      cache: "no-store",
    })

    if (response.status === 429) {
      throw new Error("Too many requests. Please wait a moment")
    }

    if (!response.ok) {
      throw new Error(await readCobaltError(response))
    }

    const data = (await response.json()) as CobaltResponse

    if (data.status === "error") {
      throw new Error(data.text || messageFromCobaltCode(data.error?.code))
    }

    if ((data.status === "stream" || data.status === "redirect" || data.status === "tunnel") && data.url) {
      const format = audioOnly ? options?.format ?? "mp3" : formatFromUrl(data.url, "mp4")
      return {
        success: true,
        title: data.filename ?? "",
        thumbnail: "",
        duration: "",
        platform: platform.platform,
        formats: [
          {
            url: data.url,
            quality: audioOnly ? "audio" : quality,
            format,
            isAudio: audioOnly,
            label: audioOnly ? "Audio Only" : quality,
          },
        ],
      }
    }

    if (data.status === "local-processing" && data.tunnel?.length) {
      const outputFormat = data.output?.type?.split("/").pop() ?? "mp4"
      return {
        success: true,
        title: data.output?.metadata?.title ?? data.output?.filename ?? "",
        thumbnail: "",
        duration: "",
        platform: platform.platform,
        formats: data.tunnel.map((directUrl, index) => ({
          url: directUrl,
          quality: audioOnly ? "audio" : quality,
          format: audioOnly ? options?.format ?? "mp3" : formatFromUrl(data.output?.filename ?? "", outputFormat),
          isAudio: audioOnly,
          label: `${audioOnly ? "Audio" : "Video"} ${index + 1}`,
        })),
      }
    }

    if (data.status === "picker" && data.picker?.length) {
      return {
        success: true,
        title: "",
        thumbnail: data.picker.find((item) => item.thumb)?.thumb ?? "",
        duration: "",
        platform: platform.platform,
        formats: data.picker
          .filter((item) => item.url)
          .map((item, index) => {
            const isAudio = item.type.toLowerCase().includes("audio")
            const pickedQuality = isAudio ? "audio" : quality
            const pickedFormat = isAudio ? "mp3" : formatFromUrl(item.url, "mp4")
            return {
              url: item.url,
              quality: pickedQuality,
              format: pickedFormat,
              isAudio,
              label: `${isAudio ? "Audio" : "Video"} ${index + 1}`,
            }
          }),
      }
    }

    if (data.audio) {
      return {
        success: true,
        title: data.audioFilename ?? "",
        thumbnail: "",
        duration: "",
        platform: platform.platform,
        formats: [
          {
            url: data.audio,
            quality: "audio",
            format: options?.format ?? "mp3",
            isAudio: true,
            label: "Audio Only",
          },
        ],
      }
    }

    if (data.urls?.length) {
      return {
        success: true,
        title: "",
        thumbnail: "",
        duration: "",
        platform: platform.platform,
        formats: data.urls.map((directUrl, index) => ({
          url: directUrl,
          quality: audioOnly ? "audio" : quality,
          format: audioOnly ? options?.format ?? "mp3" : formatFromUrl(directUrl, "mp4"),
          isAudio: audioOnly,
          label: `${audioOnly ? "Audio" : "Video"} ${index + 1}`,
        })),
      }
    }

    throw new Error("Platform not supported yet")
  } catch (error) {
    console.error("Cobalt extraction failed:", error)
    return {
      success: false,
      platform: detectPlatform(url).platform,
      formats: [],
      error: messageFromError(error),
    }
  }
}

export function toQuality(value: string): Quality {
  return value === "4K" || value === "1080p" || value === "720p" || value === "480p" || value === "360p" || value === "audio" ? value : "1080p"
}

export function toFormat(value: string): Format {
  return value === "mp4" || value === "mp3" || value === "webm" || value === "aac" || value === "mkv" ? value : "mp4"
}
