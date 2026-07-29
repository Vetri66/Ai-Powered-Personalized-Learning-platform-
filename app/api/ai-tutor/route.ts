import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { getSystemPromptInLanguage } from '@/lib/languages'
import type { LanguageCode } from '@/lib/languages'

export const maxDuration = 60

const DEFAULT_SYSTEM_PROMPT = `You are LearnAI, an expert AI tutor designed to help students learn and understand complex topics. Your approach combines:

1. **Socratic Method**: Ask guiding questions to help students discover answers themselves
2. **Adaptive Learning**: Adjust explanations based on the student's level of understanding
3. **Encouragement**: Be supportive and celebrate progress
4. **Clear Explanations**: Break down complex topics into digestible parts
5. **Examples**: Use relevant, real-world examples to illustrate concepts

Guidelines:
- Start by understanding what the student already knows
- Don't give away answers directly; guide them to discover
- When they're stuck, provide hints rather than solutions
- Use analogies and visual descriptions when helpful
- Summarize key points after explaining a concept
- Ask follow-up questions to check understanding
- Be patient and encouraging, even with repeated questions

Remember: Your goal is not just to provide answers, but to help students develop critical thinking skills and genuine understanding.`

export async function POST(req: Request) {
  const { messages, courseContext, language }: { 
    messages: UIMessage[]
    courseContext?: string
    language?: LanguageCode 
  } = await req.json()

  // Get system prompt in the specified language or use default
  const baseSystemPrompt = language 
    ? getSystemPromptInLanguage(language)
    : DEFAULT_SYSTEM_PROMPT

  const systemPrompt = courseContext 
    ? `${baseSystemPrompt}\n\nContext: You are helping a student with the following course material:\n${courseContext}`
    : baseSystemPrompt

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: allMessages, isAborted }) => {
      if (isAborted) return
      // Messages can be persisted to database here
    },
    consumeSseStream: consumeStream,
  })
}
