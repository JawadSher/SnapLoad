import type { NextRequest } from "next/server"

const DEFAULT_API_URL = "https://snapload-api-fzy3.onrender.com"
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "")
const API_KEY = (process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_SNAPLOAD_API_KEY || "")
  .trim()
  .replace(/^['"]|['"]$/g, "")

export const runtime = "nodejs"

function getApiHeaders(): HeadersInit {
  if (!API_KEY) return {}

  return {
    "x-api-key": API_KEY,
    Authorization: `Bearer ${API_KEY}`,
  }
}

function getSafeFilename(value: string | null): string {
  const fallback = "snapload-video.mp4"
  if (!value) return fallback

  const filename = value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 140)

  return filename || fallback
}

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url")
  const quality = request.nextUrl.searchParams.get("quality")
  const format = request.nextUrl.searchParams.get("format")
  const filename = getSafeFilename(request.nextUrl.searchParams.get("filename"))

  if (!sourceUrl || !quality || !format) {
    return Response.json({ success: false, error: "Missing download parameters" }, { status: 400 })
  }

  const upstreamUrl = new URL("/api/download", API_BASE_URL)
  upstreamUrl.searchParams.set("url", sourceUrl)
  upstreamUrl.searchParams.set("quality", quality)
  upstreamUrl.searchParams.set("format", format)

  const upstreamResponse = await fetch(upstreamUrl, {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
  })

  const headers = new Headers()
  const contentType = upstreamResponse.headers.get("content-type")
  const contentLength = upstreamResponse.headers.get("content-length")
  const contentDisposition = upstreamResponse.headers.get("content-disposition")

  if (contentType) headers.set("content-type", contentType)
  if (contentLength) headers.set("content-length", contentLength)
  headers.set("cache-control", "no-store")
  headers.set("content-disposition", contentDisposition || `attachment; filename="${filename}"`)

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  })
}
