import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import { createAdminClient } from '@/lib/supabase/admin'

async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nvidia/nv-embedqa-e5-v5',
      input: text,
      input_type: 'passage',
      encoding_format: 'float',
      truncate: 'END'
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.error || 'Embedding failed')
  return data.data[0].embedding
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const formData = await request.formData()
        const file = formData.get('file') as File
        const courseId = formData.get('courseId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // 1. Extract text based on file type
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        let text = ''

        if (file.name.endsWith('.pdf')) {
            const pdfData = await pdf(buffer)
            text = pdfData.text
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
            text = buffer.toString('utf-8')
        } else if (file.name.match(/\.(png|jpg|jpeg)$/i)) {
            text = `Image file: ${file.name}. This is an image that was uploaded for context.`
        } else {
            text = buffer.toString('utf-8')
        }

        if (!text.trim()) {
            return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 })
        }

        // 2. Chunk Text
        const chunks = splitTextIntoChunks(text, 1000)

        // 3. Delete old data for this course before inserting new
        const { error: deleteError } = await supabase
            .from('course_materials')
            .delete()
            .eq('course_id', courseId || 'general')
        if (deleteError) console.error('Delete old data error:', deleteError)
        else console.log(`[Upload] Cleared old data for course: ${courseId || 'general'}`)

        let storedCount = 0
        console.log(`Processing file: ${file.name} for course: ${courseId || 'general'} with ${chunks.length} chunks`)

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk)

            // Store in Supabase 'course_materials' table
            // Explicitly mapping all fields including 'course_id' as 'general' if missing
            const insertPayload = {
                course_id: courseId || 'general',
                content: chunk,
                embedding: embedding, // pgvector column (vector(768))
                metadata: { filename: file.name, chunk_index: chunks.indexOf(chunk) }
            }

            const { data: insertedData, error } = await supabase
                .from('course_materials')
                .insert(insertPayload)
                .select()

            if (error) {
                // Log FULL error object structure for debugging
                console.error('Supabase Insert Error Full Object:', JSON.stringify(error, null, 2))
                console.error('Failed Payload:', JSON.stringify(insertPayload, null, 2))
            } else {
                if (insertedData && insertedData.length > 0) {
                    storedCount++
                } else {
                    console.warn('Insert appeared successful but returned no data.')
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${storedCount} chunks from ${file.name}`,
            chunks: storedCount,
            totalDetectedChunks: chunks.length
        })

    } catch (error: any) {
        console.error('Upload Context Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

// Helper: Split text into chunks (~1000 chars)
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
    // Simple heuristic: split by newlines first to preserve paragraph integrity if possible,
    // then group into chunks. If a paragraph is too long, strictly slice it.

    const cleanText = text.replace(/\s+/g, ' ').trim()
    const chunks: string[] = []

    for (let i = 0; i < cleanText.length; i += chunkSize) {
        chunks.push(cleanText.slice(i, i + chunkSize))
    }

    return chunks
}
