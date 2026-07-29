import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  BookOpen, 
  Search, 
  Clock, 
  Users, 
  Star,
  ArrowRight,
  Filter,
  Plus
} from "lucide-react"

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all published courses
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      educator:profiles!courses_educator_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Fetch user's enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", user?.id)

  const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || [])

  const categories = ["All", "Programming", "Data Science", "Design", "Business", "Marketing"]
  const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Browse Courses</h1>
          <p className="text-muted-foreground">Discover courses to expand your knowledge</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <Badge
            key={category}
            variant={index === 0 ? "default" : "outline"}
            className={index === 0 
              ? "bg-gradient-to-r from-primary to-accent cursor-pointer" 
              : "cursor-pointer hover:bg-muted"
            }
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Courses Grid */}
      {courses && courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id)
            
            return (
              <Card key={course.id} className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Course Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {course.category || "General"}
                    </Badge>
                    {isEnrolled && (
                      <Badge className="bg-green-500/90 text-white">Enrolled</Badge>
                    )}
                  </div>
                  
                  {/* Difficulty */}
                  <div className="absolute bottom-3 left-3">
                    <Badge 
                      variant="outline" 
                      className={`bg-background/80 backdrop-blur-sm ${
                        course.difficulty === "advanced" 
                          ? "border-red-500/50 text-red-500" 
                          : course.difficulty === "intermediate"
                          ? "border-yellow-500/50 text-yellow-500"
                          : "border-green-500/50 text-green-500"
                      }`}
                    >
                      {course.difficulty || "Beginner"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Course Title */}
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description || "No description available"}
                  </p>
                  
                  {/* Instructor */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs text-primary-foreground">
                      {course.educator?.full_name?.[0] || "E"}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {course.educator?.full_name || "Unknown Instructor"}
                    </span>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>8 hours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 1000) + 100}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{(4 + Math.random()).toFixed(1)}</span>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <Button
                    asChild
                    className={`w-full ${
                      isEnrolled 
                        ? "" 
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    }`}
                    variant={isEnrolled ? "outline" : "default"}
                  >
                    <Link href={`/student/courses/${course.id}`}>
                      {isEnrolled ? "Continue Learning" : "Enroll Now"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No courses available yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Our educators are working on creating amazing courses. Check back soon!
          </p>
        </Card>
      )}
    </div>
  )
}
