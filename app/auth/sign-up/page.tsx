"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, GraduationCap, BookOpen, Stars, Zap, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const roles = [
  {
    id: "student",
    label: "Student",
    description: "Learn with AI-powered tutoring",
    icon: GraduationCap,
  },
  {
    id: "educator",
    label: "Educator",
    description: "Create courses and track students",
    icon: BookOpen,
  },
]

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "educator">("student")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-[100px] animate-float" />
        
        {/* Floating Icons */}
        <div className="absolute top-20 left-20 text-primary/20 animate-float">
          <Brain className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-32 text-accent/20 animate-float-delayed">
          <Stars className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 right-20 text-primary/20 animate-float">
          <Zap className="w-7 h-7" />
        </div>
        <div className="absolute bottom-20 left-32 text-accent/20 animate-float-delayed">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-accent/30 group-hover:shadow-accent/40 transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-7 h-7 text-primary-foreground animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-accent to-primary rounded-full animate-pulse" />
          </div>
          <span className="text-3xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">LearnAI</span>
        </Link>

        <Card className="glass border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-up">
          <CardHeader className="text-center pb-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Create Account</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Start your personalized learning journey</CardDescription>
            <div className="flex items-center justify-center gap-1 mt-2 text-accent/60">
              <Stars className="w-4 h-4" />
              <span className="text-sm font-medium">Join 10,000+ learners</span>
              <Stars className="w-4 h-4" />
            </div>
          </CardHeader>

          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-scale-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as "student" | "educator")}
                      className={cn(
                        "relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group hover:-translate-y-1 hover:shadow-lg",
                        role === r.id
                          ? "border-accent bg-gradient-to-br from-accent/5 to-primary/5 shadow-xl shadow-accent/20 scale-105"
                          : "border-border hover:border-accent/50 hover:bg-muted/50 hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                        role === r.id
                          ? "bg-gradient-to-br from-primary to-accent shadow-lg animate-pulse"
                          : "bg-muted group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-accent/10"
                      )}>
                        <r.icon className={cn(
                          "w-6 h-6 transition-all duration-300",
                          role === r.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent group-hover:scale-110"
                        )} />
                      </div>
                      <div className={cn(
                        "font-semibold text-base mb-1 transition-colors",
                        role === r.id ? "text-accent" : "group-hover:text-accent"
                      )}>{r.label}</div>
                      <div className="text-sm text-muted-foreground">{r.description}</div>
                      
                      {/* Enhanced selected indicator */}
                      {role === r.id && (
                        <div className="absolute top-3 right-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent to-primary animate-pulse" />
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-accent/30 animate-ping" />
                        </div>
                      )}
                      
                      {/* Hover glow effect */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl transition-opacity duration-300",
                        role === r.id ? "opacity-100" : "opacity-0 group-hover:opacity-50",
                        "bg-gradient-to-br from-primary/5 to-accent/5"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-12 border-2 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-2 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-12 h-12 border-2 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 bg-background/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          password.length > i * 2
                            ? password.length >= 8
                              ? "bg-green-500"
                              : password.length >= 6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-accent/30 hover:shadow-accent/40 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="text-center space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
                  <span className="text-xs text-muted-foreground font-medium">OR</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-accent hover:text-accent/80 font-semibold transition-all duration-200 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
