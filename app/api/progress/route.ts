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

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url")
  const quality = request.nextUrl.searchParams.get("quality")
  const format = request.nextUrl.searchParams.get("format")
  const audioOnly = request.nextUrl.searchParams.get("audioOnly")

  if (!sourceUrl || !quality || !format) {
    return Response.json({ success: false, error: "Missing progress parameters" }, { status: 400 })
  }

  const upstreamUrl = new URL("/api/progress", API_BASE_URL)
  upstreamUrl.searchParams.set("url", sourceUrl)
  upstreamUrl.searchParams.set("quality", quality)
  upstreamUrl.searchParams.set("format", format)
  if (audioOnly) upstreamUrl.searchParams.set("audioOnly", audioOnly)

  const upstreamResponse = await fetch(upstreamUrl, {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
  })

  if (!upstreamResponse.ok) {
    const details = await upstreamResponse.text().catch(() => "")
    return new Response(details || "Progress connection failed", {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: {
        "content-type": upstreamResponse.headers.get("content-type") || "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    })
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  })
}
