"use client"

import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Reveal } from "@/components/ui/reveal"

const faqs = [
  {
    value: "1",
    question: "Is SnapLoad free to use?",
    answer:
      "Yes, SnapLoad is completely free. No registration or account needed.",
  },
  {
    value: "2",
    question: "Which platforms are supported?",
    answer:
      "SnapLoad supports 1000+ platforms including YouTube, TikTok, Instagram, Facebook, Twitter, Reddit, Vimeo and many more.",
  },
  {
    value: "3",
    question: "What video qualities are available?",
    answer:
      "We support up to 4K (2160p), 1080p, 720p, 480p, 360p and audio-only extraction depending on what the source platform provides.",
  },
  {
    value: "4",
    question: "Is it safe to use SnapLoad?",
    answer:
      "Absolutely. SnapLoad does not store any of your videos or personal data. Downloads happen directly in your browser.",
  },
  {
    value: "5",
    question: "Can I download multiple videos at once?",
    answer:
      "Yes. Use the Bulk Download tab to paste multiple URLs and download them all in one go.",
  },
  {
    value: "6",
    question: "Why is my download not working?",
    answer:
      "Some platforms may occasionally update their systems. Try refreshing and pasting the URL again. If the issue persists, contact support.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400">
              Short answers for the things users usually want to know first.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <Card className="p-6">
            <Accordion type="single" defaultValue="1">
              {faqs.map((faq) => (
                <AccordionItem key={faq.value} value={faq.value}>
                  <AccordionTrigger data-value={faq.value}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent value={faq.value}>
                    <div className="pb-2 text-sm leading-6 text-zinc-400">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
