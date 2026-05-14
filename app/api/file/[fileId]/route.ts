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

async function deleteUpstreamFile(fileId: string) {
  await fetch(new URL(`/api/file/${encodeURIComponent(fileId)}`, API_BASE_URL), {
    method: "DELETE",
    headers: getApiHeaders(),
    cache: "no-store",
  }).catch(() => {
    // Cleanup is best effort. The frontend may retry DELETE if needed.
  })
}

function proxyHeaders(upstreamResponse: Response): Headers {
  const headers = new Headers()
  const contentType = upstreamResponse.headers.get("content-type")
  const contentLength = upstreamResponse.headers.get("content-length")
  const contentDisposition = upstreamResponse.headers.get("content-disposition")

  if (contentType) headers.set("content-type", contentType)
  if (contentLength) headers.set("content-length", contentLength)
  if (contentDisposition) headers.set("content-disposition", contentDisposition)
  headers.set("cache-control", "no-store")
  return headers
}

export async function GET(_request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await context.params
  const upstreamResponse = await fetch(new URL(`/api/file/${encodeURIComponent(fileId)}`, API_BASE_URL), {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
  })

  if (!upstreamResponse.body) {
    await deleteUpstreamFile(fileId)
    return new Response(await upstreamResponse.blob(), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: proxyHeaders(upstreamResponse),
    })
  }

  const reader = upstreamResponse.body.getReader()
  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        await deleteUpstreamFile(fileId)
        return
      }

      controller.enqueue(value)
    },
    async cancel() {
      await reader.cancel()
      await deleteUpstreamFile(fileId)
    },
  })

  return new Response(stream, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: proxyHeaders(upstreamResponse),
  })
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await context.params
  const upstreamResponse = await fetch(new URL(`/api/file/${encodeURIComponent(fileId)}`, API_BASE_URL), {
    method: "DELETE",
    headers: getApiHeaders(),
    cache: "no-store",
  })

  if (upstreamResponse.status === 404) {
    return new Response(null, { status: 204 })
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  })
}
