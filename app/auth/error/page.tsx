import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-destructive/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-accent/25">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold gradient-text">LearnAI</span>
        </Link>

        <Card className="glass border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
            <CardDescription>Something went wrong during authentication</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              This could happen if the confirmation link has expired or has already been used.
              Please try signing in again or request a new confirmation email.
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link href="/auth/login">
                  Try Again
                  <RefreshCw className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/sign-up">
                  Create New Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Link href="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
