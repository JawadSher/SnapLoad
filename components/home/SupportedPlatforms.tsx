import { Card } from "@/components/ui/card"
import { Reveal } from "@/components/ui/reveal"

const platforms = [
  { name: "YouTube", icon: "🎬" },
  { name: "TikTok", icon: "🎵" },
  { name: "Instagram", icon: "📷" },
  { name: "Facebook", icon: "f" },
  { name: "Twitter/X", icon: "𝕏" },
  { name: "Reddit", icon: "🔗" },
  { name: "Vimeo", icon: "▶" },
  { name: "Dailymotion", icon: "▶" },
  { name: "SoundCloud", icon: "☁" },
  { name: "Twitch", icon: "📺" },
  { name: "Pinterest", icon: "📌" },
  { name: "LinkedIn", icon: "in" },
]

export function SupportedPlatforms() {
  return (
    <section id="platforms" className="bg-[var(--surface-soft)] px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Works With Your Favorite Platforms
            </h2>
            <p className="text-zinc-400">And 1000+ more sites worldwide</p>
          </div>
        </Reveal>

        <div className="mb-8 grid grid-cols-3 gap-4 md:grid-cols-6">
          {platforms.map((platform, index) => (
            <Reveal key={platform.name} delay={index * 45}>
              <Card className="group hover-lift flex cursor-pointer flex-col items-center justify-center py-6 transition-all hover:border-indigo-500/50">
                <span className="mb-3 text-4xl transition-transform group-hover:scale-110">
                  {platform.icon}
                </span>
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
