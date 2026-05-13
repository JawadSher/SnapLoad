import { FAQ } from "@/components/home/FAQ"
import { Features } from "@/components/home/Features"
import { HeroSection } from "@/components/home/HeroSection"
import { HowItWorks } from "@/components/home/HowItWorks"
import { Showcase } from "@/components/home/Showcase"
import { TrustStrip } from "@/components/home/TrustStrip"
import { SupportedPlatforms } from "@/components/home/SupportedPlatforms"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustStrip />
      <SupportedPlatforms />
      <HowItWorks />
      <Features />
      <Showcase />
      <FAQ />
    </div>
  )
}
