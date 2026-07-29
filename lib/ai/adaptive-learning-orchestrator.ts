import { RAGEngine, DocumentChunk } from './rag-engine'
import { StudentContextManager, StudentContext, LearningGap } from './student-context'
import { AntiCheatingTutorEngine, TutorResponse } from './anti-cheating-tutor'
import { AnalyticsEngine } from './analytics-engine'
import { Course, ChatSession, AIInteraction } from '../mongodb/models'

export interface AdaptiveLearningRequest {
  studentId: string
  courseId: string
  query: string
  sessionId?: string
  conversationHistory?: { role: string; content: string }[]
}

export interface AdaptiveLearningResponse {
  response: string
  confidence: number
  responseType: 'explanation' | 'hint' | 'question' | 'warning' | 'escalation'
  sources: string[]
  followUpQuestions: string[]
  learningObjectives: string[]
  difficultyAdjustment: 'easier' | 'same' | 'harder'
  personalizedInsights: {
    studentLevel: string
    weakTopics: string[]
    strongTopics: string[]
    learningGaps: LearningGap[]
    recommendations: string[]
  }
  requiresHumanReview: boolean
  ethicalFlags: string[]
  metadata: {
    processingTime: number
    ragChunksUsed: number
    confidenceBreakdown: {
      contentRelevance: number
      responseQuality: number
      studentContext: number
    }
  }
}

export class AdaptiveLearningOrchestrator {
  private ragEngine: RAGEngine
  private contextManager: StudentContextManager
  private tutorEngine: AntiCheatingTutorEngine
  private analyticsEngine: AnalyticsEngine

  constructor() {
    this.ragEngine = new RAGEngine()
    this.contextManager = new StudentContextManager()
    this.tutorEngine = new AntiCheatingTutorEngine()
    this.analyticsEngine = new AnalyticsEngine()
  }

  async processLearningRequest(request: AdaptiveLearningRequest): Promise<AdaptiveLearningResponse> {
    const startTime = Date.now()
    
    try {
      // Step 1: Get student context and learning profile
      const studentContext = await this.contextManager.getStudentContext(
        request.studentId,
        request.courseId
      )

      // Step 2: Retrieve relevant course content using RAG
      const ragResult = await this.ragEngine.retrieveRelevantChunks(
        request.query,
        request.courseId,
        5, // Top 5 chunks
        this.getAdaptiveSimilarityThreshold(studentContext)
      )

      // Step 3: Generate tutor response with anti-cheating measures
      const courseContent = ragResult.chunks.map(chunk => chunk.content)
      const tutorResponse = await this.tutorEngine.generateTutorResponse(
        request.query,
        courseContent,
        studentContext,
        request.conversationHistory || []
      )

      // Step 4: Apply dynamic difficulty adjustment
      const difficultyAdjustment = this.calculateDifficultyAdjustment(
        studentContext,
        tutorResponse.confidence,
        ragResult.similarity_scores
      )

      // Step 5: Detect learning gaps and generate insights
      const learningGaps = await this.contextManager.detectLearningGaps(
        request.studentId,
        request.courseId
      )

      // Step 6: Generate personalized recommendations
      const recommendations = this.generatePersonalizedRecommendations(
        studentContext,
        learningGaps,
        tutorResponse
      )

      // Step 7: Update student context with this interaction
      await this.updateStudentLearningContext(request, tutorResponse, studentContext)

      // Step 8: Store interaction for analytics
      await this.storeInteractionData(request, tutorResponse, ragResult)

      const processingTime = Date.now() - startTime

      return {
        response: this.adaptResponseToStudent(tutorResponse.response, studentContext, difficultyAdjustment),
        confidence: tutorResponse.confidence,
        responseType: tutorResponse.responseType,
        sources: this.formatSources(ragResult.chunks),
        followUpQuestions: tutorResponse.followUpQuestions,
        learningObjectives: tutorResponse.learningObjectives,
        difficultyAdjustment,
        personalizedInsights: {
          studentLevel: studentContext.level,
          weakTopics: studentContext.weakTopics,
          strongTopics: studentContext.strongTopics,
          learningGaps,
          recommendations
        },
        requiresHumanReview: tutorResponse.requiresHumanReview || this.shouldEscalateToHuman(studentContext, tutorResponse),
        ethicalFlags: tutorResponse.ethicalFlags,
        metadata: {
          processingTime,
          ragChunksUsed: ragResult.chunks.length,
          confidenceBreakdown: {
            contentRelevance: this.calculateContentRelevance(ragResult.similarity_scores),
            responseQuality: tutorResponse.confidence,
            studentContext: this.calculateContextRelevance(studentContext, request.query)
          }
        }
      }
    } catch (error) {
      console.error('Adaptive learning processing failed:', error)
      return this.generateErrorResponse(request.studentId, request.courseId)
    }
  }

  private getAdaptiveSimilarityThreshold(studentContext: StudentContext): number {
    // Adjust similarity threshold based on student level
    const baseThreshold = 0.7
    
    switch (studentContext.level) {
      case 'beginner':
        return baseThreshold - 0.1 // More lenient for beginners
      case 'advanced':
        return baseThreshold + 0.1 // More strict for advanced students
      default:
        return baseThreshold
    }
  }

  private calculateDifficultyAdjustment(
    studentContext: StudentContext,
    responseConfidence: number,
    similarityScores: number[]
  ): 'easier' | 'same' | 'harder' {
    // Analyze student performance and adjust difficulty
    const avgSimilarity = similarityScores.length > 0 
      ? similarityScores.reduce((sum, score) => sum + score, 0) / similarityScores.length
      : 0

    // If student is struggling (low confidence, many weak topics)
    if (responseConfidence < 0.5 || studentContext.weakTopics.length > studentContext.strongTopics.length) {
      return 'easier'
    }

    // If student is excelling (high confidence, advanced level, good content match)
    if (responseConfidence > 0.8 && studentContext.level === 'advanced' && avgSimilarity > 0.8) {
      return 'harder'
    }

    return 'same'
  }

  private generatePersonalizedRecommendations(
    studentContext: StudentContext,
    learningGaps: LearningGap[],
    tutorResponse: TutorResponse
  ): string[] {
    const recommendations: string[] = []

    // Recommendations based on learning gaps
    const criticalGaps = learningGaps.filter(gap => gap.severity === 'critical' || gap.severity === 'high')
    if (criticalGaps.length > 0) {
      recommendations.push(`Focus on ${criticalGaps[0].topic} - you've struggled with this recently`)
      recommendations.push(...criticalGaps[0].recommendedActions.slice(0, 2))
    }

    // Recommendations based on learning style
    switch (studentContext.learningStyle) {
      case 'visual':
        recommendations.push('Try creating diagrams or mind maps for this topic')
        break
      case 'auditory':
        recommendations.push('Consider explaining this concept out loud or discussing with peers')
        break
      case 'kinesthetic':
        recommendations.push('Look for hands-on exercises or practical applications')
        break
      case 'reading':
        recommendations.push('Review the course materials and take detailed notes')
        break
    }

    // Recommendations based on engagement level
    if (studentContext.currentStreak === 0) {
      recommendations.push('Try to study a little bit every day to build a learning streak')
    } else if (studentContext.currentStreak > 7) {
      recommendations.push('Great job maintaining your learning streak! Keep it up!')
    }

    // Recommendations based on response type
    if (tutorResponse.responseType === 'warning') {
      recommendations.push('Focus on understanding concepts rather than seeking quick answers')
      recommendations.push('Consider scheduling office hours with your instructor')
    }

    return recommendations.slice(0, 4) // Limit to 4 recommendations
  }

  private adaptResponseToStudent(
    response: string,
    studentContext: StudentContext,
    difficultyAdjustment: 'easier' | 'same' | 'harder'
  ): string {
    let adaptedResponse = response

    // Adjust explanation depth based on student preference
    if (studentContext.preferredExplanationDepth === 'brief' && response.length > 300) {
      adaptedResponse = this.summarizeResponse(response)
    } else if (studentContext.preferredExplanationDepth === 'comprehensive' && response.length < 200) {
      adaptedResponse = this.expandResponse(response, studentContext)
    }

    // Add difficulty adjustment context
    if (difficultyAdjustment === 'easier') {
      adaptedResponse += "\n\n💡 I've simplified this explanation based on your current progress. Take your time to understand each step."
    } else if (difficultyAdjustment === 'harder') {
      adaptedResponse += "\n\n🚀 Since you're doing well, here's a more advanced perspective to consider..."
    }

    // Add personalized encouragement
    if (studentContext.currentStreak > 0) {
      adaptedResponse += `\n\n🔥 Keep up your ${studentContext.currentStreak}-day learning streak!`
    }

    return adaptedResponse
  }

  private summarizeResponse(response: string): string {
    // Simple summarization - in production, use more sophisticated NLP
    const sentences = response.split('. ')
    const keySentences = sentences.filter(sentence => 
      sentence.includes('important') || 
      sentence.includes('key') || 
      sentence.includes('remember') ||
      sentence.length > 50
    )
    return keySentences.slice(0, 3).join('. ') + '.'
  }

  private expandResponse(response: string, studentContext: StudentContext): string {
    // Add context-specific expansions
    let expansion = response + "\n\n"
    
    if (studentContext.strongTopics.length > 0) {
      expansion += `This connects to ${studentContext.strongTopics[0]}, which you've mastered well. `
    }
    
    expansion += "Would you like me to provide more detailed examples or explain any specific part in greater depth?"
    
    return expansion
  }

  private shouldEscalateToHuman(studentContext: StudentContext, tutorResponse: TutorResponse): boolean {
    // Escalate if student has been struggling consistently
    const strugglingTopicsCount = studentContext.strugglingTopics.length
    const lowConfidenceResponse = tutorResponse.confidence < 0.3
    const hasEthicalFlags = tutorResponse.ethicalFlags.length > 0
    
    return strugglingTopicsCount >= 3 || lowConfidenceResponse || hasEthicalFlags
  }

  private async updateStudentLearningContext(
    request: AdaptiveLearningRequest,
    tutorResponse: TutorResponse,
    studentContext: StudentContext
  ): Promise<void> {
    // Extract topic from query (simplified - in production, use NLP)
    const topic = this.extractTopicFromQuery(request.query)
    
    await this.contextManager.updateStudentContext(
      request.studentId,
      request.courseId,
      {
        query: request.query,
        response: tutorResponse.response,
        confidence: tutorResponse.confidence,
        topic
      }
    )
  }

  private extractTopicFromQuery(query: string): string {
    // Simple topic extraction - in production, use more sophisticated NLP
    const commonTopics = [
      'algorithms', 'data structures', 'programming', 'mathematics', 
      'statistics', 'machine learning', 'databases', 'networking',
      'security', 'web development', 'mobile development'
    ]
    
    const queryLower = query.toLowerCase()
    const foundTopic = commonTopics.find(topic => queryLower.includes(topic))
    
    return foundTopic || 'general'
  }

  private async storeInteractionData(
    request: AdaptiveLearningRequest,
    tutorResponse: TutorResponse,
    ragResult: any
  ): Promise<void> {
    try {
      // Store in AI interactions collection
      await AIInteraction.create({
        studentId: request.studentId,
        courseId: request.courseId,
        sessionId: request.sessionId || `session_${Date.now()}`,
        query: request.query,
        response: tutorResponse.response,
        confidence: tutorResponse.confidence,
        sources: ragResult.chunks.map(chunk => chunk.metadata.source),
        topic: this.extractTopicFromQuery(request.query)
      })

      // Update or create chat session
      if (request.sessionId) {
        await ChatSession.findOneAndUpdate(
          { _id: request.sessionId },
          {
            $push: {
              messages: [
                { role: 'user', content: request.query, timestamp: new Date() },
                { 
                  role: 'assistant', 
                  content: tutorResponse.response, 
                  timestamp: new Date(),
                  confidence: tutorResponse.confidence,
                  sources: ragResult.chunks.map(chunk => chunk.metadata.source)
                }
              ]
            }
          },
          { upsert: true }
        )
      }
    } catch (error) {
      console.error('Failed to store interaction data:', error)
    }
  }

  private formatSources(chunks: DocumentChunk[]): string[] {
    return chunks.map(chunk => {
      const { source, page, section } = chunk.metadata
      let formattedSource = source
      
      if (page) formattedSource += ` (Page ${page})`
      if (section) formattedSource += ` - ${section}`
      
      return formattedSource
    })
  }

  private calculateContentRelevance(similarityScores: number[]): number {
    if (similarityScores.length === 0) return 0
    return similarityScores.reduce((sum, score) => sum + score, 0) / similarityScores.length
  }

  private calculateContextRelevance(studentContext: StudentContext, query: string): number {
    let relevance = 0.5 // Base relevance
    
    // Increase relevance if query relates to student's weak topics
    const queryLower = query.toLowerCase()
    const relatedWeakTopics = studentContext.weakTopics.filter(topic => 
      queryLower.includes(topic.toLowerCase())
    )
    
    if (relatedWeakTopics.length > 0) {
      relevance += 0.3 // Higher relevance for addressing weak areas
    }
    
    // Increase relevance based on student's interaction history
    if (studentContext.totalInteractions > 10) {
      relevance += 0.1 // More context available
    }
    
    return Math.min(relevance, 1)
  }

  private generateErrorResponse(studentId: string, courseId: string): AdaptiveLearningResponse {
    return {
      response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact your instructor if you need immediate help.",
      confidence: 0,
      responseType: 'escalation',
      sources: [],
      followUpQuestions: [],
      learningObjectives: [],
      difficultyAdjustment: 'same',
      personalizedInsights: {
        studentLevel: 'intermediate',
        weakTopics: [],
        strongTopics: [],
        learningGaps: [],
        recommendations: ['Contact your instructor for technical support']
      },
      requiresHumanReview: true,
      ethicalFlags: ['technical_error'],
      metadata: {
        processingTime: 0,
        ragChunksUsed: 0,
        confidenceBreakdown: {
          contentRelevance: 0,
          responseQuality: 0,
          studentContext: 0
        }
      }
    }
  }

  // Public methods for course management and analytics
  async processCourseContent(courseId: string, content: string, metadata: any): Promise<void> {
    const chunks = await this.ragEngine.processDocument(content, metadata)
    
    // Store embeddings in course document
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        embeddings: chunks.map(chunk => ({
          chunkId: chunk.id,
          content: chunk.content,
          embedding: chunk.embedding,
          metadata: chunk.metadata
        }))
      }
    })
  }

  async getCourseAnalytics(courseId: string) {
    return await this.analyticsEngine.generateCourseAnalytics(courseId)
  }

  async getStudentInsights(courseId: string) {
    return await this.analyticsEngine.generateStudentInsights(courseId)
  }

  async getInstructorAlerts(courseId: string) {
    return await this.analyticsEngine.generateInstructorAlerts(courseId)
  }
}