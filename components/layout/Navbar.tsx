"use client"

import Link from "next/link"
import { Download, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-zinc-950/80 shadow-sm backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-indigo-400 transition-colors">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600/10 ring-1 ring-indigo-500/20">
            <Download className="w-5 h-5 text-indigo-600" />
          </span>
          SnapLoad
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-base text-white hover:bg-white/10">
            Home
          </Link>
          <a href="#how-it-works" className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-base text-white hover:bg-white/10">
            How it Works
          </a>
          <a href="#platforms" className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-base text-white hover:bg-white/10">
            Supported Sites
          </a>
          <a href="#faq" className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-base text-white hover:bg-white/10">
            Blog
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="solid" size="md">Go Premium</Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {/* Mobile Menu Button */}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-white hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2">
            <Link href="/" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              Home
            </Link>
            <a href="#how-it-works" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              How it Works
            </a>
            <a href="#platforms" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              Supported Sites
            </a>
            <a href="#faq" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              Blog
            </a>
            <Button variant="solid" size="md" className="mt-2">Go Premium</Button>
          </div>
        </div>
      )}
    </nav>
  )
}
