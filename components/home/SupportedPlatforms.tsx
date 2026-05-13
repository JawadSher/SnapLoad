import { Card } from "@/components/ui/card"
import { Reveal } from "@/components/ui/reveal"

const platforms = [
  {
    name: "YouTube",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/youtube.svg",
  },
  {
    name: "TikTok",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/tiktok.svg",
  },
  {
    name: "Instagram",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/instagram.svg",
  },
  {
    name: "Facebook",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/facebook.svg",
  },
  {
    name: "Twitter/X",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/x.svg",
  },
  {
    name: "Reddit",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/reddit.svg",
  },
  {
    name: "Vimeo",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/vimeo.svg",
  },
  {
    name: "Dailymotion",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/dailymotion.svg",
  },
  {
    name: "SoundCloud",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/soundcloud.svg",
  },
  {
    name: "Twitch",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/twitch.svg",
  },
  {
    name: "Pinterest",
    src: "https://cdn.jsdelivr.net/npm/simple-icons@16.19.0/icons/pinterest.svg",
  },
  {
    name: "LinkedIn",
    src: "https://img.icons8.com/?size=100&id=8808&format=png&color=000000",
  },
]

export function SupportedPlatforms() {
  return (
    <section id="platforms" className="bg-[var(--surface-soft)] px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-zinc-500">
              Favorite platforms
            </p>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Works with the places people already post
            </h2>
            <p className="text-zinc-400">And 1000+ more sites worldwide</p>
          </div>
        </Reveal>

        <div className="mb-8 grid grid-cols-3 gap-4 md:grid-cols-6">
          {platforms.map((platform, index) => (
            <Reveal key={platform.name} delay={index * 45}>
              <Card className="group hover-lift flex cursor-pointer flex-col items-center justify-center py-6 transition-all hover:border-indigo-500/50">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-zinc-200/70 transition-transform group-hover:scale-105 dark:bg-white/90 dark:ring-white/10">
                  {/* Brand logos are served from Simple Icons CDN on purpose. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={platform.src}
                    alt={`${platform.name} logo`}
                    className="h-8 w-8 object-contain"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-center text-xs font-medium text-zinc-300 md:text-sm">
                  {platform.name}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-center text-sm text-zinc-500">
            ...and 1000+ more platforms
          </p>
        </Reveal>
      </div>
    </section>
  )
}
