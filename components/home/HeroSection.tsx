"use client"

import { Badge } from "@/components/ui/badge"
import { URLInput } from "@/components/downloader/URLInput"
import { DownloadQueue } from "@/components/downloader/DownloadQueue"
import { DownloadItem } from "@/types"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: "1",
      url: "https://youtube.com/watch?v=example",
      platform: "youtube",
      title: "How to Build a SaaS Product in 2024 — Complete Guide",
      thumbnail: "https://picsum.photos/120/68",
      duration: "15:42",
      quality: "1080p",
      format: "mp4",
      status: "completed",
      progress: 100,
      fileSize: "245 MB",
    },
    {
      id: "2",
      url: "https://tiktok.com/@user/video/example",
      platform: "tiktok",
      title: "Viral TikTok Dance Tutorial #trending",
      thumbnail: "https://picsum.photos/120/68?random=2",
      duration: "0:45",
      quality: "720p",
      format: "mp4",
      status: "downloading",
      progress: 65,
      fileSize: "18 MB",
    },
    {
      id: "3",
      url: "https://instagram.com/reel/example",
      platform: "instagram",
      title: "Instagram Reel — Beautiful Sunset Timelapse",
      thumbnail: "https://picsum.photos/120/68?random=3",
      duration: "0:30",
      quality: "1080p",
      format: "mp4",
      status: "ready",
      progress: 0,
      fileSize: "12 MB",
    },
  ])

  const handleAddDownloads = (items: DownloadItem[]) => {
    setDownloads((current) => [...current, ...items])
  }

  const handleRemove = (id: string) => {
    setDownloads((current) => current.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    setDownloads([])
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.status === "downloading" && item.progress < 100) {
            const nextProgress = Math.min(item.progress + Math.random() * 15, 100)
            return {
              ...item,
              progress: Math.floor(nextProgress),
              status: nextProgress >= 100 ? "completed" : "downloading",
            }
          }

          return item
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-12 pt-24">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.16) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div className="animate-soft-pulse absolute left-1/2 top-28 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-8 flex justify-center">
          <Badge variant="primary">1000+ Supported Platforms</Badge>
        </div>

        <h1 className="text-balance mb-6 text-center text-5xl font-black leading-tight text-white md:text-7xl">
          Download Any Video,
          <br />
          <span className="bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
            From Anywhere.
          </span>
        </h1>

        <p className="text-balance mx-auto mb-12 max-w-2xl text-center text-lg text-zinc-400">
          Paste any video URL and download in your preferred quality. YouTube, TikTok,
          Instagram, Facebook and 1000+ more sites.
        </p>

        <div className="mb-8">
          <URLInput onAddDownloads={handleAddDownloads} />
        </div>

        <div className="mb-12">
          <DownloadQueue
            items={downloads}
            onRemove={handleRemove}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          <div className="hover-lift rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur">
            <p className="text-2xl font-bold text-white md:text-3xl">10M+</p>
            <p className="text-sm text-zinc-500">Downloads</p>
          </div>
          <div className="hover-lift rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur">
            <p className="text-2xl font-bold text-white md:text-3xl">1000+</p>
            <p className="text-sm text-zinc-500">Sites</p>
          </div>
          <div className="hover-lift rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur">
            <p className="text-2xl font-bold text-white md:text-3xl">100%</p>
            <p className="text-sm text-zinc-500">Free</p>
          </div>
          <div className="hover-lift rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur">
            <p className="text-2xl font-bold text-white md:text-3xl">No</p>
            <p className="text-sm text-zinc-500">Signup</p>
          </div>
        </div>
      </div>
    </section>
  )
}
