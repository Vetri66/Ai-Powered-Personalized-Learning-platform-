import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSystemPromptInLanguage } from '@/lib/languages'
import type { LanguageCode } from '@/lib/languages'
import { getNvidiaClient } from '@/lib/ai/nvidia'
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
      input_type: 'query',
      encoding_format: 'float',
      truncate: 'END'
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.error || 'Embedding failed')
  return data.data[0].embedding
}

export async function POST(request: NextRequest) {
  let userMessage = ''
  try {
    const nvidia = getNvidiaClient()
    const supabaseAdmin = createAdminClient()
    const body = await request.json()
    const { message, courseContext, conversationHistory, language } = body
    userMessage = message

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Auth
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseAuth.auth.getUser()
    const studentId = user?.id

    // RAG - embed query
    const embedding = await generateEmbedding(message)

    // Retrieve course context - no threshold filter, get top matches
    const { data: matchedDocuments, error: ragError } = await supabaseAdmin.rpc('match_course_content', {
      query_embedding: embedding,
      match_threshold: 0.0,
      match_count: 5
    })
    console.log(`[RAG] Found ${matchedDocuments?.length || 0} documents, error: ${ragError?.message || 'none'}`)
    if (matchedDocuments?.length > 0) {
      console.log(`[RAG] Top match similarity: ${matchedDocuments[0].similarity}, preview: ${matchedDocuments[0].content?.substring(0, 80)}`)
    }

    // Retrieve chat memory
    let matchedChatHistory: any[] = []
    if (studentId) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: historyData } = await supabaseAdmin.rpc('match_chat_history', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 10,
        student_filter: studentId
      })
      matchedChatHistory = historyData || []
    }

    const ragContext = matchedDocuments?.map((doc: any) => doc.content).join('\n\n') || ''
    const ragSources = matchedDocuments?.map((doc: any) => `...${doc.content.substring(0, 100)}...`) || []
    const sourceFilename = matchedDocuments?.[0]?.metadata?.filename || null
    const chatMemoryContext = matchedChatHistory
      .map((msg: any) => `[${new Date(msg.created_at).toLocaleDateString()}] ${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n\n') || ''

    console.log(`[RAG Context] Length: ${ragContext.length}, Sources: ${ragSources.length}`)

    // Get language-specific prompt or use default
    const baseSystemPrompt = language 
      ? getSystemPromptInLanguage(language as LanguageCode)
      : getSystemPromptInLanguage('en')

    const systemPrompt = `${baseSystemPrompt}

You are helping a student with uploaded course materials.

CRITICAL RULES:
1. ALWAYS use the UPLOADED FILE CONTENT to answer - it is the primary source
2. If student says "this", "it", "the file", "what I uploaded" - use the FILE CONTENT
3. Mention the filename "${sourceFilename || 'uploaded file'}" when referencing the source
4. Simple questions: short direct answer
5. Complex questions: step-by-step with examples
6. Use **bold**, \`code\`, bullet points for clean formatting
7. If content is not in the file, say so clearly
8. Respond in the same language as the student's question

=== UPLOADED FILE: ${sourceFilename || 'No file uploaded'} ===
${ragContext || 'No file uploaded yet. Ask the student to upload a file first.'}
=== END OF FILE CONTENT ===

=== PAST CONVERSATION ===
${chatMemoryContext || 'No previous context.'}
=== END ===`

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory?.slice(-10).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) || []),
      { role: 'user', content: message }
    ]

    const completion = await nvidia.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages,
      temperature: 0.4,
      max_tokens: 1024,
    })

    const response = completion.choices[0].message.content || ''

    return NextResponse.json({
      response,
      confidence: 0.9,
      sources: ragSources.length > 0 ? ragSources : ['General Knowledge'],
      followUpQuestions: ['Explain in more detail', 'Give me an example', 'Quiz me on this'],
      timestamp: new Date().toISOString(),
      usedModel: 'meta/llama-3.3-70b-instruct',
      language: language || 'en'
    })

  } catch (error: any) {
    console.error('AI Tutor Error:', error)
    return NextResponse.json({
      response: `Sorry, I encountered an error processing: "${userMessage}". Please try again.`,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
