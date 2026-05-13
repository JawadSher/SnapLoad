import Link from "next/link"
import { Download } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-600" />
                <span className="text-lg font-bold text-white">SnapLoad</span>
              </div>
              <p className="text-sm text-zinc-400">
                Download your favorite videos from 1000+ platforms instantly.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/" className="transition-colors hover:text-indigo-400">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="transition-colors hover:text-indigo-400">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#platforms" className="transition-colors hover:text-indigo-400">
                    Platforms
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition-colors hover:text-indigo-400">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Supported Sites</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>YouTube</li>
                <li>TikTok</li>
                <li>Instagram</li>
                <li>More...</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
                <li>About</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-8 text-sm text-zinc-400 md:flex-row">
            <p>© 2024 SnapLoad. All rights reserved.</p>
            <p>Made with care for the internet</p>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}
