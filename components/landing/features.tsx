"use client"

import { useEffect, useRef, useState } from "react"
import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Users2, 
  Lightbulb,
  Sparkles,
  Target,
  Zap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning Paths",
    description: "Our AI analyzes your learning patterns and creates personalized study plans that evolve with your progress.",
    color: "from-blue-500 to-cyan-500",
    highlights: ["Smart recommendations", "Progress tracking", "Custom pacing"]
  },
  {
    icon: MessageSquare,
    title: "AI Tutor Chat",
    description: "Get instant answers to your questions with context-aware responses based on your course materials.",
    color: "from-purple-500 to-pink-500",
    highlights: ["24/7 availability", "Context-aware", "Multi-language"]
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track your learning journey with detailed insights into your strengths, weaknesses, and improvement areas.",
    color: "from-orange-500 to-red-500",
    highlights: ["Visual dashboards", "Performance metrics", "Goal tracking"]
  },
  {
    icon: FileText,
    title: "Smart Content Processing",
    description: "Upload PDFs, notes, and study materials. Our AI extracts key concepts and creates interactive learning experiences.",
    color: "from-green-500 to-emerald-500",
    highlights: ["PDF analysis", "Auto summaries", "Key concepts"]
  },
  {
    icon: Users2,
    title: "Educator Dashboard",
    description: "Powerful tools for educators to create courses, monitor student progress, and identify areas needing attention.",
    color: "from-indigo-500 to-purple-500",
    highlights: ["Course builder", "Student insights", "Engagement tools"]
  },
  {
    icon: Lightbulb,
    title: "Socratic Method",
    description: "Learn through guided questioning that helps you discover answers and build deeper understanding.",
    color: "from-yellow-500 to-orange-500",
    highlights: ["Critical thinking", "Deep learning", "Active recall"]
  },
]

export function LandingFeatures() {
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setVisibleFeatures((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    )

    const featureElements = sectionRef.current?.querySelectorAll("[data-index]")
    featureElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-accent/30 bg-accent/5">
            <Sparkles className="w-4 h-4 mr-2 text-accent" />
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-balance">
              Everything You Need to{" "}
              <span className="gradient-text">Excel</span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <span className="text-pretty">
              Our platform combines cutting-edge AI technology with proven learning methodologies 
              to deliver an unparalleled educational experience.
            </span>
          </p>
        </div>

        {/* Features Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              data-index={index}
              className={`group relative transition-all duration-700 ${
                visibleFeatures.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Card Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative h-full p-6 lg:p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-2">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Target className="w-5 h-5 text-accent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
