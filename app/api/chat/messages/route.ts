import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: 'https://integrate.api.nvidia.com/v1'
})

async function generateEmbedding(text: string, inputType: 'query' | 'passage' = 'passage'): Promise<number[]> {
  const res = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nvidia/nv-embedqa-e5-v5',
      input: text,
      input_type: inputType,
      encoding_format: 'float',
      truncate: 'END'
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.error || 'Embedding failed')
  return data.data[0].embedding
}

// GET: Fetch messages for a specific session
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('sessionId')

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Add a new message to a session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { sessionId, role, content, confidence, sources, followUpQuestions } = body

        if (!sessionId || !role || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Generate embedding for the message
        let embedding = null;
        try {
            const embeddingResult = await generateEmbedding(content, 'passage')
            embedding = embeddingResult
            console.log(`[Message Update] Embedding generated for message. Length: ${embedding.length}`)
        } catch (embedError) {
            console.error('Embedding generation failed:', embedError)
            // Continue without embedding (non-critical failure for saving message)
        }

        // Insert message
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                role,
                content,
                confidence,
                sources,
                follow_up_questions: followUpQuestions,
                embedding // Add embedding to the insert
            })
            .select()
            .single()

        if (error) {
            console.error('[Message Update] Error saving message:', error)
            throw error
        }

        console.log(`[Message Update] Message saved successfully. Has embedding: ${!!embedding}`)

        // Update session 'updated_at' timestamp
        await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId)

        // Optional: Update session title if it's the first user message and title is default
        if (role === 'user') {
            const { data: sessionData } = await supabase
                .from('chat_sessions')
                .select('title')
                .eq('id', sessionId)
                .single()

            if (sessionData && sessionData.title === 'New Chat') {
                await supabase
                    .from('chat_sessions')
                    .update({ title: content.substring(0, 30) + '...' })
                    .eq('id', sessionId)
            }
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
