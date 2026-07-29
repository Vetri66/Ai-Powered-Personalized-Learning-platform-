import React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EducatorSidebar } from "@/components/educator/sidebar"
import { EducatorHeader } from "@/components/educator/header"

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role === "student") {
    redirect("/student/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <EducatorSidebar />
      <div className="lg:pl-72">
        <EducatorHeader />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
