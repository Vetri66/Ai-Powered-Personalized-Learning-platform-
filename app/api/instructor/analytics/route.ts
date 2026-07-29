import { NextRequest, NextResponse } from 'next/server'
import { AdaptiveLearningOrchestrator } from '@/lib/ai/adaptive-learning-orchestrator'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { createClient } from '@/lib/supabase/server'
import { Course, User } from '@/lib/mongodb/models'

const orchestrator = new AdaptiveLearningOrchestrator()

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is an educator
    const userDoc = await User.findOne({ supabaseId: user.id })
    if (!userDoc || userDoc.role !== 'educator') {
      return NextResponse.json(
        { error: 'Access denied. Educator role required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const type = searchParams.get('type') // 'overview', 'students', 'alerts', 'content-gaps'

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      )
    }

    // Verify educator owns the course
    const course = await Course.findById(courseId)
    if (!course || course.educatorId !== user.id) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      )
    }

    let data
    switch (type) {
      case 'overview':
        data = await orchestrator.getCourseAnalytics(courseId)
        break
      case 'students':
        data = await orchestrator.getStudentInsights(courseId)
        break
      case 'alerts':
        data = await orchestrator.getInstructorAlerts(courseId)
        break
      case 'content-gaps':
        const analytics = await orchestrator.getCourseAnalytics(courseId)
        data = {
          contentGaps: analytics.contentGaps,
          confusingTopics: analytics.confusingTopics,
          learningBottlenecks: analytics.learningBottlenecks,
          improvementSuggestions: analytics.improvementSuggestions
        }
        break
      default:
        // Return comprehensive dashboard data
        const [courseAnalytics, studentInsights, alerts] = await Promise.all([
          orchestrator.getCourseAnalytics(courseId),
          orchestrator.getStudentInsights(courseId),
          orchestrator.getInstructorAlerts(courseId)
        ])
        
        data = {
          overview: courseAnalytics,
          students: studentInsights.slice(0, 10), // Top 10 students needing attention
          alerts: alerts.filter(alert => !alert.resolved).slice(0, 5), // Top 5 unresolved alerts
          summary: {
            totalStudents: courseAnalytics.totalStudents,
            activeStudents: courseAnalytics.activeStudents,
            averageConfidence: courseAnalytics.averageConfidence,
            atRiskStudents: studentInsights.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
            criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.resolved).length
          }
        }
        break
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Instructor analytics error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}