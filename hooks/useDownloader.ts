"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { detectPlatform, type DetectedPlatform, isValidURL } from "@/lib/platformDetector"
import type { DownloadItem, ExtractedFormat, Format, Platform, Quality } from "@/types"

const DEFAULT_API_URL = "https://snapload-api-fzy3.onrender.com"
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "")
const API_KEY = (process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_SNAPLOAD_API_KEY || "")
  .trim()
  .replace(/^['"]|['"]$/g, "")
const COLD_START_MESSAGE_DELAY_MS = 3000
const EXTRACT_TIMEOUT_MS = 75000

interface ExtractApiFormat {
  quality?: string
  format?: string
  ext?: string
  url: string
  fileSize?: string
  fileSizeBytes?: number | null
  isAudio?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
  type?: string
  protocol?: string
  vcodec?: string
  acodec?: string
  resolution?: string
  label?: string
}

interface ExtractApiSuccessBody {
  success: true
  platform: string
  title: string
  thumbnail: string
  duration?: string
  durationSeconds?: number
  uploader?: string
  channel?: string
  webpageUrl?: string
  originalUrl?: string
  formats: ExtractApiFormat[]
}

interface ExtractApiErrorBody {
  success: false
  error?: string
  type?: string
}

type ExtractApiBody = ExtractApiSuccessBody | ExtractApiErrorBody

interface WritableFileTarget {
  write: (data: BufferSource | Blob | string) => Promise<void>
  close: () => Promise<void>
  abort?: () => Promise<void>
}

interface SaveFileHandle {
  createWritable: () => Promise<WritableFileTarget>
}

type WindowWithFilePicker = Window & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string
    types?: Array<{
      description: string
      accept: Record<string, string[]>
    }>
  }) => Promise<SaveFileHandle>
}

export interface UseDownloaderReturn {
  url: string
  setUrl: (url: string) => void
  bulkUrls: string
  setBulkUrls: (urls: string) => void
  downloads: DownloadItem[]
  isExtracting: boolean
  loadingMessage: string | null
  detectedPlatform: DetectedPlatform | null
  error: string | null
  handleExtract: () => Promise<void>
  handleBulkExtract: () => Promise<void>
  handleDownload: (item: DownloadItem) => Promise<void>
  handleRemove: (id: string) => void
  handleClearAll: () => void
  updateItemQuality: (id: string, quality: Quality) => void
  updateItemFormat: (id: string, format: Format) => void
}

function normalizeError(message: string | undefined): string {
  const text = message ?? ""
  if (/invalid url/i.test(text)) return "Please enter a valid video URL"
  if (/timeout|timed out|abort|408|504/i.test(text)) return "Request timed out. Please try again"
  if (/private|unavailable|not available|removed|deleted|404/i.test(text)) return "This video is unavailable or private"
  if (/sign in|login|auth|api key|token|bearer|cookie|credential|unauthorized|forbidden|401|403/i.test(text)) {
    return "This video requires login to access"
  }
  if (/network|fetch failed|failed to fetch|connection|cors|offline/i.test(text)) return "Connection failed. Check your internet"
  if (/unsupported|not supported/i.test(text)) return "This platform is not supported yet"
  if (/no downloadable/i.test(text)) return "No downloadable video or audio formats were found"
  return "Something went wrong. Please try again"
}

function getApiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (API_KEY) {
    headers["x-api-key"] = API_KEY
    headers.Authorization = `Bearer ${API_KEY}`
  }

  return headers
}

async function parseExtractResponse(response: Response): Promise<ExtractApiBody> {
  return (await response.json().catch(() => ({ success: false, error: "Extraction failed" }))) as ExtractApiBody
}

function getExtractError(body: ExtractApiBody, response: Response): Error {
  if (body.success) return new Error(`Request failed with status ${response.status}`)
  const details = [body.error, body.type, String(response.status)].filter(Boolean).join(" ")
  return new Error(details || `Request failed with status ${response.status}`)
}

function bytesToSize(value: number | string | null | undefined): string | undefined {
  if (value === null || value === undefined || value === "") return undefined
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) return String(value)
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function secondsToDuration(seconds: number | undefined): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return ""
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const paddedSeconds = String(remainingSeconds).padStart(2, "0")

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}

function sanitizeFilename(title: string, format: Format): string {
  const fallback = "snapload-video"
  const extension = format.trim().toLowerCase() || "mp4"
  const clean = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120)
  return `${clean || fallback}.${extension}`
}

function getMimeType(format: Format): string {
  switch (format.toLowerCase()) {
    case "mp4":
      return "video/mp4"
    case "webm":
      return "video/webm"
    case "mkv":
      return "video/x-matroska"
    case "mp3":
      return "audio/mpeg"
    case "m4a":
      return "audio/mp4"
    case "aac":
      return "audio/aac"
    case "opus":
      return "audio/opus"
    default:
      return "application/octet-stream"
  }
}

async function pickSaveFile(filename: string, format: Format): Promise<SaveFileHandle | null> {
  const picker = (window as WindowWithFilePicker).showSaveFilePicker
  if (!picker) return null

  return picker({
    suggestedName: filename,
    types: [
      {
        description: "Media file",
        accept: {
          [getMimeType(format)]: [`.${format.toLowerCase()}`],
        },
      },
    ],
  })
}

function getDownloadErrorMessage(response: Response, fallback: string): Promise<string> {
  return response.text().then((text) => {
    try {
      const body = JSON.parse(text) as { error?: string }
      return body.error || fallback
    } catch {
      return text || fallback
    }
  })
}

function saveBlob(filename: string, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

function normalizeFormats(formats: ExtractApiFormat[]): ExtractedFormat[] {
  return formats.flatMap((format): ExtractedFormat[] => {
    const url = format.url.trim()
    if (!url) return []

    const extension = (format.ext || format.format || "").toLowerCase()
    const isAudio = Boolean(format.isAudio || (format.hasAudio && !format.hasVideo))
    const hasMedia =
      isAudio ||
      format.hasVideo ||
      format.hasAudio ||
      ["mp4", "webm", "m4a", "mp3", "aac", "opus", "ogg", "mkv", "mov"].includes(extension)

    if (!hasMedia) return []
    if (extension === "mhtml" || format.protocol === "mhtml" || format.type === "unknown") return []
    if (format.vcodec === "none" && format.acodec === "none") return []

    const quality = (isAudio ? "audio" : format.quality || format.resolution || format.label || "video") as Quality
    const normalizedFormat = (isAudio ? extension || "mp3" : extension || format.format || "mp4").toLowerCase() as Format
    const label = isAudio ? `${normalizedFormat.toUpperCase()} Audio` : format.label || `${quality} ${normalizedFormat.toUpperCase()}`

    return [{
      quality,
      format: normalizedFormat,
      url,
      fileSize: bytesToSize(format.fileSizeBytes ?? format.fileSize),
      isAudio,
      label,
    }]
  }).sort((a, b) => {
    if (a.isAudio !== b.isAudio) return a.isAudio ? 1 : -1
    return Number.parseInt(b.quality, 10) - Number.parseInt(a.quality, 10)
  })
}

function isPlatform(value: string): value is Platform {
  return [
    "youtube",
    "tiktok",
    "instagram",
    "facebook",
    "twitter",
    "reddit",
    "vimeo",
    "dailymotion",
    "soundcloud",
    "twitch",
    "pinterest",
    "unknown",
  ].includes(value)
}

export function useDownloader(): UseDownloaderReturn {
  const [url, setUrl] = useState("")
  const [bulkUrls, setBulkUrls] = useState("")
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalsRef = useRef<number[]>([])
  const timeoutsRef = useRef<number[]>([])
  const abortControllersRef = useRef<AbortController[]>([])

  const clearTrackedTimeout = useCallback((timeout: number) => {
    window.clearTimeout(timeout)
    timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeout)
  }, [])

  const trackTimeout = useCallback((handler: () => void, delay: number): number => {
    const timeout = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeout)
      handler()
    }, delay)
    timeoutsRef.current.push(timeout)
    return timeout
  }, [])

  const fetchWithTimeout = useCallback(
    async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> => {
      const controller = new AbortController()
      abortControllersRef.current.push(controller)
      const timeout = trackTimeout(() => controller.abort("timeout"), timeoutMs)

      try {
        return await fetch(input, {
          ...init,
          signal: controller.signal,
        })
      } finally {
        clearTrackedTimeout(timeout)
        abortControllersRef.current = abortControllersRef.current.filter((item) => item !== controller)
      }
    },
    [clearTrackedTimeout, trackTimeout]
  )

  const extractSingleUrl = useCallback(async (targetUrl: string): Promise<boolean> => {
    const trimmedUrl = targetUrl.trim()
    if (!trimmedUrl) {
      setError("Please enter a valid video URL")
      return false
    }

    if (!isValidURL(trimmedUrl)) {
      setError("Please enter a valid video URL")
      return false
    }

    try {
      let response = await fetchWithTimeout(`${API_BASE_URL}/api/extract`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ url: trimmedUrl }),
      }, EXTRACT_TIMEOUT_MS)

      let body = await parseExtractResponse(response)

      if (!response.ok && response.status !== 401 && response.status !== 403) {
        response = await fetchWithTimeout(
          `${API_BASE_URL}/api/info?url=${encodeURIComponent(trimmedUrl)}`,
          {
            method: "GET",
            headers: getApiHeaders(),
          },
          EXTRACT_TIMEOUT_MS
        )
        body = await parseExtractResponse(response)
      }

      if (!response.ok) {
        throw getExtractError(body, response)
      }

      if (!body.success) {
        throw new Error(body.error || "Extraction failed")
      }

      const formats = normalizeFormats(body.formats)

      if (!formats.length) {
        throw new Error("No downloadable video or audio formats were returned by the API")
      }

      const firstFormat = formats.find((format) => !format.isAudio) ?? formats[0]
      const detected = detectPlatform(trimmedUrl)
      const platform = isPlatform(body.platform) ? body.platform : detected.platform
      const item: DownloadItem = {
        id: `download-${Date.now()}-${crypto.randomUUID()}`,
        url: trimmedUrl,
        platform,
        title: body.title || `${detected.name} video`,
        thumbnail: body.thumbnail || "",
        duration: body.duration || secondsToDuration(body.durationSeconds),
        author: body.uploader || body.channel,
        quality: firstFormat.quality,
        format: firstFormat.format,
        status: "ready",
        progress: 0,
        fileSize: firstFormat.fileSize,
        formats,
        selectedFormatUrl: firstFormat.url,
        addedAt: new Date(),
      }

      setDownloads((current) => [item, ...current])
      setError(null)
      return true
    } catch (extractError) {
      setError(normalizeError(extractError instanceof Error ? extractError.message : "Extraction failed"))
      return false
    }
  }, [fetchWithTimeout])

  const handleExtract = useCallback(async () => {
    setIsExtracting(true)
    setLoadingMessage(null)
    const coldStartTimeout = trackTimeout(() => setLoadingMessage("Server is waking up, please wait..."), COLD_START_MESSAGE_DELAY_MS)
    try {
      const didExtract = await extractSingleUrl(url)
      if (didExtract) setUrl("")
    } catch (extractError) {
      setError(normalizeError(extractError instanceof Error ? extractError.message : "Extraction failed"))
    } finally {
      clearTrackedTimeout(coldStartTimeout)
      setLoadingMessage(null)
      setIsExtracting(false)
    }
  }, [clearTrackedTimeout, extractSingleUrl, trackTimeout, url])

  const handleBulkExtract = useCallback(async () => {
    const urls = bulkUrls
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10)

    if (!urls.length) {
      setError("Please enter a valid video URL")
      return
    }

    setIsExtracting(true)
    setLoadingMessage(null)
    const coldStartTimeout = trackTimeout(() => setLoadingMessage("Server is waking up, please wait..."), COLD_START_MESSAGE_DELAY_MS)
    try {
      for (const bulkUrl of urls) {
        await extractSingleUrl(bulkUrl)
      }
      setBulkUrls("")
    } catch (bulkError) {
      setError(normalizeError(bulkError instanceof Error ? bulkError.message : "Extraction failed"))
    } finally {
      clearTrackedTimeout(coldStartTimeout)
      setLoadingMessage(null)
      setIsExtracting(false)
    }
  }, [bulkUrls, clearTrackedTimeout, extractSingleUrl, trackTimeout])

  const handleDownload = useCallback(async (item: DownloadItem) => {
    setDownloads((current) =>
      current.map((download) =>
        download.id === item.id ? { ...download, status: "downloading", progress: 0, error: undefined } : download
      )
    )

    try {
      const filename = sanitizeFilename(item.title, item.format)
      const downloadUrl =
        `/api/download?url=${encodeURIComponent(item.url)}` +
        `&quality=${encodeURIComponent(item.quality)}` +
        `&format=${encodeURIComponent(item.format)}` +
        `&filename=${encodeURIComponent(filename)}`
      const saveHandle = await pickSaveFile(filename, item.format)
      const response = await fetch(downloadUrl, { cache: "no-store" })

      if (!response.ok) {
        throw new Error(await getDownloadErrorMessage(response, `Download failed with status ${response.status}`))
      }

      const contentLength = Number(response.headers.get("content-length") ?? 0)

      if (!response.body) {
        const blob = await response.blob()
        if (saveHandle) {
          const writable = await saveHandle.createWritable()
          await writable.write(blob)
          await writable.close()
        } else {
          saveBlob(filename, blob)
        }

        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id ? { ...download, progress: 100, status: "completed" } : download
          )
        )
        return
      }

      const reader = response.body.getReader()
      const writable = saveHandle ? await saveHandle.createWritable() : null
      const chunks: BlobPart[] = []
      let receivedLength = 0

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (!value) continue

          if (writable) {
            await writable.write(value)
          } else {
            chunks.push(new Uint8Array(value).buffer)
          }

          receivedLength += value.byteLength

          const progress =
            contentLength > 0
              ? Math.min(Math.round((receivedLength / contentLength) * 100), 99)
              : Math.min(Math.max(1, Math.round(receivedLength / 1024 / 1024)), 95)

          setDownloads((current) =>
            current.map((download) => (download.id === item.id ? { ...download, progress } : download))
          )
        }
      } catch (streamError) {
        if (writable?.abort) await writable.abort()
        throw streamError
      }

      if (writable) {
        await writable.close()
      } else {
        saveBlob(filename, new Blob(chunks, { type: response.headers.get("content-type") || getMimeType(item.format) }))
      }

      setDownloads((current) =>
        current.map((download) =>
          download.id === item.id ? { ...download, progress: 100, status: "completed" } : download
        )
      )
    } catch (downloadError) {
      if (downloadError instanceof DOMException && downloadError.name === "AbortError") {
        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id ? { ...download, status: "ready", progress: 0, error: undefined } : download
          )
        )
        return
      }

      setDownloads((current) =>
        current.map((download) =>
          download.id === item.id
            ? {
                ...download,
                status: "error",
                progress: 0,
                error: normalizeError(downloadError instanceof Error ? downloadError.message : "Download failed"),
              }
            : download
        )
      )
    }
  }, [])

  const handleRemove = useCallback((id: string) => {
    setDownloads((current) => current.filter((item) => item.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    setDownloads([])
  }, [])

  const updateItemQuality = useCallback((id: string, quality: Quality) => {
    setDownloads((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const matchingFormat = item.formats.find((format) => format.quality === quality) ?? item.formats[0]
        return {
          ...item,
          quality: matchingFormat.quality,
          format: matchingFormat.isAudio ? "mp3" : matchingFormat.format,
          fileSize: matchingFormat.fileSize,
          selectedFormatUrl: matchingFormat.url,
        }
      })
    )
  }, [])

  const updateItemFormat = useCallback((id: string, format: Format) => {
    setDownloads((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const matchingFormat =
          item.formats.find((available) => available.format === format && available.quality === item.quality) ??
          item.formats.find((available) => available.format === format) ??
          item.formats[0]
        return {
          ...item,
          format: matchingFormat.isAudio ? "mp3" : matchingFormat.format,
          quality: matchingFormat.quality,
          fileSize: matchingFormat.fileSize,
          selectedFormatUrl: matchingFormat.url,
        }
      })
    )
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!url.trim()) {
        setDetectedPlatform(null)
        return
      }

      if (isValidURL(url)) {
        setDetectedPlatform(detectPlatform(url))
        setError(null)
      } else {
        setDetectedPlatform(null)
      }
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [url])

  useEffect(() => {
    const controller = new AbortController()
    abortControllersRef.current.push(controller)

    void fetch(`${API_BASE_URL}/ping`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    }).catch(() => {
      // Render wake-up ping is intentionally silent.
    })

    return () => {
      controller.abort()
      abortControllersRef.current = abortControllersRef.current.filter((item) => item !== controller)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    const timeout = trackTimeout(() => setError(null), 5000)
    return () => clearTrackedTimeout(timeout)
  }, [clearTrackedTimeout, error, trackTimeout])

  useEffect(() => {
    return () => {
      for (const interval of intervalsRef.current) {
        window.clearInterval(interval)
      }
      intervalsRef.current = []

      for (const timeout of timeoutsRef.current) {
        window.clearTimeout(timeout)
      }
      timeoutsRef.current = []

      for (const controller of abortControllersRef.current) {
        controller.abort()
      }
      abortControllersRef.current = []
    }
  }, [])

  return {
    url,
    setUrl,
    bulkUrls,
    setBulkUrls,
    downloads,
    isExtracting,
    loadingMessage,
    detectedPlatform,
    error,
    handleExtract,
    handleBulkExtract,
    handleDownload,
    handleRemove,
    handleClearAll,
    updateItemQuality,
    updateItemFormat,
  }
}
