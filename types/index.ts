// Supported platforms
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
  | "unknown";

// Video quality options
export type Quality = "4K" | "1080p" | "720p" | "480p" | "360p" | "audio";

// Download format
export type Format = "mp4" | "mp3" | "webm" | "aac" | "mkv";

// Download status
export type DownloadStatus =
  | "idle"
  | "detecting"
  | "ready"
  | "downloading"
  | "completed"
  | "error";

// Single download item
export interface DownloadItem {
  id: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnail: string;
  duration: string;
  quality: Quality;
  format: Format;
  status: DownloadStatus;
  progress: number;
  error?: string;
  fileSize?: string;
}

// Available format option
export interface FormatOption {
  quality: Quality;
  format: Format;
  fileSize: string;
  label: string;
}

// Platform info
export interface PlatformInfo {
  name: string;
  platform: Platform;
  color: string;
  icon: string;
}
