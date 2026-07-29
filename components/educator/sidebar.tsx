"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Calendar,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/educator/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/educator/courses", icon: BookOpen, label: "My Courses" },
  { href: "/educator/students", icon: Users, label: "Students" },
  { href: "/educator/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/educator/content", icon: FileText, label: "Content Studio" },
  { href: "/educator/schedule", icon: Calendar, label: "Schedule" },
  { href: "/educator/messages", icon: MessageSquare, label: "Messages" },
  { href: "/educator/ai-assistant", icon: Sparkles, label: "AI Assistant" },
];

const bottomItems = [
  { href: "/educator/notifications", icon: Bell, label: "Notifications" },
  { href: "/educator/settings", icon: Settings, label: "Settings" },
];

export function EducatorSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-border/50 px-4">
        <Link href="/educator/dashboard" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent shadow-lg shadow-primary/25">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">
                LearnAI
              </span>
              <span className="text-xs text-muted-foreground">Educator Portal</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-9 w-9 rounded-lg hover:bg-primary/10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/15 to-accent/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary" : ""
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
        <div className="flex flex-col gap-2">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
