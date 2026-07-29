import { LearningProgress, AIInteraction, ChatSession } from '../mongodb/models'

export interface StudentContext {
  studentId: string
  courseId: string
  level: 'beginner' | 'intermediate' | 'advanced'
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  weakTopics: string[]
  strongTopics: string[]
  preferredExplanationDepth: 'brief' | 'detailed' | 'comprehensive'
  averageSessionLength: number
  totalInteractions: number
  lastActivity: Date
  strugglingTopics: { topic: string; attempts: number; lastAttempt: Date }[]
  masteredConcepts: string[]
  currentStreak: number
}

export interface LearningGap {
  topic: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  recommendedActions: string[]
  detectedAt: Date
  attempts: number
}

export class StudentContextManager {
  async getStudentContext(studentId: string, courseId: string): Promise<StudentContext> {
    try {
      const [progress, interactions, sessions] = await Promise.all([
        LearningProgress.findOne({ studentId, courseId }),
        AIInteraction.find({ studentId, courseId }).sort({ createdAt: -1 }).limit(50),
        ChatSession.find({ studentId, courseId }).sort({ createdAt: -1 }).limit(10)
      ])

      return this.buildStudentContext(studentId, courseId, progress, interactions, sessions)
    } catch (error) {
      console.error('Failed to get student context:', error)
      return this.getDefaultContext(studentId, courseId)
    }
  }

  private buildStudentContext(
    studentId: string,
    courseId: string,
    progress: any,
    interactions: any[],
    sessions: any[]
  ): StudentContext {
    const totalInteractions = interactions.length
    const recentInteractions = interactions.slice(0, 20)
    
    // Analyze learning level based on interaction complexity and success
    const level = this.determineLearningLevel(recentInteractions)
    
    // Identify learning style from interaction patterns
    const learningStyle = this.identifyLearningStyle(recentInteractions)
    
    // Calculate average session length
    const avgSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.messages.length, 0) / sessions.length
      : 0

    // Identify struggling topics
    const strugglingTopics = this.identifyStrugglingTopics(interactions)
    
    // Identify mastered concepts
    const masteredConcepts = progress?.strongAreas || []
    
    // Calculate current streak
    const currentStreak = this.calculateStreak(interactions)

    return {
      studentId,
      courseId,
      level,
      learningStyle,
      weakTopics: progress?.weakAreas || [],
      strongTopics: progress?.strongAreas || [],
      preferredExplanationDepth: this.determineExplanationDepth(recentInteractions),
      averageSessionLength: avgSessionLength,
      totalInteractions,
      lastActivity: interactions[0]?.createdAt || new Date(),
      strugglingTopics,
      masteredConcepts,
      currentStreak
    }
  }

  private determineLearningLevel(interactions: any[]): 'beginner' | 'intermediate' | 'advanced' {
    if (interactions.length < 5) return 'beginner'
    
    const avgConfidence = interactions.reduce((sum, int) => sum + (int.confidence || 0), 0) / interactions.length
    const complexQuestions = interactions.filter(int => 
      int.query.length > 100 || int.query.includes('why') || int.query.includes('how')
    ).length
    
    const complexityRatio = complexQuestions / interactions.length
    
    if (avgConfidence > 0.8 && complexityRatio > 0.6) return 'advanced'
    if (avgConfidence > 0.6 && complexityRatio > 0.3) return 'intermediate'
    return 'beginner'
  }

  private identifyLearningStyle(interactions: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    const visualKeywords = ['diagram', 'chart', 'image', 'visual', 'show me', 'picture']
    const auditoryKeywords = ['explain', 'tell me', 'describe', 'sound', 'hear']
    const kinestheticKeywords = ['practice', 'try', 'do', 'hands-on', 'example', 'exercise']
    const readingKeywords = ['read', 'text', 'definition', 'list', 'steps', 'documentation']

    const scores = {
      visual: this.countKeywords(interactions, visualKeywords),
      auditory: this.countKeywords(interactions, auditoryKeywords),
      kinesthetic: this.countKeywords(interactions, kinestheticKeywords),
      reading: this.countKeywords(interactions, readingKeywords)
    }

    return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0] as any
  }

  private countKeywords(interactions: any[], keywords: string[]): number {
    return interactions.reduce((count, interaction) => {
      const query = interaction.query.toLowerCase()
      return count + keywords.filter(keyword => query.includes(keyword)).length
    }, 0)
  }

  private determineExplanationDepth(interactions: any[]): 'brief' | 'detailed' | 'comprehensive' {
    const avgQueryLength = interactions.reduce((sum, int) => sum + int.query.length, 0) / interactions.length
    const detailRequests = interactions.filter(int => 
      int.query.includes('detail') || int.query.includes('explain more') || int.query.includes('elaborate')
    ).length

    if (avgQueryLength > 150 || detailRequests > interactions.length * 0.3) return 'comprehensive'
    if (avgQueryLength > 80 || detailRequests > interactions.length * 0.1) return 'detailed'
    return 'brief'
  }

  private identifyStrugglingTopics(interactions: any[]): { topic: string; attempts: number; lastAttempt: Date }[] {
    const topicAttempts = new Map<string, { attempts: number; lastAttempt: Date }>()
    
    interactions.forEach(interaction => {
      const topic = interaction.topic
      if (interaction.confidence < 0.5) { // Low confidence indicates struggle
        const current = topicAttempts.get(topic) || { attempts: 0, lastAttempt: new Date(0) }
        topicAttempts.set(topic, {
          attempts: current.attempts + 1,
          lastAttempt: new Date(Math.max(current.lastAttempt.getTime(), interaction.createdAt.getTime()))
        })
      }
    })

    return Array.from(topicAttempts.entries())
      .filter(([_, data]) => data.attempts >= 3) // Struggling if 3+ low confidence interactions
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => b.attempts - a.attempts)
  }

  private calculateStreak(interactions: any[]): number {
    if (interactions.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < interactions.length; i++) {
      const interactionDate = new Date(interactions[i].createdAt)
      const daysDiff = Math.floor((today.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  private getDefaultContext(studentId: string, courseId: string): StudentContext {
    return {
      studentId,
      courseId,
      level: 'beginner',
      learningStyle: 'reading',
      weakTopics: [],
      strongTopics: [],
      preferredExplanationDepth: 'detailed',
      averageSessionLength: 0,
      totalInteractions: 0,
      lastActivity: new Date(),
      strugglingTopics: [],
      masteredConcepts: [],
      currentStreak: 0
    }
  }

  async updateStudentContext(
    studentId: string,
    courseId: string,
    interaction: {
      query: string
      response: string
      confidence: number
      topic: string
      feedback?: 'helpful' | 'not_helpful'
    }
  ): Promise<void> {
    try {
      // Update learning progress
      await this.updateLearningProgress(studentId, courseId, interaction)
      
      // Store AI interaction
      await AIInteraction.create({
        studentId,
        courseId,
        sessionId: `session_${Date.now()}`,
        query: interaction.query,
        response: interaction.response,
        confidence: interaction.confidence,
        sources: [],
        feedback: interaction.feedback,
        topic: interaction.topic
      })
    } catch (error) {
      console.error('Failed to update student context:', error)
    }
  }

  private async updateLearningProgress(
    studentId: string,
    courseId: string,
    interaction: { confidence: number; topic: string; feedback?: string }
  ): Promise<void> {
    const progress = await LearningProgress.findOne({ studentId, courseId }) || 
      new LearningProgress({ studentId, courseId, topicMastery: [], weakAreas: [], strongAreas: [] })

    // Update topic mastery
    const topicIndex = progress.topicMastery.findIndex(tm => tm.topic === interaction.topic)
    if (topicIndex >= 0) {
      const topic = progress.topicMastery[topicIndex]
      topic.interactions += 1
      topic.score = (topic.score * (topic.interactions - 1) + interaction.confidence) / topic.interactions
      topic.lastUpdated = new Date()
    } else {
      progress.topicMastery.push({
        topic: interaction.topic,
        score: interaction.confidence,
        interactions: 1,
        lastUpdated: new Date()
      })
    }

    // Update weak/strong areas
    const weakThreshold = 0.4
    const strongThreshold = 0.8
    
    progress.weakAreas = progress.topicMastery
      .filter(tm => tm.score < weakThreshold && tm.interactions >= 3)
      .map(tm => tm.topic)
    
    progress.strongAreas = progress.topicMastery
      .filter(tm => tm.score > strongThreshold && tm.interactions >= 3)
      .map(tm => tm.topic)

    // Update overall metrics
    progress.averageScore = progress.topicMastery.reduce((sum, tm) => sum + tm.score, 0) / progress.topicMastery.length
    progress.lastActivity = new Date()

    await progress.save()
  }

  async detectLearningGaps(studentId: string, courseId: string): Promise<LearningGap[]> {
    try {
      const context = await this.getStudentContext(studentId, courseId)
      const gaps: LearningGap[] = []

      // Analyze struggling topics
      context.strugglingTopics.forEach(struggling => {
        const severity = this.calculateGapSeverity(struggling.attempts, struggling.lastAttempt)
        
        gaps.push({
          topic: struggling.topic,
          severity,
          indicators: [
            `${struggling.attempts} low-confidence interactions`,
            `Last struggle: ${struggling.lastAttempt.toDateString()}`
          ],
          recommendedActions: this.getRecommendedActions(struggling.topic, severity),
          detectedAt: new Date(),
          attempts: struggling.attempts
        })
      })

      // Analyze inactive periods
      const daysSinceLastActivity = Math.floor(
        (new Date().getTime() - context.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceLastActivity > 7) {
        gaps.push({
          topic: 'General Engagement',
          severity: daysSinceLastActivity > 14 ? 'high' : 'medium',
          indicators: [`${daysSinceLastActivity} days since last activity`],
          recommendedActions: ['Send engagement reminder', 'Suggest review session'],
          detectedAt: new Date(),
          attempts: 0
        })
      }

      return gaps.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))
    } catch (error) {
      console.error('Failed to detect learning gaps:', error)
      return []
    }
  }

  private calculateGapSeverity(attempts: number, lastAttempt: Date): 'low' | 'medium' | 'high' | 'critical' {
    const daysSinceLastAttempt = Math.floor(
      (new Date().getTime() - lastAttempt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (attempts >= 8 || daysSinceLastAttempt <= 1) return 'critical'
    if (attempts >= 5 || daysSinceLastAttempt <= 3) return 'high'
    if (attempts >= 3 || daysSinceLastAttempt <= 7) return 'medium'
    return 'low'
  }

  private getRecommendedActions(topic: string, severity: string): string[] {
    const baseActions = [
      `Review ${topic} fundamentals`,
      `Practice ${topic} exercises`,
      `Seek additional resources for ${topic}`
    ]

    if (severity === 'critical' || severity === 'high') {
      baseActions.push(`Schedule instructor consultation for ${topic}`)
      baseActions.push(`Join study group for ${topic}`)
    }

    return baseActions
  }

  private getSeverityScore(severity: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 }
    return scores[severity] || 0
  }
}