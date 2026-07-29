"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  Brain
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

export function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
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
      }
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 hidden lg:block",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="h-full flex flex-col glass border-r border-border/50">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-accent/25">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              {!isCollapsed && <span className="text-xl font-bold gradient-text">StudyBuddy AI</span>}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-muted-foreground", isCollapsed && "hidden")}
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border border-accent/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      isCollapsed && "justify-center px-3"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-accent" : "group-hover:text-accent"
                    )} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-border/50">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/8 via-white/60 to-violet-500/8 border border-emerald-500/10",
              isCollapsed && "justify-center"
            )}>
                <Avatar className="w-10 h-10 border-2 border-emerald-400/20">
                <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-primary to-violet-500 text-primary-foreground text-sm">
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || "Student"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className={cn(
                "w-full mt-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>

          {/* Collapse Toggle */}
          {isCollapsed && (
            <div className="p-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground"
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
