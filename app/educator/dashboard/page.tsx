"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Star,
  Clock,
  Target,
  Zap,
  Award,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const statsData = [
  {
    title: "Total Students",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Active Courses",
    value: "24",
    change: "+3",
    trend: "up",
    icon: BookOpen,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Completion Rate",
    value: "78.4%",
    change: "+5.2%",
    trend: "up",
    icon: Target,
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-500/10",
  },
  {
    title: "Revenue",
    value: "$48,290",
    change: "+18.3%",
    trend: "up",
    icon: DollarSign,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
  },
];

const enrollmentData = [
  { month: "Jan", students: 180, revenue: 4200 },
  { month: "Feb", students: 220, revenue: 5100 },
  { month: "Mar", students: 290, revenue: 6800 },
  { month: "Apr", students: 340, revenue: 8200 },
  { month: "May", students: 420, revenue: 9800 },
  { month: "Jun", students: 480, revenue: 11200 },
  { month: "Jul", students: 520, revenue: 12100 },
];

const coursePerformance = [
  { name: "Machine Learning", students: 856, completion: 82, rating: 4.9 },
  { name: "Web Development", students: 724, completion: 76, rating: 4.7 },
  { name: "Data Science", students: 612, completion: 71, rating: 4.8 },
  { name: "Cloud Computing", students: 445, completion: 68, rating: 4.6 },
];

const engagementData = [
  { name: "Video", value: 45, color: "#3b82f6" },
  { name: "Quizzes", value: 25, color: "#8b5cf6" },
  { name: "Projects", value: 20, color: "#10b981" },
  { name: "Forums", value: 10, color: "#f59e0b" },
];

const recentActivity = [
  {
    type: "enrollment",
    user: "Sarah Chen",
    action: "enrolled in",
    course: "Advanced ML",
    time: "2 min ago",
    avatar: "SC",
  },
  {
    type: "completion",
    user: "Michael Park",
    action: "completed",
    course: "Data Science Basics",
    time: "15 min ago",
    avatar: "MP",
  },
  {
    type: "review",
    user: "Emily Rodriguez",
    action: "left a 5-star review on",
    course: "Web Development",
    time: "1 hour ago",
    avatar: "ER",
  },
  {
    type: "question",
    user: "David Kim",
    action: "asked a question in",
    course: "Cloud Computing",
    time: "2 hours ago",
    avatar: "DK",
  },
];

const weeklyProgress = [
  { day: "Mon", hours: 4.5 },
  { day: "Tue", hours: 6.2 },
  { day: "Wed", hours: 5.8 },
  { day: "Thu", hours: 7.1 },
  { day: "Fri", hours: 4.9 },
  { day: "Sat", hours: 3.2 },
  { day: "Sun", hours: 2.8 },
];

export default function EducatorDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Educator Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here&apos;s your teaching overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 bg-transparent">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="h-11 rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Zap className="h-4 w-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl ${stat.bgColor} p-3`}>
                  <stat.icon className="h-6 w-6 text-foreground" />
                </div>
                <Badge
                  variant="secondary"
                  className={`gap-1 ${
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrollment Chart */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                Enrollment & Revenue
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Monthly performance overview
              </p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Content Engagement
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              How students interact with content
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {engagementData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}
                  </span>
                  <span className="ml-auto text-sm font-medium">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course Performance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                Top Performing Courses
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on enrollment and completion
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg gap-1">
              View All
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursePerformance.map((course, index) => (
              <div
                key={course.name}
                className="group flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{course.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {course.students}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{course.completion}%</span>
                      </div>
                      <Progress value={course.completion} className="mt-1 h-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                Recent Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest student interactions
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg gap-1">
              View All
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground text-xs font-medium">
                    {activity.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium text-primary">{activity.course}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
                {activity.type === "enrollment" && (
                  <Badge className="bg-blue-500/10 text-blue-500">New</Badge>
                )}
                {activity.type === "completion" && (
                  <Badge className="bg-emerald-500/10 text-emerald-500">
                    <Award className="mr-1 h-3 w-3" />
                    Done
                  </Badge>
                )}
                {activity.type === "review" && (
                  <Badge className="bg-amber-500/10 text-amber-500">
                    <Star className="mr-1 h-3 w-3 fill-amber-500" />
                    5.0
                  </Badge>
                )}
                {activity.type === "question" && (
                  <Badge className="bg-violet-500/10 text-violet-500">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Q&A
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">
              Student Learning Hours
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Average daily engagement this week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +23% vs last week
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)",
                  }}
                  formatter={(value: number) => [`${value} hours`, "Learning"]}
                />
                <Bar
                  dataKey="hours"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
