import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingStats } from "@/components/landing/stats"
import { LandingTestimonials } from "@/components/landing/testimonials"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingCTA } from "@/components/landing/cta"
import { LandingNavbar } from "@/components/landing/navbar"
import { LandingFooter } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
