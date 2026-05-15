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

interface ProgressEventData {
  type?: "start" | "progress" | "complete" | "error"
  percentage?: number
  speed?: string
  eta?: string
  totalSize?: string
  fileId?: string
  filename?: string
  message?: string
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

function parseDurationToSeconds(duration: string): number | null {
  const parts = duration
    .trim()
    .split(":")
    .map((part) => Number.parseInt(part, 10))

  if (!parts.length || parts.some((part) => !Number.isFinite(part) || part < 0)) return null

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 1) return parts[0]
  return null
}

function stableRatio(seed: string): number {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return (hash % 1000) / 1000
}

function spreadMinutes(min: number, max: number, seed: string): number {
  return min + (max - min) * stableRatio(seed)
}

function getQualityTimingMultiplier(item: DownloadItem): number {
  const qualityText = `${item.quality} ${item.format}`.toLowerCase()
  const numericQuality = Number.parseInt(item.quality, 10)

  if (item.format.toLowerCase() === "mp3" || item.quality.toLowerCase() === "audio") return 0.72
  if (Number.isFinite(numericQuality) && numericQuality >= 2160) return 1.24
  if (Number.isFinite(numericQuality) && numericQuality >= 1440) return 1.16
  if (Number.isFinite(numericQuality) && numericQuality >= 1080) return 1.08
  if (/4k|2160|uhd/.test(qualityText)) return 1.24
  if (/1440|2k|qhd/.test(qualityText)) return 1.16
  if (/1080|hd/.test(qualityText)) return 1.08
  return 1
}

function estimateSimulatedDownloadMs(item: DownloadItem): number {
  const seconds = parseDurationToSeconds(item.duration)
  const seed = `${item.id}-${item.duration}-${item.quality}-${item.format}`
  let minutes: number

  if (!seconds) {
    minutes = spreadMinutes(3, 6, seed)
  } else if (seconds <= 10) {
    minutes = spreadMinutes(1.5, 2.25, seed)
  } else if (seconds <= 15) {
    minutes = spreadMinutes(2, 2.75, seed)
  } else if (seconds <= 20) {
    minutes = spreadMinutes(2.5, 3.25, seed)
  } else if (seconds <= 30) {
    minutes = spreadMinutes(3, 4, seed)
  } else if (seconds <= 45) {
    minutes = spreadMinutes(3.5, 4.75, seed)
  } else if (seconds <= 60) {
    minutes = spreadMinutes(4, 5.5, seed)
  } else if (seconds <= 120) {
    minutes = spreadMinutes(5, 7, seed)
  } else if (seconds <= 300) {
    minutes = spreadMinutes(7, 10, seed)
  } else if (seconds <= 600) {
    minutes = spreadMinutes(9, 13, seed)
  } else if (seconds <= 900) {
    minutes = spreadMinutes(11, 16, seed)
  } else if (seconds <= 1800) {
    minutes = spreadMinutes(15, 22, seed)
  } else if (seconds <= 2700) {
    minutes = spreadMinutes(20, 27, seed)
  } else if (seconds <= 3600) {
    minutes = spreadMinutes(24, 30, seed)
  } else if (seconds <= 5400) {
    minutes = spreadMinutes(30, 40, seed)
  } else if (seconds <= 7200) {
    minutes = spreadMinutes(38, 52, seed)
  } else {
    const extraHours = (seconds - 7200) / 3600
    minutes = spreadMinutes(52 + extraHours * 10, 68 + extraHours * 14, seed)
  }

  const adjustedMinutes = Math.min(minutes * getQualityTimingMultiplier(item), 90)
  return adjustedMinutes * 60 * 1000
}

function triggerBrowserDownload(fileId: string, filename: string) {
  const anchor = document.createElement("a")
  anchor.href = `/api/file/${encodeURIComponent(fileId)}`
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function cleanupServerFile(fileId: string) {
  void fetch(`/api/file/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    cache: "no-store",
  }).catch(() => {
    // The file route also cleans up after successful streaming.
  })
}

export function useDownloader(): UseDownloaderReturn {
  const [url, setUrl] = useState("")
  const [bulkUrls, setBulkUrls] = useState("")
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timeoutsRef = useRef<number[]>([])
  const abortControllersRef = useRef<AbortController[]>([])
  const eventSourcesRef = useRef<Record<string, EventSource>>({})
  const progressTimeoutsRef = useRef<Record<string, number>>({})
  const progressIntervalsRef = useRef<Record<string, number>>({})
  const fileIdsRef = useRef<Record<string, string>>({})

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

  const stopFakeProgress = useCallback(
    (id: string) => {
      const timeout = progressTimeoutsRef.current[id]
      if (timeout) {
        clearTrackedTimeout(timeout)
        delete progressTimeoutsRef.current[id]
      }

      const interval = progressIntervalsRef.current[id]
      if (interval) {
        window.clearInterval(interval)
        delete progressIntervalsRef.current[id]
      }
    },
    [clearTrackedTimeout]
  )

  const startFakeProgress = useCallback(
    (item: DownloadItem) => {
      stopFakeProgress(item.id)

      const startedAt = Date.now()
      const plannedDurationMs = estimateSimulatedDownloadMs(item)

      const updateProgress = () => {
        const elapsedRatio = Math.min((Date.now() - startedAt) / plannedDurationMs, 1)
        const easedRatio = 1 - Math.pow(1 - elapsedRatio, 1.35)
        const nextProgress = Math.min(Math.max(8, Math.floor(8 + easedRatio * 88)), 96)

        setDownloads((current) =>
          current.map((download) => {
            if (download.id !== item.id || download.status !== "downloading") return download
            return {
              ...download,
              progress: Math.max(download.progress, nextProgress),
              statusMessage: download.statusMessage || "Downloading...",
            }
          })
        )
      }

      const starter = trackTimeout(() => {
        delete progressTimeoutsRef.current[item.id]
        updateProgress()
      }, 600)
      progressTimeoutsRef.current[item.id] = starter
      const interval = window.setInterval(updateProgress, 1300)
      progressIntervalsRef.current[item.id] = interval

      return () => {
        stopFakeProgress(item.id)
      }
    },
    [stopFakeProgress, trackTimeout]
  )

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
        speed: "",
        eta: "",
        totalSize: "",
        eventSource: null,
        statusMessage: "",
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
    const existingEventSource = eventSourcesRef.current[item.id]
    if (existingEventSource) {
      existingEventSource.close()
      delete eventSourcesRef.current[item.id]
    }
    stopFakeProgress(item.id)

    setDownloads((current) =>
      current.map((download) =>
        download.id === item.id
          ? {
              ...download,
              status: "downloading",
              progress: 0,
              speed: "",
              eta: "",
              totalSize: "",
              eventSource: null,
              statusMessage: "Connecting to server...",
              error: undefined,
            }
          : download
      )
    )
    startFakeProgress(item)

    try {
      if (!("EventSource" in window)) {
        throw new Error("Live progress is not supported in this browser")
      }

      const params = new URLSearchParams({
        url: item.url,
        quality: item.quality,
        format: item.format,
        audioOnly: item.format === "mp3" ? "true" : "false",
      })
      const eventSource = new EventSource(`/api/progress?${params.toString()}`)
      eventSourcesRef.current[item.id] = eventSource

      setDownloads((current) =>
        current.map((download) => (download.id === item.id ? { ...download, eventSource } : download))
      )

      eventSource.onmessage = (event) => {
        let data: ProgressEventData

        try {
          data = JSON.parse(event.data) as ProgressEventData
        } catch {
          setDownloads((current) =>
            current.map((download) =>
              download.id === item.id
                ? {
                    ...download,
                    status: "error",
                    progress: 0,
                    statusMessage: "The server sent an unreadable progress update.",
                    error: "The server sent an unreadable progress update.",
                  }
                : download
            )
          )
          eventSource.close()
          delete eventSourcesRef.current[item.id]
          return
        }

        if (data.type === "start") {
          setDownloads((current) =>
            current.map((download) =>
              download.id === item.id
                ? { ...download, status: "downloading", statusMessage: data.message || "Server is processing..." }
                : download
            )
          )
          return
        }

        if (data.type === "progress") {
          setDownloads((current) =>
            current.map((download) =>
              download.id === item.id
                ? {
                    ...download,
                    status: "downloading",
                    speed: data.speed || "",
                    eta: data.eta || "",
                    totalSize: data.totalSize || "",
                    statusMessage: data.message || "Downloading...",
                  }
                : download
            )
          )
          return
        }

        if (data.type === "complete") {
          const fileId = data.fileId
          const filename = data.filename || sanitizeFilename(item.title, item.format)

          if (!fileId) {
            setDownloads((current) =>
              current.map((download) =>
                download.id === item.id
                  ? {
                      ...download,
                      status: "error",
                      statusMessage: "The server finished but did not return a file.",
                      error: "The server finished but did not return a file.",
                    }
                  : download
              )
            )
            eventSource.close()
            delete eventSourcesRef.current[item.id]
            return
          }

          fileIdsRef.current[item.id] = fileId
          stopFakeProgress(item.id)
          eventSource.close()
          delete eventSourcesRef.current[item.id]

          setDownloads((current) =>
            current.map((download) =>
              download.id === item.id
                ? {
                    ...download,
                    progress: 100,
                    status: "completed",
                    statusMessage: "Download Complete",
                    eventSource: null,
                    fileId,
                  }
                : download
            )
          )

          triggerBrowserDownload(fileId, filename)
          return
        }

        if (data.type === "error") {
          stopFakeProgress(item.id)
          setDownloads((current) =>
            current.map((download) =>
              download.id === item.id
                ? {
                    ...download,
                    status: "error",
                    progress: 0,
                    statusMessage: data.message || "Download failed. Try again.",
                    error: data.message || "Download failed. Try again.",
                    eventSource: null,
                  }
                : download
            )
          )
          eventSource.close()
          delete eventSourcesRef.current[item.id]
        }
      }

      eventSource.onerror = () => {
        stopFakeProgress(item.id)
        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id
              ? {
                  ...download,
                  status: "error",
                  statusMessage: "Connection lost. Try again.",
                  error: "Connection lost. Try again.",
                  eventSource: null,
                }
              : download
          )
        )
        eventSource.close()
        delete eventSourcesRef.current[item.id]
      }
    } catch (downloadError) {
      const message = normalizeError(downloadError instanceof Error ? downloadError.message : "Download failed")
      stopFakeProgress(item.id)

      setDownloads((current) =>
        current.map((download) =>
          download.id === item.id
            ? {
                ...download,
                status: "error",
                progress: 0,
                statusMessage: message,
                error: message,
              }
            : download
        )
      )
    }
  }, [startFakeProgress, stopFakeProgress])

  const handleRemove = useCallback((id: string) => {
    const eventSource = eventSourcesRef.current[id]
    if (eventSource) {
      eventSource.close()
      delete eventSourcesRef.current[id]
    }
    stopFakeProgress(id)

    const fileId = fileIdsRef.current[id]
    if (fileId) {
      cleanupServerFile(fileId)
      delete fileIdsRef.current[id]
    }

    setDownloads((current) => current.filter((item) => item.id !== id))
  }, [stopFakeProgress])

  const handleClearAll = useCallback(() => {
    for (const eventSource of Object.values(eventSourcesRef.current)) {
      eventSource.close()
    }
    eventSourcesRef.current = {}
    for (const timeout of Object.values(progressTimeoutsRef.current)) {
      clearTrackedTimeout(timeout)
    }
    progressTimeoutsRef.current = {}
    for (const interval of Object.values(progressIntervalsRef.current)) {
      window.clearInterval(interval)
    }
    progressIntervalsRef.current = {}

    for (const fileId of Object.values(fileIdsRef.current)) {
      cleanupServerFile(fileId)
    }
    fileIdsRef.current = {}

    setDownloads([])
  }, [clearTrackedTimeout])

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
      for (const timeout of Object.values(progressTimeoutsRef.current)) {
        window.clearTimeout(timeout)
      }
      progressTimeoutsRef.current = {}

      for (const interval of Object.values(progressIntervalsRef.current)) {
        window.clearInterval(interval)
      }
      progressIntervalsRef.current = {}

      for (const timeout of timeoutsRef.current) {
        window.clearTimeout(timeout)
      }
      timeoutsRef.current = []

      for (const controller of abortControllersRef.current) {
        controller.abort()
      }
      abortControllersRef.current = []

      for (const eventSource of Object.values(eventSourcesRef.current)) {
        eventSource.close()
      }
      eventSourcesRef.current = {}
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
