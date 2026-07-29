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

    const { courseId, materialId, progress } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Update or insert learning progress for this material
    if (materialId) {
      const { error: progressError } = await supabase
        .from("learning_progress")
        .upsert({
          student_id: user.id,
          course_id: courseId,
          material_id: materialId,
          completed: progress >= 100,
          progress_percentage: progress,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: "student_id,course_id,material_id"
        })

      if (progressError) {
        console.error("Progress update error:", progressError)
      }
    }

    // Calculate overall course progress
    const { data: materials } = await supabase
      .from("course_materials")
      .select("id")
      .eq("course_id", courseId)

    const totalMaterials = materials?.length || 1

    const { data: completedProgress } = await supabase
      .from("learning_progress")
      .select("progress_percentage")
      .eq("student_id", user.id)
      .eq("course_id", courseId)

    const totalProgress = completedProgress?.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) || 0
    const overallProgress = Math.round(totalProgress / totalMaterials)

    // Update enrollment progress
    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .update({
        progress: overallProgress,
        last_accessed: new Date().toISOString(),
        status: overallProgress >= 100 ? "completed" : "active"
      })
      .eq("student_id", user.id)
      .eq("course_id", courseId)

    if (enrollmentError) {
      console.error("Enrollment update error:", enrollmentError)
    }

    return NextResponse.json({ success: true, progress: overallProgress })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
