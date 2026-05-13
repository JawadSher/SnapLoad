import { Reveal } from "@/components/ui/reveal"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Sparkles, Gauge, Globe2 } from "lucide-react"

const stats = [
  { label: "Fast detection", value: "< 2s", icon: Gauge },
  { label: "Supported sites", value: "1000+", icon: Globe2 },
  { label: "Private by default", value: "No login", icon: ShieldCheck },
  { label: "Best format paths", value: "Auto picks", icon: Sparkles },
]

export function TrustStrip() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-[var(--surface)] px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Built for speed</Badge>
              <p className="text-sm text-zinc-400">
                Clean workflow, fewer clicks, and a polished download queue.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                  >
                    <Icon className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="text-xs text-zinc-500">{stat.label}</p>
                      <p className="text-sm font-semibold text-white">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
