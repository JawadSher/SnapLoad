"use client"

import Link from "next/link"
import { Download, Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

const navItems = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#platforms", label: "Platforms" },
  { href: "#faq", label: "FAQ" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full px-3 pt-3">
      <div className="mx-auto max-w-6xl rounded-2xl border border-zinc-800/80 bg-[var(--surface)]/90 shadow-sm backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link
            href="/"
            className="group flex items-center gap-3 text-xl font-bold text-[var(--foreground)] transition-colors hover:text-indigo-500"
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-sm shadow-indigo-500/20">
              <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <Download className="relative h-5 w-5" />
            </span>
            <span className="hidden sm:block">
              SnapLoad
              <span className="ml-2 align-middle text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                media tools
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-zinc-800 bg-[var(--surface-soft)] px-2 py-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/70 hover:text-[var(--foreground)] dark:hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-[var(--foreground)] hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-zinc-800 bg-[var(--surface)] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
