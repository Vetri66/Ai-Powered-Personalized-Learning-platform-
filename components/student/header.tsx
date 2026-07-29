"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  Search,
  Bell,
  Brain,
  User,
  Edit,
  Flame
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role: string
}

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/student/courses", icon: BookOpen },
  { name: "AI Tutor", href: "/student/ai-tutor", icon: Brain },
  { name: "Chat History", href: "/student/chat-history", icon: MessageSquare },
  { name: "Analytics", href: "/student/analytics", icon: BarChart3 },
  { name: "Settings", href: "/student/settings", icon: Settings },
]

export function StudentHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUser({
          id: authUser.id,
          email: authUser.email,
          full_name: profile?.full_name || authUser.user_metadata?.full_name,
          avatar_url: profile?.avatar_url,
          role: profile?.role || 'student'
        })
        // Fetch real streak from chat sessions
        const res = await fetch('/api/chat/sessions')
        if (res.ok) {
          const sessions = await res.json()
          const dates = new Set(sessions.map((s: any) => new Date(s.updated_at).toISOString().split('T')[0]))
          let count = 0
          const d = new Date()
          while (dates.has(d.toISOString().split('T')[0])) {
            count++
            d.setDate(d.getDate() - 1)
          }
          setStreak(count)
        }
      }
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="w-10 h-10 bg-muted rounded animate-pulse" />
          <div className="w-32 h-8 bg-muted rounded animate-pulse" />
          <div className="w-10 h-10 bg-muted rounded animate-pulse" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border/50">
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold gradient-text">StudyBuddy AI</span>
                </Link>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive 
                          ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "text-accent")} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, lessons..."
              className="pl-10 bg-muted/30 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                <Avatar className="w-8 h-8 border border-border/50">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                    {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">{user?.full_name || "Student"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.full_name || "Student"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/dashboard" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/student/settings" className="flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between cursor-default">
                <div className="flex items-center">
                  <Flame className="w-4 h-4 mr-2 text-orange-500" />
                  Current Streak
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                  {streak} days
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/student/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
