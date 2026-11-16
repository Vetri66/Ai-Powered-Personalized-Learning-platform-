import { NextRequest, NextResponse } from 'next/server'
import { getNvidiaClient } from '@/lib/ai/nvidia'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const nvidia = getNvidiaClient()
    const supabaseAdmin = createAdminClient()
    const { courseContext, conversationHistory, questionCount = 5, topic } = await request.json()

    // Fetch uploaded course materials for quiz context
    const { data: courseMaterials } = await supabaseAdmin
      .from('course_materials')
      .select('content, metadata')
      .limit(5)

    const uploadedContent = courseMaterials?.map(m => m.content).join('\n\n') || ''
    const uploadedFilename = courseMaterials?.[0]?.metadata?.filename || ''

    const recentChat = conversationHistory
      ?.slice(-10)
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n') || ''

    const prompt = `You are an expert quiz generator. Generate exactly ${questionCount} multiple choice questions.

${topic ? `TOPIC: ${topic}` : 'Generate questions based on the content below.'}

${uploadedContent ? `UPLOADED FILE (${uploadedFilename}):\n${uploadedContent}` : ''}

${recentChat ? `RECENT CHAT:\n${recentChat}` : ''}

RULES:
- Generate exactly ${questionCount} questions
- Each question has exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions must be based on the content above
- Return ONLY a valid JSON array, no markdown, no explanation outside JSON

OUTPUT FORMAT:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }
]`

    const completion = await nvidia.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: 'You are a quiz generator. Always respond with valid JSON array only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2048,
    })

    let responseText = completion.choices[0].message.content || ''

    // Clean markdown if present
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim()

    // Extract JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No valid JSON array in response')

    const quizData = JSON.parse(jsonMatch[0])

    if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error('Invalid quiz format')
    }

    return NextResponse.json({
      quiz: quizData,
      usedModel: 'meta/llama-3.3-70b-instruct',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Quiz Generation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
