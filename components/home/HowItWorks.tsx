import { Card } from "@/components/ui/card"
import { Reveal } from "@/components/ui/reveal"
import { Link, Settings2, Download } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Link,
    title: "Paste Your URL",
    description:
      "Copy the video link from any platform and paste it in the input above",
  },
  {
    number: "02",
    icon: Settings2,
    title: "Choose Quality",
    description:
      "Select your preferred video quality and format from the available options",
  },
  {
    number: "03",
    icon: Download,
    title: "Download Instantly",
    description:
      "Click download and your browser will save the file directly to your device",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              How It Works
            </h2>
            <p className="text-zinc-400">Download any video in 3 simple steps</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal key={step.number} delay={index * 80}>
                <div className="relative h-full">
                  {index < steps.length - 1 && (
                    <div className="absolute left-[60%] top-20 hidden h-px w-[calc(100%-20%)] bg-gradient-to-r from-indigo-500/50 to-transparent md:block" />
                  )}
                  <Card className="hover-lift relative h-full p-8">
                    <div className="pointer-events-none absolute -right-8 -top-8 text-8xl font-black text-zinc-800/40">
                      {step.number}
                    </div>
                    <div className="relative z-10 mb-6">
                      <Icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="relative z-10 mb-3 text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="relative z-10 text-sm text-zinc-400">
                      {step.description}
                    </p>
                  </Card>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
