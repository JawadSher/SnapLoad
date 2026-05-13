"use client"

import { Format, Quality } from "@/types"
import { Select, SelectOption } from "@/components/ui/select"

interface FormatSelectorProps {
  value: Format
  onValueChange: (format: Format) => void
  quality: Quality
}

export function FormatSelector({ value, onValueChange, quality }: FormatSelectorProps) {
  // Auto-switch to MP3 if quality is audio
  if (quality === "audio" && value !== "mp3") {
    onValueChange("mp3")
  }

  // Disable format selector if quality is audio
  const isAudioOnly = quality === "audio"

  return (
    <div className="flex-1">
      <Select
        label="Format"
        value={isAudioOnly ? "mp3" : value}
        onChange={(e) => onValueChange(e.target.value as Format)}
        disabled={isAudioOnly}
      >
        <SelectOption value="mp4">MP4 (Video)</SelectOption>
        <SelectOption value="mp3">MP3 (Audio)</SelectOption>
        <SelectOption value="webm">WEBM</SelectOption>
        <SelectOption value="mkv">MKV</SelectOption>
        <SelectOption value="aac">AAC</SelectOption>
      </Select>
    </div>
  )
}
