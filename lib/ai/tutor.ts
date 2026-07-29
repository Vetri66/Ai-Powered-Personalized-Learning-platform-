import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface AITutorResponse {
  response: string
  confidence: number
  sources: string[]
  followUpQuestions: string[]
  isDirectAnswer: boolean
}

export interface CourseContext {
  courseId: string
  courseName: string
  content: string[]
  topic: string
}

export class AITutorService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async generateResponse(
    query: string,
    context: CourseContext,
    conversationHistory: { role: string; content: string }[] = [],
    studentLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<AITutorResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, studentLevel)
      const conversationContext = this.buildConversationContext(conversationHistory)
      
      const prompt = `${systemPrompt}

${conversationContext}

Student Question: ${query}

Remember: 
- Provide step-by-step explanations instead of direct answers
- Use hints and guided questions to help the student learn
- Reference the course content when possible
- Encourage critical thinking
- If confidence is low, admit uncertainty and suggest human help`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      // Calculate confidence based on response quality and context relevance
      const confidence = this.calculateConfidence(query, response, context)
      
      // Extract sources from course content
      const sources = this.extractSources(response, context)
      
      // Generate follow-up questions
      const followUpQuestions = this.generateFollowUpQuestions(query, response)
      
      // Determine if this is a direct answer (should be avoided)
      const isDirectAnswer = this.isDirectAnswer(response)

      return {
        response,
        confidence,
        sources,
        followUpQuestions,
        isDirectAnswer
      }
    } catch (error) {
      console.error('AI Tutor Error:', error)
      return {
        response: "I'm having trouble processing your question right now. Please try rephrasing it or contact your instructor for help.",
        confidence: 0,
        sources: [],
        followUpQuestions: [],
        isDirectAnswer: false
      }
    }
  }

  private buildSystemPrompt(context: CourseContext, level: string): string {
    return `You are an AI tutor for the course "${context.courseName}". Your role is to guide students through learning, not give direct answers.

COURSE CONTEXT:
Topic: ${context.topic}
Content: ${context.content.join('\n')}

TEACHING PRINCIPLES:
1. Use the Socratic method - ask guiding questions
2. Provide hints and scaffolded learning
3. Encourage students to think critically
4. Break down complex concepts into steps
5. Reference course materials when relevant
6. Adapt explanations to ${level} level

RESPONSE GUIDELINES:
- Start with "Let me help you think through this..."
- Use phrases like "What do you think would happen if..." or "Can you identify..."
- Provide examples from the course content
- End with a question to continue the learning process
- If asked for direct answers, redirect to learning process

AVOID:
- Giving complete solutions immediately
- Doing homework for students
- Providing answers without explanation
- Going off-topic from course content`
  }

  private buildConversationContext(history: { role: string; content: string }[]): string {
    if (history.length === 0) return ''
    
    return `CONVERSATION HISTORY:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
`
  }

  private calculateConfidence(query: string, response: string, context: CourseContext): number {
    let confidence = 0.5 // Base confidence
    
    // Increase confidence if response references course content
    const contentReferences = context.content.filter(content => 
      response.toLowerCase().includes(content.toLowerCase().substring(0, 50))
    ).length
    confidence += Math.min(contentReferences * 0.1, 0.3)
    
    // Increase confidence if response is educational (contains questions, examples)
    if (response.includes('?')) confidence += 0.1
    if (response.includes('example') || response.includes('for instance')) confidence += 0.1
    if (response.includes('step') || response.includes('first') || response.includes('next')) confidence += 0.1
    
    // Decrease confidence if response is too short or generic
    if (response.length < 100) confidence -= 0.2
    if (response.includes("I don't know") || response.includes("I'm not sure")) confidence -= 0.3
    
    return Math.max(0, Math.min(1, confidence))
  }

  private extractSources(response: string, context: CourseContext): string[] {
    const sources: string[] = []
    
    context.content.forEach((content, index) => {
      // Simple keyword matching - in production, use more sophisticated methods
      const keywords = content.toLowerCase().split(' ').slice(0, 10)
      const responseWords = response.toLowerCase().split(' ')
      
      const matches = keywords.filter(keyword => 
        responseWords.some(word => word.includes(keyword) && keyword.length > 3)
      )
      
      if (matches.length > 2) {
        sources.push(`Course Material ${index + 1}`)
      }
    })
    
    return [...new Set(sources)] // Remove duplicates
  }

  private generateFollowUpQuestions(query: string, response: string): string[] {
    const questions = [
      "What would you like to explore further about this topic?",
      "Can you think of a real-world example where this applies?",
      "What questions do you have about the next steps?",
      "How does this relate to what you learned earlier?"
    ]
    
    // In production, use AI to generate contextual follow-up questions
    return questions.slice(0, 2)
  }

  private isDirectAnswer(response: string): boolean {
    const directAnswerIndicators = [
      'the answer is',
      'the solution is',
      'here is the code',
      'the result is',
      'simply do this'
    ]
    
    return directAnswerIndicators.some(indicator => 
      response.toLowerCase().includes(indicator)
    )
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // For now, return a mock embedding
      // In production, use a proper embedding model
      return Array.from({ length: 768 }, () => Math.random())
    } catch (error) {
      console.error('Embedding generation error:', error)
      return []
    }
  }

  async findSimilarContent(query: string, courseContent: string[]): Promise<string[]> {
    // Simple keyword-based similarity for now
    // In production, use vector similarity search
    const queryWords = query.toLowerCase().split(' ')
    
    return courseContent
      .map((content, index) => ({
        content,
        index,
        score: this.calculateSimilarity(queryWords, content.toLowerCase().split(' '))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.content)
  }

  private calculateSimilarity(words1: string[], words2: string[]): number {
    const intersection = words1.filter(word => words2.includes(word))
    return intersection.length / Math.max(words1.length, words2.length)
  }
}