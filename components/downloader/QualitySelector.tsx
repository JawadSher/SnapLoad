"use client"

import { Quality } from "@/types"
import { Select, SelectOption } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface QualitySelectorProps {
  value: Quality
  onValueChange: (quality: Quality) => void
}

export function QualitySelector({ value, onValueChange }: QualitySelectorProps) {
  return (
    <div className="flex-1">
      <Select
        label="Quality"
        value={value}
        onChange={(e) => onValueChange(e.target.value as Quality)}
      >
        <SelectOption value="4K">4K (2160p)</SelectOption>
        <SelectOption value="1080p">1080p Full HD <Badge variant="primary" className="ml-2">Best</Badge></SelectOption>
        <SelectOption value="720p">720p HD</SelectOption>
        <SelectOption value="480p">480p</SelectOption>
        <SelectOption value="360p">360p</SelectOption>
        <SelectOption value="audio">Audio Only</SelectOption>
      </Select>
    </div>
  )
}
