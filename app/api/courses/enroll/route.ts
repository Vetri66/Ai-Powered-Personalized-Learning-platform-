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

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: user.id,
        course_id: courseId,
        progress: 0,
        status: "active"
      })
      .select()
      .single()

    if (error) {
      console.error("Enrollment error:", error)
      return NextResponse.json(
        { error: "Failed to enroll in course" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
