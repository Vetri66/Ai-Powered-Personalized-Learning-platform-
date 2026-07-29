"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Play,
  CheckCircle2,
  Lock,
  Clock,
  Users,
  Star,
  BookOpen,
  MessageSquare,
  FileText,
  Download,
  Award,
  Sparkles,
  ArrowRight,
  Video,
  FileQuestion,
  Code,
} from "lucide-react";

// Mock course data
const courseData = {
  id: "1",
  title: "Machine Learning Fundamentals",
  description: "Master the core concepts of machine learning, from basic algorithms to neural networks. This comprehensive course covers supervised and unsupervised learning, feature engineering, model evaluation, and practical applications.",
  instructor: {
    name: "Dr. Sarah Chen",
    avatar: "SC",
    title: "ML Research Lead at TechCorp",
    students: 12500,
    courses: 8,
    rating: 4.9,
  },
  stats: {
    enrolled: 2847,
    rating: 4.9,
    reviews: 1256,
    hours: 42,
    modules: 12,
    lessons: 86,
  },
  progress: 45,
  modules: [
    {
      id: "m1",
      title: "Introduction to Machine Learning",
      duration: "2h 30m",
      lessons: [
        { id: "l1", title: "What is Machine Learning?", duration: "15m", type: "video", completed: true },
        { id: "l2", title: "Types of ML: Supervised vs Unsupervised", duration: "20m", type: "video", completed: true },
        { id: "l3", title: "Setting Up Your Environment", duration: "25m", type: "video", completed: true },
        { id: "l4", title: "Module Quiz", duration: "15m", type: "quiz", completed: true },
      ],
    },
    {
      id: "m2",
      title: "Linear Regression",
      duration: "3h 15m",
      lessons: [
        { id: "l5", title: "Understanding Linear Models", duration: "25m", type: "video", completed: true },
        { id: "l6", title: "Cost Functions & Optimization", duration: "30m", type: "video", completed: true },
        { id: "l7", title: "Implementing Linear Regression", duration: "45m", type: "code", completed: false },
        { id: "l8", title: "Hands-on Project", duration: "60m", type: "project", completed: false },
        { id: "l9", title: "Module Assessment", duration: "20m", type: "quiz", completed: false },
      ],
    },
    {
      id: "m3",
      title: "Classification Algorithms",
      duration: "4h",
      lessons: [
        { id: "l10", title: "Logistic Regression", duration: "30m", type: "video", completed: false },
        { id: "l11", title: "Decision Trees", duration: "35m", type: "video", completed: false },
        { id: "l12", title: "Random Forests", duration: "40m", type: "video", completed: false },
        { id: "l13", title: "SVM Explained", duration: "45m", type: "video", completed: false },
        { id: "l14", title: "Classification Project", duration: "90m", type: "project", completed: false },
      ],
    },
    {
      id: "m4",
      title: "Neural Networks Deep Dive",
      duration: "5h",
      locked: true,
      lessons: [],
    },
  ],
  resources: [
    { name: "Course Slides (PDF)", size: "15.2 MB", type: "pdf" },
    { name: "Python Notebooks", size: "8.7 MB", type: "code" },
    { name: "Dataset Collection", size: "124 MB", type: "data" },
    { name: "Cheat Sheet", size: "2.1 MB", type: "pdf" },
  ],
};

const getLessonIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    case "quiz":
      return FileQuestion;
    case "code":
    case "project":
      return Code;
    default:
      return FileText;
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/courses">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {courseData.title}
          </h1>
          <p className="text-muted-foreground">Course ID: {params.courseId}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Placeholder */}
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
              <Button
                size="lg"
                className="h-20 w-20 rounded-full bg-primary/90 hover:bg-primary shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-110"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  42 hours total
                </Badge>
                <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                  HD Quality
                </Badge>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="curriculum" className="rounded-lg">
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded-lg">
                Resources
              </TabsTrigger>
              <TabsTrigger value="discussion" className="rounded-lg">
                Discussion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-6 space-y-4">
              {courseData.modules.map((module, moduleIndex) => (
                <Card
                  key={module.id}
                  className={`border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                    module.locked ? "opacity-60" : "hover:shadow-lg"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                            module.locked
                              ? "bg-muted text-muted-foreground"
                              : "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
                          }`}
                        >
                          {module.locked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            moduleIndex + 1
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {module.duration} • {module.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                      {!module.locked && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {module.lessons.filter((l) => l.completed).length}/{module.lessons.length} Complete
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  {!module.locked && (
                    <CardContent className="space-y-2">
                      {module.lessons.map((lesson) => {
                        const Icon = getLessonIcon(lesson.type);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson.id)}
                            className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
                              activeLesson === lesson.id
                                ? "bg-primary/10 ring-2 ring-primary/20"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                lesson.completed
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {lesson.completed ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Icon className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${lesson.completed ? "text-muted-foreground" : ""}`}>
                                {lesson.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lesson.duration}
                              </p>
                            </div>
                            {!lesson.completed && (
                              <Play className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">About This Course</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {courseData.description}
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{courseData.stats.modules} Modules</p>
                        <p className="text-sm text-muted-foreground">{courseData.stats.lessons} Lessons</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{courseData.stats.hours} Hours</p>
                        <p className="text-sm text-muted-foreground">Total Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Certificate</p>
                        <p className="text-sm text-muted-foreground">Upon Completion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">AI Tutor</p>
                        <p className="text-sm text-muted-foreground">24/7 Support</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                  {courseData.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-muted-foreground">{resource.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-lg">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Join the Discussion</h3>
                  <p className="mt-2 text-muted-foreground">
                    Connect with fellow learners and get help from the community.
                  </p>
                  <Button className="mt-4 rounded-xl">Start a Discussion</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-24">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative mx-auto h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="stroke-muted"
                      strokeWidth="8"
                      fill="none"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="stroke-primary transition-all duration-500"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      r="42"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${courseData.progress * 2.64} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{courseData.progress}%</span>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">Course Progress</p>
              </div>

              <div className="mt-6 space-y-4">
                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 gap-2">
                  Continue Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-xl gap-2 bg-transparent">
                  <Sparkles className="h-4 w-4" />
                  Ask AI Tutor
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next lesson</span>
                  <span className="font-medium">Implementing Linear Regression</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Your Instructor</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                    {courseData.instructor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{courseData.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">{courseData.instructor.title}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-lg font-bold">{(courseData.instructor.students / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-lg font-bold">{courseData.instructor.courses}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold">{courseData.instructor.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Enrolled</span>
                </div>
                <span className="font-medium">{courseData.stats.enrolled.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{courseData.stats.rating}</span>
                  <span className="text-muted-foreground">({courseData.stats.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <span className="font-medium">{courseData.stats.hours} hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
