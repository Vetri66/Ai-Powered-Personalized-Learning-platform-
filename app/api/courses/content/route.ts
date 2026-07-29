import { NextRequest, NextResponse } from 'next/server'
import { AdaptiveLearningOrchestrator } from '@/lib/ai/adaptive-learning-orchestrator'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { createClient } from '@/lib/supabase/server'
import { Course } from '@/lib/mongodb/models'
import PDFParse from 'pdf-parse'

const orchestrator = new AdaptiveLearningOrchestrator()

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const courseId = formData.get('courseId') as string
    const file = formData.get('file') as File
    const contentType = formData.get('type') as 'pdf' | 'text' | 'video' | 'code'
    const source = formData.get('source') as string

    if (!courseId || !file || !contentType || !source) {
      return NextResponse.json(
        { error: 'courseId, file, type, and source are required' },
        { status: 400 }
      )
    }

    // Verify course exists and user has access
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Extract content based on file type
    let extractedContent = ''
    const buffer = Buffer.from(await file.arrayBuffer())

    switch (contentType) {
      case 'pdf':
        const pdfData = await PDFParse(buffer)
        extractedContent = pdfData.text
        break
      case 'text':
        extractedContent = buffer.toString('utf-8')
        break
      case 'code':
        extractedContent = buffer.toString('utf-8')
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported content type' },
          { status: 400 }
        )
    }

    if (!extractedContent.trim()) {
      return NextResponse.json(
        { error: 'No content could be extracted from the file' },
        { status: 400 }
      )
    }

    // Process content through RAG pipeline
    await orchestrator.processCourseContent(courseId, extractedContent, {
      source,
      type: contentType,
      filename: file.name,
      size: file.size,
      uploadedBy: user.id,
      uploadedAt: new Date()
    })

    // Update course content
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        content: {
          type: contentType,
          data: extractedContent,
          metadata: {
            source,
            filename: file.name,
            size: file.size,
            uploadedBy: user.id,
            uploadedAt: new Date()
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Content processed and added to course',
      data: {
        contentLength: extractedContent.length,
        filename: file.name,
        type: contentType,
        source
      }
    })
  } catch (error) {
    console.error('Content processing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving course content
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

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      )
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        courseId,
        title: course.title,
        content: course.content.map(c => ({
          type: c.type,
          source: c.metadata?.source || 'Unknown',
          filename: c.metadata?.filename || 'Unknown',
          size: c.metadata?.size || 0,
          uploadedAt: c.metadata?.uploadedAt || null,
          contentPreview: c.data.substring(0, 200) + '...'
        })),
        embeddingsCount: course.embeddings.length,
        totalStudents: course.students.length
      }
    })
  } catch (error) {
    console.error('Content retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}