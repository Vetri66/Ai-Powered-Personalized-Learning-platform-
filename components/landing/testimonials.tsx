"use client"

import { Badge } from "@/components/ui/badge"
import { Quote } from "lucide-react"



export function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-accent/30 bg-accent/5">
            <Quote className="w-4 h-4 mr-2 text-accent" />
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Coming Soon</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Student and educator testimonials will be featured here.
          </p>
        </div>
      </div>
    </section>
  )
}
