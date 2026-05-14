export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "twitter"
  | "reddit"
  | "vimeo"
  | "dailymotion"
  | "soundcloud"
  | "twitch"
  | "pinterest"
  | "unknown"

export interface DetectedPlatform {
  platform: Platform
  name: string
  color: string
  isSupported: boolean
}

const PLATFORM_META: Record<Platform, Omit<DetectedPlatform, "platform">> = {
  youtube: { name: "YouTube", color: "#FF0000", isSupported: true },
  tiktok: { name: "TikTok", color: "#000000", isSupported: true },
  instagram: { name: "Instagram", color: "#E1306C", isSupported: true },
  facebook: { name: "Facebook", color: "#1877F2", isSupported: true },
  twitter: { name: "Twitter/X", color: "#1DA1F2", isSupported: true },
  reddit: { name: "Reddit", color: "#FF4500", isSupported: true },
  vimeo: { name: "Vimeo", color: "#1AB7EA", isSupported: true },
  dailymotion: { name: "Dailymotion", color: "#0066DC", isSupported: true },
  soundcloud: { name: "SoundCloud", color: "#FF5500", isSupported: true },
  twitch: { name: "Twitch", color: "#9146FF", isSupported: true },
  pinterest: { name: "Pinterest", color: "#E60023", isSupported: true },
  unknown: { name: "Unknown", color: "#6366f1", isSupported: false },
}

function normalizeHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return ""
  }
}

function withMeta(platform: Platform): DetectedPlatform {
  return {
    platform,
    ...PLATFORM_META[platform],
  }
}

export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function detectPlatform(url: string): DetectedPlatform {
  const hostname = normalizeHostname(url)

  if (!hostname) return withMeta("unknown")
  if (hostname === "youtube.com" || hostname.endsWith(".youtube.com") || hostname === "youtu.be") return withMeta("youtube")
  if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) return withMeta("tiktok")
  if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) return withMeta("instagram")
  if (hostname === "facebook.com" || hostname.endsWith(".facebook.com") || hostname === "fb.watch") return withMeta("facebook")
  if (hostname === "twitter.com" || hostname.endsWith(".twitter.com") || hostname === "x.com" || hostname.endsWith(".x.com")) return withMeta("twitter")
  if (hostname === "reddit.com" || hostname.endsWith(".reddit.com")) return withMeta("reddit")
  if (hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")) return withMeta("vimeo")
  if (hostname === "dailymotion.com" || hostname.endsWith(".dailymotion.com") || hostname === "dai.ly") return withMeta("dailymotion")
  if (hostname === "soundcloud.com" || hostname.endsWith(".soundcloud.com")) return withMeta("soundcloud")
  if (hostname === "twitch.tv" || hostname.endsWith(".twitch.tv")) return withMeta("twitch")
  if (hostname === "pinterest.com" || hostname.endsWith(".pinterest.com") || hostname === "pin.it") return withMeta("pinterest")

  return withMeta("unknown")
}

export function extractVideoId(url: string, platform: Platform): string | null {
  try {
    const parsed = new URL(url)
    const paths = parsed.pathname.split("/").filter(Boolean)

    switch (platform) {
      case "youtube":
        if (parsed.hostname.includes("youtu.be")) return paths[0] ?? null
        if (paths[0] === "shorts") return paths[1] ?? null
        return parsed.searchParams.get("v")
      case "tiktok":
        return paths[1] === "video" ? paths[2] ?? null : paths.at(-1) ?? null
      case "instagram":
        return ["reel", "p", "tv"].includes(paths[0] ?? "") ? paths[1] ?? null : null
      case "facebook":
        return paths.at(-1) ?? null
      case "twitter":
        return paths.includes("status") ? paths[paths.indexOf("status") + 1] ?? null : null
      case "reddit":
        return paths.includes("comments") ? paths[paths.indexOf("comments") + 1] ?? null : null
      case "vimeo":
      case "dailymotion":
      case "soundcloud":
      case "twitch":
      case "pinterest":
        return paths.at(-1) ?? null
      case "unknown":
        return null
    }
  } catch {
    return null
  }
}
