import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is an educator
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "educator") {
      return NextResponse.json(
        { error: "Only educators can create courses" },
        { status: 403 }
      )
    }

    const { title, description, category, difficulty, thumbnailUrl } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      )
    }

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        educator_id: user.id,
        title,
        description,
        category: category || "General",
        difficulty: difficulty || "beginner",
        thumbnail_url: thumbnailUrl,
        is_published: false
      })
      .select()
      .single()

    if (error) {
      console.error("Course creation error:", error)
      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error("Course creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
