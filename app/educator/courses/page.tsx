"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Users,
  Star,
  Clock,
  BookOpen,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Eye,
  TrendingUp,
  Sparkles,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";

const courses = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    description: "Master the core concepts of ML from algorithms to neural networks",
    thumbnail: "/ml-course.jpg",
    status: "published",
    students: 2847,
    rating: 4.9,
    reviews: 1256,
    revenue: 28470,
    lessons: 86,
    duration: "42h",
    completion: 78,
    category: "AI & ML",
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    title: "Full-Stack Web Development",
    description: "Build modern web applications with React, Node.js, and databases",
    thumbnail: "/web-course.jpg",
    status: "published",
    students: 1924,
    rating: 4.7,
    reviews: 892,
    revenue: 19240,
    lessons: 124,
    duration: "68h",
    completion: 72,
    category: "Web Dev",
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    title: "Data Science with Python",
    description: "Analyze data, create visualizations, and build predictive models",
    thumbnail: "/data-course.jpg",
    status: "published",
    students: 1567,
    rating: 4.8,
    reviews: 723,
    revenue: 15670,
    lessons: 92,
    duration: "48h",
    completion: 68,
    category: "Data Science",
    lastUpdated: "3 days ago",
  },
  {
    id: "4",
    title: "Cloud Architecture on AWS",
    description: "Design and deploy scalable applications on Amazon Web Services",
    thumbnail: "/cloud-course.jpg",
    status: "draft",
    students: 0,
    rating: 0,
    reviews: 0,
    revenue: 0,
    lessons: 45,
    duration: "24h",
    completion: 65,
    category: "Cloud",
    lastUpdated: "Just now",
  },
  {
    id: "5",
    title: "Advanced React Patterns",
    description: "Master advanced React concepts, hooks, and performance optimization",
    thumbnail: "/react-course.jpg",
    status: "review",
    students: 0,
    rating: 0,
    reviews: 0,
    revenue: 0,
    lessons: 38,
    duration: "18h",
    completion: 95,
    category: "Web Dev",
    lastUpdated: "5 hours ago",
  },
];

const statsOverview = [
  { label: "Total Courses", value: "24", icon: BookOpen, color: "text-blue-500" },
  { label: "Active Students", value: "8,439", icon: Users, color: "text-emerald-500" },
  { label: "Total Revenue", value: "$128,470", icon: TrendingUp, color: "text-amber-500" },
  { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-violet-500" },
];

export default function EducatorCoursesPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Courses
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track your course portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 bg-transparent">
            <Sparkles className="h-4 w-4" />
            AI Course Builder
          </Button>
          <Button className="h-11 rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {statsOverview.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl pl-11 bg-muted/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 rounded-xl gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div className="flex items-center rounded-xl border border-border/50 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className={`group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${
              viewMode === "list" ? "flex-row" : ""
            }`}
          >
            {/* Thumbnail */}
            <div
              className={`relative overflow-hidden ${
                viewMode === "list" ? "w-48 shrink-0" : ""
              }`}
            >
              <div
                className={`bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 ${
                  viewMode === "list" ? "h-full" : "aspect-video"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/30" />
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <Badge
                  className={`${
                    course.status === "published"
                      ? "bg-emerald-500/90 text-white"
                      : course.status === "draft"
                      ? "bg-amber-500/90 text-white"
                      : "bg-blue-500/90 text-white"
                  }`}
                >
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur-sm"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardContent className={`p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {course.category}
                  </Badge>
                  <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold">
                      {course.students > 0 ? course.students.toLocaleString() : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">
                      {course.rating > 0 ? course.rating : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="font-semibold">
                      {course.revenue > 0 ? `$${(course.revenue / 1000).toFixed(1)}k` : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>

              {/* Progress or Actions */}
              {course.status === "draft" || course.status === "review" ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{course.completion}%</span>
                  </div>
                  <Progress value={course.completion} className="h-2" />
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration}</span>
                    <span className="mx-1">•</span>
                    <span>{course.lessons} lessons</span>
                  </div>
                  <span className="text-muted-foreground">{course.lastUpdated}</span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg h-9 bg-transparent"
                  asChild
                >
                  <Link href={`/educator/courses/${course.id}`}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-lg h-9 bg-gradient-to-r from-primary to-primary/80"
                  asChild
                >
                  <Link href={`/educator/courses/${course.id}/analytics`}>
                    <BarChart3 className="mr-2 h-3 w-3" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
