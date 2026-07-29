"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, BookOpen, Brain, Zap } from "lucide-react"

const floatingElements = [
  { icon: BookOpen, delay: "0s", position: "top-1/4 left-[10%]" },
  { icon: Brain, delay: "1s", position: "top-1/3 right-[15%]" },
  { icon: Zap, delay: "2s", position: "bottom-1/3 left-[20%]" },
  { icon: Sparkles, delay: "0.5s", position: "bottom-1/4 right-[10%]" },
]

export function LandingHero() {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-[100px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating Elements */}
        {floatingElements.map((el, i) => (
          <div
            key={i}
            className={`absolute ${el.position} animate-float opacity-20`}
            style={{ animationDelay: el.delay }}
          >
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
              <el.icon className="w-8 h-8 text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm font-medium border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 transition-colors cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin" />
              AI-Powered Learning Platform
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Badge>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-balance">
              Transform Learning with{" "}
              <span className="gradient-text">Intelligent AI</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-pretty">
              Experience personalized education that adapts to your unique learning style. 
              Our AI tutor provides real-time guidance, tracks your progress, and helps you master any subject faster.
            </span>
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/30 hover:scale-[1.02]"
            >
              <Link href="/auth/sign-up">
                Start Learning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 py-6 group glass hover:bg-card/80 bg-transparent"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-sm text-muted-foreground mb-4">Join thousands of learners worldwide</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">50,000+ Active Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">98% Success Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual - Complete Dashboard Preview */}
        <div
          className={`mt-16 max-w-6xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
            {/* Browser Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 border-b border-border/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 max-w-md mx-auto">
                <div className="bg-background/80 rounded-lg px-4 py-2 text-sm text-muted-foreground border">
                  🔒 learnai.app/student/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-64 bg-muted/20 border-r border-border/50 p-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg gradient-text">LearnAI</span>
                </div>
                
                <nav className="space-y-2">
                  {[
                    { name: 'Dashboard', active: true },
                    { name: 'My Courses', active: false },
                    { name: 'AI Tutor', active: false },
                    { name: 'Analytics', active: false },
                    { name: 'Settings', active: false }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.active 
                          ? 'bg-accent/20 text-accent border border-accent/30' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 bg-background/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Welcome back, John!</h2>
                    <p className="text-muted-foreground">Continue your learning journey</p>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-accent text-white">
                    Start Learning
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Courses', value: '12', change: '+2', color: 'primary' },
                    { label: 'Study Time', value: '47h', change: '+5h', color: 'accent' },
                    { label: 'Avg Score', value: '87%', change: '+3%', color: 'green-500' },
                    { label: 'Streak', value: '15d', change: '+1d', color: 'blue-500' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className={`text-xs text-${stat.color} bg-${stat.color}/10 px-2 py-1 rounded`}>
                          {stat.change}
                        </span>
                      </div>
                      <div className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Progress Chart */}
                  <div className="bg-card p-4 rounded-xl border border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Learning Progress
                    </h3>
                    <div className="h-32 flex items-end justify-around px-2">
                      {[65, 78, 45, 89, 67, 92, 85].map((height, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div 
                            className="w-8 bg-gradient-to-t from-primary to-accent rounded-t transition-all duration-500 hover:scale-110"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Tutor Chat */}
                  <div className="bg-card p-4 rounded-xl border border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-accent" />
                      AI Tutor
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto" />
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm flex-1">
                          How can I help you learn today?
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="bg-accent/20 rounded-lg px-3 py-2 text-sm max-w-[80%]">
                          Explain React hooks
                        </div>
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">👤</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm flex-1">
                          Let's explore React hooks step by step...
                          <div className="flex gap-1 mt-2">
                            <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                            <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
