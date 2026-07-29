"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function EducatorHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-8 backdrop-blur-xl">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div
          className={`relative transition-all duration-300 ${
            searchFocused ? "w-96" : "w-80"
          }`}
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses, students, content..."
            className="h-12 rounded-xl border-border/50 bg-muted/30 pl-11 pr-4 text-sm transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
            /
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Create Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30">
              <Plus className="h-4 w-4" />
              <span>Create</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuItem className="rounded-lg py-3 cursor-pointer">
              <Sparkles className="mr-3 h-4 w-4 text-primary" />
              New Course with AI
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg py-3 cursor-pointer">
              <Plus className="mr-3 h-4 w-4" />
              New Course Manual
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg py-3 cursor-pointer">
              Add Learning Material
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg py-3 cursor-pointer">
              Create Assessment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-xl hover:bg-muted/50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 gap-3 rounded-xl px-3 hover:bg-muted/50"
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                  {user?.email ? getInitials(user.email) : "ED"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium">
                  {user?.user_metadata?.full_name || "Educator"}
                </span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">My Account</span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg py-3 cursor-pointer">
              <User className="mr-3 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg py-3 cursor-pointer">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="rounded-lg py-3 text-destructive cursor-pointer focus:text-destructive"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
