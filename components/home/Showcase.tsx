import { Reveal } from "@/components/ui/reveal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DownloadCloud, Layers3, WandSparkles, ArrowRight } from "lucide-react"

const items = [
  {
    icon: WandSparkles,
    title: "Instant detection",
    description:
      "Paste a link, recognize the platform, and show the right formats without friction.",
  },
  {
    icon: Layers3,
    title: "Bulk-ready queue",
    description:
      "Multiple URLs can be queued at once, keeping larger jobs organized and visible.",
  },
  {
    icon: DownloadCloud,
    title: "Clear export flow",
    description:
      "Every item shows its state, progress, and destination so users always know what is happening.",
  },
]

export function Showcase() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <Badge variant="primary">What the product does</Badge>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              A cleaner download experience with fewer steps and clearer feedback.
            </h2>
            <p className="mt-3 text-zinc-400">
              The interface is built to feel calm on first glance, then reveal useful
              detail as users interact with it.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <Reveal key={item.title} delay={index * 90}>
                <Card className="h-full p-6 hover-lift">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-500 ring-1 ring-indigo-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                </Card>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-[var(--surface)] p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Built to showcase
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                A responsive interface that feels active, modern, and easy to scan.
              </p>
            </div>
            <a
              href="#faq"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              See the FAQ
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
