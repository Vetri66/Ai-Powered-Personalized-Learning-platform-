import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  BookOpen, 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Play,
  MessageSquare,
  Award
} from "lucide-react"

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  // Fetch enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses (
        id,
        title,
        description,
        thumbnail_url,
        category,
        difficulty
      )
    `)
    .eq("student_id", user?.id)
    .order("enrolled_at", { ascending: false })
    .limit(4)

  // Fetch recent chat sessions
  const { data: recentChats } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("student_id", user?.id)
    .order("updated_at", { ascending: false })
    .limit(3)

  // Get stats
  const { count: totalCourses } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user?.id)

  const { count: totalChats } = await supabase
    .from("chat_sessions")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user?.id)

  const stats = [
    { 
      label: "Enrolled Courses", 
      value: totalCourses || 0, 
      icon: BookOpen, 
      color: "from-blue-500 to-cyan-500",
      href: "/student/courses"
    },
    { 
      label: "AI Sessions", 
      value: totalChats || 0, 
      icon: Brain, 
      color: "from-purple-500 to-pink-500",
      href: "/student/chat-history"
    },
    { 
      label: "Study Hours", 
      value: Math.floor(Math.random() * 50) + 10, 
      icon: Clock, 
      color: "from-orange-500 to-red-500",
      href: "/student/analytics"
    },
    { 
      label: "Mastery Score", 
      value: `${Math.floor(Math.random() * 30) + 70}%`, 
      icon: Target, 
      color: "from-green-500 to-emerald-500",
      href: "/student/analytics"
    },
  ]

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-2xl border border-border/50 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Dashboard", href: "/student/dashboard" },
            { label: "My Courses", href: "/student/courses" },
            { label: "AI Tutor", href: "/student/ai-tutor" },
            { label: "Chat History", href: "/student/chat-history" },
            { label: "Analytics", href: "/student/analytics" },
            { label: "Settings", href: "/student/settings" },
            { label: "Forest", href: "/student/forest" },
          ].map((item) => (
            <Button key={item.label} asChild variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground hover:text-foreground">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge className="mb-3 bg-primary-foreground/20 text-primary-foreground border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Learning
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              {greeting}, {profile?.full_name?.split(' ')[0] || "Learner"}!
            </h1>
            <p className="text-primary-foreground/80 max-w-lg">
              Ready to continue your learning journey? Your AI tutor is here to help you master any subject.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              asChild 
              size="lg" 
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 shadow-xl"
            >
              <Link href="/student/ai-tutor">
                <Brain className="w-5 h-5 mr-2" />
                Start AI Session
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/student/courses">
                Browse Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="group hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Courses - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Continue Learning</h2>
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link href="/student/courses">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {enrollments && enrollments.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Course Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary/40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {enrollment.course?.category || "General"}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={
                          enrollment.course?.difficulty === "advanced" 
                            ? "border-red-500/50 text-red-500" 
                            : enrollment.course?.difficulty === "intermediate"
                            ? "border-yellow-500/50 text-yellow-500"
                            : "border-green-500/50 text-green-500"
                        }
                      >
                        {enrollment.course?.difficulty || "Beginner"}
                      </Badge>
                    </div>
                    {/* Play Button Overlay */}
                    <Link 
                      href={`/student/courses/${enrollment.course?.id}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-xl">
                        <Play className="w-6 h-6 text-primary-foreground ml-1" />
                      </div>
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 truncate group-hover:text-accent transition-colors">
                      {enrollment.course?.title || "Untitled Course"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {enrollment.course?.description || "No description available"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{enrollment.progress || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button asChild>
                <Link href="/student/courses">
                  Browse Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/student/ai-tutor">
                  <Brain className="w-4 h-4 mr-2 text-accent" />
                  Ask AI Tutor
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/student/courses">
                  <BookOpen className="w-4 h-4 mr-2 text-accent" />
                  Find New Course
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/student/analytics">
                  <TrendingUp className="w-4 h-4 mr-2 text-accent" />
                  View Progress
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent AI Sessions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent AI Sessions</CardTitle>
              <CardDescription>Continue your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {recentChats && recentChats.length > 0 ? (
                <div className="space-y-3">
                  {recentChats.map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/student/ai-tutor?session=${chat.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                          {chat.title || "Untitled Session"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No chat sessions yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Analytics Chart */}
          <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Learning Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 flex items-end justify-between gap-2">
                  {[65, 78, 45, 89, 72, 56, 94].map((height, index) => (
                    <div key={index} className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-sm" style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">This Week</span>
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      +12% vs last week
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
