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
  | "twitch"
  | "pinterest"
  | "unknown";

// Video quality returned by the extractor API.
export type Quality = string;

// Download format returned by the extractor API.
export type Format = string;

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
  author?: string;
  quality: Quality;
  format: Format;
  status: DownloadStatus;
  progress: number;
  speed: string;
  eta: string;
  totalSize: string;
  eventSource: EventSource | null;
  statusMessage: string;
  fileId?: string;
  error?: string;
  fileSize?: string;
  formats: ExtractedFormat[];
  selectedFormatUrl: string;
  addedAt: Date;
}

export interface ExtractedFormat {
  quality: Quality;
  format: Format;
  url: string;
  fileSize?: string;
  isAudio: boolean;
  label: string;
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
