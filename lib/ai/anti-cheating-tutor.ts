import OpenAI from 'openai'
import { StudentContext } from './student-context'

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: 'https://integrate.api.nvidia.com/v1'
})

export interface TutorResponse {
  response: string
  responseType: 'explanation' | 'hint' | 'question' | 'warning' | 'escalation'
  confidence: number
  sources: string[]
  followUpQuestions: string[]
  requiresHumanReview: boolean
  ethicalFlags: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  learningObjectives: string[]
}

export interface CheatingDetection {
  isCheatingAttempt: boolean
  cheatingType: 'direct_answer_request' | 'homework_completion' | 'exam_question' | 'plagiarism' | 'none'
  confidence: number
  indicators: string[]
  ethicalResponse: string
}

export class AntiCheatingTutorEngine {
  private maxDirectAnswerAttempts = 3
  private studentAttempts = new Map<string, number>()

  async generateTutorResponse(
    query: string,
    courseContext: string[],
    studentContext: StudentContext,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<TutorResponse> {
    try {
      // First, detect potential cheating attempts
      const cheatingDetection = await this.detectCheatingAttempt(query, conversationHistory)
      
      if (cheatingDetection.isCheatingAttempt) {
        return this.generateEthicalResponse(cheatingDetection, studentContext)
      }

      // Check if student is repeatedly asking for direct answers
      const studentKey = `${studentContext.studentId}_${studentContext.courseId}`
      const attempts = this.studentAttempts.get(studentKey) || 0
      
      if (this.isDirectAnswerRequest(query) && attempts >= this.maxDirectAnswerAttempts) {
        return this.generateEscalationResponse(studentContext, query)
      }

      // Generate appropriate tutor response based on student context
      return await this.generateAdaptiveTutorResponse(
        query,
        courseContext,
        studentContext,
        conversationHistory
      )
    } catch (error) {
      console.error('Tutor response generation failed:', error)
      return this.generateErrorResponse()
    }
  }

  private async detectCheatingAttempt(
    query: string,
    conversationHistory: { role: string; content: string }[]
  ): Promise<CheatingDetection> {
    const cheatingIndicators = {
      direct_answer_request: [
        'give me the answer',
        'what is the answer to',
        'solve this for me',
        'complete this assignment',
        'do my homework',
        'write the code for',
        'final answer',
        'just tell me'
      ],
      homework_completion: [
        'assignment',
        'homework',
        'due tomorrow',
        'submit this',
        'grade this',
        'complete solution',
        'full code',
        'entire program'
      ],
      exam_question: [
        'exam',
        'test question',
        'quiz',
        'midterm',
        'final exam',
        'during test',
        'examination'
      ],
      plagiarism: [
        'write an essay',
        'complete report',
        'full paper',
        'entire document',
        'copy this',
        'plagiarize'
      ]
    }

    let maxConfidence = 0
    let detectedType: keyof typeof cheatingIndicators | 'none' = 'none'
    const foundIndicators: string[] = []

    const queryLower = query.toLowerCase()
    
    for (const [type, indicators] of Object.entries(cheatingIndicators)) {
      const matches = indicators.filter(indicator => queryLower.includes(indicator))
      if (matches.length > 0) {
        const confidence = matches.length / indicators.length
        if (confidence > maxConfidence) {
          maxConfidence = confidence
          detectedType = type as keyof typeof cheatingIndicators
          foundIndicators.push(...matches)
        }
      }
    }

    // Additional context-based detection
    const contextualFlags = this.analyzeContextualCheating(query, conversationHistory)
    if (contextualFlags.length > 0) {
      maxConfidence = Math.max(maxConfidence, 0.7)
      foundIndicators.push(...contextualFlags)
    }

    const isCheatingAttempt = maxConfidence > 0.3 || foundIndicators.length > 0

    return {
      isCheatingAttempt,
      cheatingType: detectedType,
      confidence: maxConfidence,
      indicators: foundIndicators,
      ethicalResponse: this.generateEthicalMessage(detectedType, foundIndicators)
    }
  }

  private analyzeContextualCheating(
    query: string,
    conversationHistory: { role: string; content: string }[]
  ): string[] {
    const flags: string[] = []
    
    // Check for urgency indicators
    const urgencyWords = ['urgent', 'asap', 'quickly', 'fast', 'deadline', 'due soon']
    if (urgencyWords.some(word => query.toLowerCase().includes(word))) {
      flags.push('urgency_indicator')
    }

    // Check for copy-paste patterns (very long, formatted text)
    if (query.length > 500 && query.includes('\n') && query.match(/\d+\./)) {
      flags.push('formatted_assignment_text')
    }

    // Check for repeated direct answer requests
    const recentDirectRequests = conversationHistory
      .slice(-5)
      .filter(msg => msg.role === 'user' && this.isDirectAnswerRequest(msg.content))
    
    if (recentDirectRequests.length >= 3) {
      flags.push('repeated_direct_requests')
    }

    return flags
  }

  private isDirectAnswerRequest(query: string): boolean {
    const directAnswerPatterns = [
      /what is the answer/i,
      /give me the solution/i,
      /solve this/i,
      /complete this/i,
      /final answer/i,
      /just tell me/i
    ]

    return directAnswerPatterns.some(pattern => pattern.test(query))
  }

  private generateEthicalMessage(
    cheatingType: string,
    indicators: string[]
  ): string {
    const messages = {
      direct_answer_request: "I'm here to help you learn, not to provide direct answers. Let me guide you through the learning process instead.",
      homework_completion: "I can't complete assignments for you, but I can help you understand the concepts and guide you through the problem-solving process.",
      exam_question: "I cannot assist with exam questions. Please consult your instructor or course materials for exam-related help.",
      plagiarism: "I cannot help with creating content that might be submitted as your own work. Let me help you understand the concepts instead.",
      none: "Let me help you learn by breaking down the concepts step by step."
    }

    return messages[cheatingType] || messages.none
  }

  private generateEthicalResponse(
    cheatingDetection: CheatingDetection,
    studentContext: StudentContext
  ): TutorResponse {
    return {
      response: cheatingDetection.ethicalResponse + "\n\nInstead, let me help you understand the underlying concepts. What specific part would you like to learn more about?",
      responseType: 'warning',
      confidence: 0.9,
      sources: [],
      followUpQuestions: [
        "What concepts are you struggling with?",
        "Would you like me to explain the fundamentals?",
        "What part of this topic confuses you most?"
      ],
      requiresHumanReview: cheatingDetection.confidence > 0.7,
      ethicalFlags: cheatingDetection.indicators,
      difficultyLevel: studentContext.level,
      learningObjectives: [`Understand ethical learning practices`]
    }
  }

  private async generateAdaptiveTutorResponse(
    query: string,
    courseContext: string[],
    studentContext: StudentContext,
    conversationHistory: { role: string; content: string }[]
  ): Promise<TutorResponse> {
    const systemPrompt = this.buildAdaptiveSystemPrompt(studentContext, courseContext)
    const conversationContext = this.buildConversationContext(conversationHistory)
    
    const prompt = `${systemPrompt}

${conversationContext}

STUDENT QUESTION: ${query}

RESPONSE GUIDELINES:
1. Start with conceptual explanation
2. Use ${studentContext.preferredExplanationDepth} explanations
3. Adapt to ${studentContext.level} level
4. Consider learning style: ${studentContext.learningStyle}
5. Reference weak areas: ${studentContext.weakTopics.join(', ')}
6. Build on strong areas: ${studentContext.strongTopics.join(', ')}
7. End with guiding questions, not answers

Generate a response that teaches rather than tells:`

    const completion = await nvidia.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${conversationContext}\n\nSTUDENT QUESTION: ${query}` }
      ],
      temperature: 0.4,
      max_tokens: 1024
    })
    const response = completion.choices[0].message.content || ''
    
    // Determine response type
    const responseType = this.classifyResponseType(response)
    
    // Calculate confidence
    const confidence = this.calculateTutorConfidence(query, response, courseContext)
    
    // Generate follow-up questions
    const followUpQuestions = await this.generateContextualFollowUps(query, studentContext)
    
    // Extract learning objectives
    const learningObjectives = this.extractLearningObjectives(query, response)

    return {
      response,
      responseType,
      confidence,
      sources: this.extractSources(response, courseContext),
      followUpQuestions,
      requiresHumanReview: confidence < 0.4,
      ethicalFlags: [],
      difficultyLevel: studentContext.level,
      learningObjectives
    }
  }

  private buildAdaptiveSystemPrompt(
    studentContext: StudentContext,
    courseContext: string[]
  ): string {
    return `You are an adaptive AI tutor. Your role is to guide learning, not provide direct answers.

STUDENT PROFILE:
- Level: ${studentContext.level}
- Learning Style: ${studentContext.learningStyle}
- Explanation Preference: ${studentContext.preferredExplanationDepth}
- Weak Topics: ${studentContext.weakTopics.join(', ') || 'None identified'}
- Strong Topics: ${studentContext.strongTopics.join(', ') || 'None identified'}
- Total Interactions: ${studentContext.totalInteractions}
- Current Streak: ${studentContext.currentStreak} days

COURSE CONTEXT:
${courseContext.join('\n\n')}

TEACHING APPROACH:
1. Use Socratic method - ask guiding questions
2. Provide scaffolded learning experiences
3. Connect to student's strong areas when possible
4. Address weak areas with extra support
5. Adapt complexity to student level
6. Use ${studentContext.learningStyle} learning style preferences:
   ${this.getLearningStyleGuidance(studentContext.learningStyle)}

RESPONSE STRUCTURE:
1. Acknowledge the question
2. Provide conceptual foundation
3. Guide through reasoning process
4. Ask follow-up questions
5. Suggest next steps

AVOID:
- Direct answers to homework/assignments
- Complete solutions
- Doing work for the student
- Going beyond course content`
  }

  private getLearningStyleGuidance(style: string): string {
    const guidance = {
      visual: "- Use analogies and mental models\n- Suggest diagrams or visual representations\n- Reference visual patterns",
      auditory: "- Use verbal explanations\n- Suggest reading aloud\n- Use rhythm and repetition",
      kinesthetic: "- Suggest hands-on practice\n- Use real-world examples\n- Encourage experimentation",
      reading: "- Provide structured text\n- Use lists and definitions\n- Reference documentation"
    }
    return guidance[style] || guidance.reading
  }

  private buildConversationContext(history: { role: string; content: string }[]): string {
    if (history.length === 0) return ''
    
    return `RECENT CONVERSATION:
${history.slice(-6).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}
`
  }

  private classifyResponseType(response: string): 'explanation' | 'hint' | 'question' | 'warning' | 'escalation' {
    if (response.includes('?') && response.split('?').length > 2) return 'question'
    if (response.toLowerCase().includes('hint') || response.toLowerCase().includes('clue')) return 'hint'
    if (response.toLowerCase().includes('warning') || response.toLowerCase().includes('cannot')) return 'warning'
    if (response.toLowerCase().includes('instructor') || response.toLowerCase().includes('human help')) return 'escalation'
    return 'explanation'
  }

  private calculateTutorConfidence(query: string, response: string, courseContext: string[]): number {
    let confidence = 0.5

    // Increase confidence if response is educational
    if (response.includes('?')) confidence += 0.1
    if (response.includes('because') || response.includes('therefore')) confidence += 0.1
    if (response.includes('step') || response.includes('process')) confidence += 0.1

    // Increase confidence if response references course content
    const contextReferences = courseContext.filter(content =>
      response.toLowerCase().includes(content.toLowerCase().substring(0, 30))
    ).length
    confidence += Math.min(contextReferences * 0.1, 0.3)

    // Decrease confidence for uncertainty
    if (response.includes("I'm not sure") || response.includes("unclear")) confidence -= 0.3

    return Math.max(0, Math.min(1, confidence))
  }

  private async generateContextualFollowUps(
    query: string,
    studentContext: StudentContext
  ): Promise<string[]> {
    const baseQuestions = [
      "What aspect of this would you like to explore further?",
      "Can you think of how this connects to what you already know?",
      "What questions does this raise for you?"
    ]

    // Add personalized questions based on student context
    if (studentContext.weakTopics.length > 0) {
      baseQuestions.push(`How does this relate to ${studentContext.weakTopics[0]}?`)
    }

    if (studentContext.level === 'beginner') {
      baseQuestions.push("Would you like me to break this down into smaller steps?")
    } else if (studentContext.level === 'advanced') {
      baseQuestions.push("Can you think of any edge cases or exceptions?")
    }

    return baseQuestions.slice(0, 3)
  }

  private extractLearningObjectives(query: string, response: string): string[] {
    // Simple extraction based on response content
    const objectives: string[] = []
    
    if (response.includes('understand')) {
      objectives.push('Develop conceptual understanding')
    }
    if (response.includes('apply') || response.includes('practice')) {
      objectives.push('Apply knowledge to problems')
    }
    if (response.includes('analyze') || response.includes('compare')) {
      objectives.push('Analyze and evaluate concepts')
    }
    if (response.includes('create') || response.includes('design')) {
      objectives.push('Synthesize and create solutions')
    }

    return objectives.length > 0 ? objectives : ['Understand core concepts']
  }

  private extractSources(response: string, courseContext: string[]): string[] {
    const sources: string[] = []
    
    courseContext.forEach((content, index) => {
      const contentWords = content.toLowerCase().split(' ').slice(0, 10)
      const responseWords = response.toLowerCase().split(' ')
      
      const matches = contentWords.filter(word => 
        word.length > 4 && responseWords.some(rWord => rWord.includes(word))
      )
      
      if (matches.length > 2) {
        sources.push(`Course Material ${index + 1}`)
      }
    })
    
    return [...new Set(sources)]
  }

  private generateEscalationResponse(studentContext: StudentContext, query: string): TutorResponse {
    return {
      response: `I notice you've been asking for direct answers repeatedly. As your AI tutor, my goal is to help you learn and understand concepts, not to provide shortcuts. 

This pattern suggests you might benefit from:
1. Reviewing the fundamental concepts
2. Breaking down problems into smaller steps
3. Discussing your learning approach with your instructor

Would you like me to help you develop a better study strategy, or would you prefer to schedule time with your instructor?`,
      responseType: 'escalation',
      confidence: 0.9,
      sources: [],
      followUpQuestions: [
        "What specific concepts are you struggling with?",
        "Would you like help creating a study plan?",
        "Should I connect you with your instructor?"
      ],
      requiresHumanReview: true,
      ethicalFlags: ['repeated_direct_answer_requests'],
      difficultyLevel: studentContext.level,
      learningObjectives: ['Develop effective learning strategies']
    }
  }

  private generateErrorResponse(): TutorResponse {
    return {
      response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact your instructor if you need immediate help.",
      responseType: 'escalation',
      confidence: 0,
      sources: [],
      followUpQuestions: [],
      requiresHumanReview: true,
      ethicalFlags: ['technical_error'],
      difficultyLevel: 'intermediate',
      learningObjectives: []
    }
  }

  // Track student attempts for direct answers
  incrementDirectAnswerAttempt(studentId: string, courseId: string): void {
    const key = `${studentId}_${courseId}`
    const current = this.studentAttempts.get(key) || 0
    this.studentAttempts.set(key, current + 1)
  }

  resetDirectAnswerAttempts(studentId: string, courseId: string): void {
    const key = `${studentId}_${courseId}`
    this.studentAttempts.delete(key)
  }
}