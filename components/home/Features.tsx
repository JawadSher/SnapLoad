import { Card } from "@/components/ui/card"
import { Reveal } from "@/components/ui/reveal"
import { Zap, Shield, Globe, Layers, Music, Monitor } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Downloads start instantly with no waiting or queue delays",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "No registration required. Your privacy is always protected",
  },
  {
    icon: Globe,
    title: "1000+ Sites",
    description: "Works with YouTube, TikTok, Instagram and hundreds more",
  },
  {
    icon: Layers,
    title: "Bulk Download",
    description: "Download multiple videos at once by pasting multiple URLs",
  },
  {
    icon: Music,
    title: "Audio Extraction",
    description: "Extract MP3 audio from any video with one click",
  },
  {
    icon: Monitor,
    title: "All Devices",
    description: "Works perfectly on desktop, tablet and mobile browsers",
  },
]

export function Features() {
  return (
    <section className="bg-[var(--surface-soft)] px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Why Choose SnapLoad?
            </h2>
            <p className="text-zinc-400">
              A practical, polished tool for fast media downloading.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={index * 80}>
                <Card className="hover-lift h-full p-6">
                  <Icon className="mb-4 h-8 w-8 text-indigo-600" />
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
