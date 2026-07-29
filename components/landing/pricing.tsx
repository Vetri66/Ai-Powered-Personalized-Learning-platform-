"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Check, Sparkles, Zap, Crown } from "lucide-react"

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out LearnAI",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    features: [
      "Access to 50+ free courses",
      "Basic AI tutor (10 questions/day)",
      "Progress tracking",
      "Community forum access",
      "Mobile app access"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    description: "For serious learners",
    monthlyPrice: 19,
    yearlyPrice: 190,
    icon: Sparkles,
    features: [
      "Unlimited course access",
      "Unlimited AI tutor conversations",
      "Advanced analytics dashboard",
      "Personalized learning paths",
      "PDF & notes processing",
      "Priority support",
      "Certificate generation"
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Enterprise",
    description: "For institutions & teams",
    monthlyPrice: 49,
    yearlyPrice: 490,
    icon: Crown,
    features: [
      "Everything in Pro",
      "Educator dashboard",
      "Bulk user management",
      "Custom branding",
      "API access",
      "Dedicated success manager",
      "SSO integration",
      "Advanced reporting"
    ],
    cta: "Contact Sales",
    popular: false
  }
]

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="pricing" ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-accent/30 bg-accent/5">
            <Crown className="w-4 h-4 mr-2 text-accent" />
            Pricing Plans
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-balance">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            <span className="text-pretty">
              Choose the plan that fits your learning journey. 
              Upgrade or downgrade anytime.
            </span>
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-full bg-muted/50 glass">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-accent"
            />
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
              <Badge className="ml-2 bg-accent/10 text-accent hover:bg-accent/20 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative p-8 transition-all duration-700 hover:-translate-y-2 ${
                plan.popular
                  ? "bg-gradient-to-b from-card to-accent/5 border-accent/30 shadow-xl shadow-accent/10"
                  : "bg-card/50 glass border-border/50 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6 ${
                plan.popular
                  ? "bg-gradient-to-br from-primary to-accent"
                  : "bg-gradient-to-br from-primary/10 to-accent/10"
              }`}>
                <plan.icon className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-accent mt-1">
                    Billed annually (${Math.round(plan.yearlyPrice / 12)}/mo)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      plan.popular ? "bg-accent/20" : "bg-primary/10"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-accent" : "text-primary"}`} />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-accent/25"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
                size="lg"
              >
                <Link href="/auth/sign-up">{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className={`text-center mt-12 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">30-day money-back guarantee</span>
            {" "}— Try risk-free
          </p>
        </div>
      </div>
    </section>
  )
}
