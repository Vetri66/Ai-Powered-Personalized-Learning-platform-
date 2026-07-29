import { AIInteraction, ChatSession, LearningProgress, Course } from '../mongodb/models'
import { LearningGap } from './student-context'

export interface CourseAnalytics {
  courseId: string
  courseName: string
  totalStudents: number
  activeStudents: number
  totalInteractions: number
  averageConfidence: number
  mostAskedQuestions: { question: string; count: number; avgConfidence: number }[]
  confusingTopics: { topic: string; strugglingStudents: number; avgAttempts: number }[]
  learningBottlenecks: { topic: string; severity: 'low' | 'medium' | 'high'; description: string }[]
  studentEngagement: {
    highEngagement: number
    mediumEngagement: number
    lowEngagement: number
    atRisk: number
  }
  contentGaps: { topic: string; missingContent: string[]; priority: number }[]
  improvementSuggestions: string[]
  timeAnalytics: {
    peakHours: number[]
    averageSessionLength: number
    totalStudyTime: number
  }
  difficultyHeatmap: { topic: string; difficulty: number; studentCount: number }[]
}

export interface StudentInsight {
  studentId: string
  studentName?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  engagementScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  learningGaps: LearningGap[]
  strengths: string[]
  recommendations: string[]
  progressTrend: 'improving' | 'stable' | 'declining'
  lastActivity: Date
  totalInteractions: number
  averageConfidence: number
}

export interface InstructorAlert {
  id: string
  type: 'student_at_risk' | 'content_gap' | 'engagement_drop' | 'cheating_attempt' | 'technical_issue'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedStudents: string[]
  recommendedActions: string[]
  createdAt: Date
  resolved: boolean
}

export class AnalyticsEngine {
  async generateCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    try {
      const [course, interactions, sessions, progressRecords] = await Promise.all([
        Course.findById(courseId),
        AIInteraction.find({ courseId }).sort({ createdAt: -1 }),
        ChatSession.find({ courseId }),
        LearningProgress.find({ courseId })
      ])

      if (!course) {
        throw new Error('Course not found')
      }

      const uniqueStudents = [...new Set(interactions.map(i => i.studentId))]
      const activeStudents = this.getActiveStudents(interactions, 7) // Active in last 7 days

      return {
        courseId,
        courseName: course.title,
        totalStudents: uniqueStudents.length,
        activeStudents: activeStudents.length,
        totalInteractions: interactions.length,
        averageConfidence: this.calculateAverageConfidence(interactions),
        mostAskedQuestions: this.analyzeMostAskedQuestions(interactions),
        confusingTopics: this.identifyConfusingTopics(interactions, progressRecords),
        learningBottlenecks: this.identifyLearningBottlenecks(interactions, progressRecords),
        studentEngagement: this.analyzeStudentEngagement(interactions, uniqueStudents),
        contentGaps: this.identifyContentGaps(interactions, course.content),
        improvementSuggestions: this.generateImprovementSuggestions(interactions, progressRecords),
        timeAnalytics: this.analyzeTimePatterns(interactions, sessions),
        difficultyHeatmap: this.generateDifficultyHeatmap(interactions, progressRecords)
      }
    } catch (error) {
      console.error('Failed to generate course analytics:', error)
      throw error
    }
  }

  async generateStudentInsights(courseId: string): Promise<StudentInsight[]> {
    try {
      const [interactions, progressRecords] = await Promise.all([
        AIInteraction.find({ courseId }),
        LearningProgress.find({ courseId })
      ])

      const studentIds = [...new Set(interactions.map(i => i.studentId))]
      const insights: StudentInsight[] = []

      for (const studentId of studentIds) {
        const studentInteractions = interactions.filter(i => i.studentId === studentId)
        const studentProgress = progressRecords.find(p => p.studentId === studentId)

        const insight = await this.generateStudentInsight(
          studentId,
          courseId,
          studentInteractions,
          studentProgress
        )
        insights.push(insight)
      }

      return insights.sort((a, b) => this.getRiskScore(b.riskLevel) - this.getRiskScore(a.riskLevel))
    } catch (error) {
      console.error('Failed to generate student insights:', error)
      return []
    }
  }

  async generateInstructorAlerts(courseId: string): Promise<InstructorAlert[]> {
    try {
      const analytics = await this.generateCourseAnalytics(courseId)
      const studentInsights = await this.generateStudentInsights(courseId)
      const alerts: InstructorAlert[] = []

      // Generate student at-risk alerts
      const atRiskStudents = studentInsights.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical')
      if (atRiskStudents.length > 0) {
        alerts.push({
          id: `at_risk_${Date.now()}`,
          type: 'student_at_risk',
          severity: atRiskStudents.some(s => s.riskLevel === 'critical') ? 'critical' : 'high',
          title: `${atRiskStudents.length} Students at Risk`,
          description: `${atRiskStudents.length} students showing signs of struggle or disengagement`,
          affectedStudents: atRiskStudents.map(s => s.studentId),
          recommendedActions: [
            'Schedule individual check-ins',
            'Provide additional resources',
            'Consider peer tutoring',
            'Review learning materials'
          ],
          createdAt: new Date(),
          resolved: false
        })
      }

      // Generate content gap alerts
      const highPriorityGaps = analytics.contentGaps.filter(gap => gap.priority > 7)
      if (highPriorityGaps.length > 0) {
        alerts.push({
          id: `content_gap_${Date.now()}`,
          type: 'content_gap',
          severity: 'medium',
          title: 'Content Gaps Identified',
          description: `${highPriorityGaps.length} topics need additional content or clarification`,
          affectedStudents: [],
          recommendedActions: [
            'Add supplementary materials',
            'Create additional examples',
            'Record explanation videos',
            'Update course content'
          ],
          createdAt: new Date(),
          resolved: false
        })
      }

      // Generate engagement drop alerts
      if (analytics.studentEngagement.lowEngagement > analytics.totalStudents * 0.3) {
        alerts.push({
          id: `engagement_${Date.now()}`,
          type: 'engagement_drop',
          severity: 'medium',
          title: 'Low Student Engagement',
          description: `${analytics.studentEngagement.lowEngagement} students showing low engagement`,
          affectedStudents: [],
          recommendedActions: [
            'Send engagement reminders',
            'Create interactive content',
            'Host live Q&A sessions',
            'Gamify learning experience'
          ],
          createdAt: new Date(),
          resolved: false
        })
      }

      return alerts.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))
    } catch (error) {
      console.error('Failed to generate instructor alerts:', error)
      return []
    }
  }

  private getActiveStudents(interactions: any[], days: number): string[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return [...new Set(
      interactions
        .filter(i => new Date(i.createdAt) > cutoffDate)
        .map(i => i.studentId)
    )]
  }

  private calculateAverageConfidence(interactions: any[]): number {
    if (interactions.length === 0) return 0
    return interactions.reduce((sum, i) => sum + (i.confidence || 0), 0) / interactions.length
  }

  private analyzeMostAskedQuestions(interactions: any[]): { question: string; count: number; avgConfidence: number }[] {
    const questionMap = new Map<string, { count: number; totalConfidence: number }>()
    
    interactions.forEach(interaction => {
      const question = this.normalizeQuestion(interaction.query)
      const current = questionMap.get(question) || { count: 0, totalConfidence: 0 }
      questionMap.set(question, {
        count: current.count + 1,
        totalConfidence: current.totalConfidence + (interaction.confidence || 0)
      })
    })

    return Array.from(questionMap.entries())
      .map(([question, data]) => ({
        question,
        count: data.count,
        avgConfidence: data.totalConfidence / data.count
      }))
      .filter(item => item.count >= 3) // Only questions asked 3+ times
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private normalizeQuestion(question: string): string {
    // Simple normalization - in production, use more sophisticated NLP
    return question
      .toLowerCase()
      .replace(/[?.,!]/g, '')
      .replace(/\b(what|how|why|when|where|can|could|would|should)\b/g, '')
      .trim()
      .substring(0, 100)
  }

  private identifyConfusingTopics(
    interactions: any[],
    progressRecords: any[]
  ): { topic: string; strugglingStudents: number; avgAttempts: number }[] {
    const topicStats = new Map<string, { students: Set<string>; attempts: number }>()
    
    interactions.forEach(interaction => {
      if (interaction.confidence < 0.5) { // Low confidence indicates confusion
        const current = topicStats.get(interaction.topic) || { students: new Set(), attempts: 0 }
        current.students.add(interaction.studentId)
        current.attempts += 1
        topicStats.set(interaction.topic, current)
      }
    })

    return Array.from(topicStats.entries())
      .map(([topic, stats]) => ({
        topic,
        strugglingStudents: stats.students.size,
        avgAttempts: stats.attempts / stats.students.size
      }))
      .filter(item => item.strugglingStudents >= 3) // At least 3 students struggling
      .sort((a, b) => b.strugglingStudents - a.strugglingStudents)
  }

  private identifyLearningBottlenecks(
    interactions: any[],
    progressRecords: any[]
  ): { topic: string; severity: 'low' | 'medium' | 'high'; description: string }[] {
    const bottlenecks: { topic: string; severity: 'low' | 'medium' | 'high'; description: string }[] = []
    
    // Analyze topics with consistently low confidence
    const topicConfidence = new Map<string, number[]>()
    interactions.forEach(interaction => {
      const confidences = topicConfidence.get(interaction.topic) || []
      confidences.push(interaction.confidence || 0)
      topicConfidence.set(interaction.topic, confidences)
    })

    topicConfidence.forEach((confidences, topic) => {
      const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      const studentCount = new Set(interactions.filter(i => i.topic === topic).map(i => i.studentId)).size
      
      if (avgConfidence < 0.4 && studentCount >= 5) {
        bottlenecks.push({
          topic,
          severity: avgConfidence < 0.3 ? 'high' : 'medium',
          description: `${studentCount} students struggling with ${topic} (avg confidence: ${(avgConfidence * 100).toFixed(1)}%)`
        })
      }
    })

    return bottlenecks.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))
  }

  private analyzeStudentEngagement(
    interactions: any[],
    studentIds: string[]
  ): { highEngagement: number; mediumEngagement: number; lowEngagement: number; atRisk: number } {
    const engagement = { highEngagement: 0, mediumEngagement: 0, lowEngagement: 0, atRisk: 0 }
    
    studentIds.forEach(studentId => {
      const studentInteractions = interactions.filter(i => i.studentId === studentId)
      const recentInteractions = studentInteractions.filter(i => 
        new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      
      const engagementScore = this.calculateEngagementScore(studentInteractions, recentInteractions)
      
      if (engagementScore > 0.8) engagement.highEngagement++
      else if (engagementScore > 0.5) engagement.mediumEngagement++
      else if (engagementScore > 0.2) engagement.lowEngagement++
      else engagement.atRisk++
    })

    return engagement
  }

  private calculateEngagementScore(allInteractions: any[], recentInteractions: any[]): number {
    let score = 0
    
    // Recent activity weight (40%)
    score += Math.min(recentInteractions.length / 10, 1) * 0.4
    
    // Total interactions weight (30%)
    score += Math.min(allInteractions.length / 50, 1) * 0.3
    
    // Quality of interactions weight (30%)
    const avgConfidence = allInteractions.reduce((sum, i) => sum + (i.confidence || 0), 0) / allInteractions.length
    score += avgConfidence * 0.3
    
    return Math.min(score, 1)
  }

  private identifyContentGaps(
    interactions: any[],
    courseContent: any[]
  ): { topic: string; missingContent: string[]; priority: number }[] {
    const gaps: { topic: string; missingContent: string[]; priority: number }[] = []
    
    // Analyze frequently asked questions with low confidence
    const lowConfidenceQuestions = interactions.filter(i => i.confidence < 0.4)
    const topicQuestions = new Map<string, string[]>()
    
    lowConfidenceQuestions.forEach(interaction => {
      const questions = topicQuestions.get(interaction.topic) || []
      questions.push(interaction.query)
      topicQuestions.set(interaction.topic, questions)
    })

    topicQuestions.forEach((questions, topic) => {
      if (questions.length >= 5) { // Topic with 5+ low confidence questions
        const missingContent = this.identifyMissingContent(questions)
        const priority = Math.min(questions.length, 10) // Priority 1-10
        
        gaps.push({
          topic,
          missingContent,
          priority
        })
      }
    })

    return gaps.sort((a, b) => b.priority - a.priority)
  }

  private identifyMissingContent(questions: string[]): string[] {
    // Simple keyword analysis - in production, use more sophisticated NLP
    const keywords = new Map<string, number>()
    
    questions.forEach(question => {
      const words = question.toLowerCase().split(' ')
      words.forEach(word => {
        if (word.length > 4) {
          keywords.set(word, (keywords.get(word) || 0) + 1)
        }
      })
    })

    return Array.from(keywords.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, _]) => `More examples/explanations about ${word}`)
  }

  private generateImprovementSuggestions(
    interactions: any[],
    progressRecords: any[]
  ): string[] {
    const suggestions: string[] = []
    
    const avgConfidence = this.calculateAverageConfidence(interactions)
    if (avgConfidence < 0.6) {
      suggestions.push('Consider adding more detailed explanations and examples to course materials')
    }

    const lowEngagementStudents = progressRecords.filter(p => 
      new Date(p.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    if (lowEngagementStudents > progressRecords.length * 0.3) {
      suggestions.push('Implement engagement strategies like gamification or interactive content')
    }

    const strugglingTopics = this.identifyConfusingTopics(interactions, progressRecords)
    if (strugglingTopics.length > 0) {
      suggestions.push(`Focus on improving content for: ${strugglingTopics.slice(0, 3).map(t => t.topic).join(', ')}`)
    }

    return suggestions
  }

  private analyzeTimePatterns(
    interactions: any[],
    sessions: any[]
  ): { peakHours: number[]; averageSessionLength: number; totalStudyTime: number } {
    const hourCounts = new Array(24).fill(0)
    let totalSessionLength = 0
    let totalStudyTime = 0

    interactions.forEach(interaction => {
      const hour = new Date(interaction.createdAt).getHours()
      hourCounts[hour]++
    })

    sessions.forEach(session => {
      const sessionLength = session.messages.length
      totalSessionLength += sessionLength
      totalStudyTime += sessionLength * 2 // Estimate 2 minutes per message
    })

    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour)

    return {
      peakHours,
      averageSessionLength: sessions.length > 0 ? totalSessionLength / sessions.length : 0,
      totalStudyTime
    }
  }

  private generateDifficultyHeatmap(
    interactions: any[],
    progressRecords: any[]
  ): { topic: string; difficulty: number; studentCount: number }[] {
    const topicDifficulty = new Map<string, { confidences: number[]; students: Set<string> }>()
    
    interactions.forEach(interaction => {
      const current = topicDifficulty.get(interaction.topic) || { confidences: [], students: new Set() }
      current.confidences.push(interaction.confidence || 0)
      current.students.add(interaction.studentId)
      topicDifficulty.set(interaction.topic, current)
    })

    return Array.from(topicDifficulty.entries())
      .map(([topic, data]) => ({
        topic,
        difficulty: 1 - (data.confidences.reduce((sum, c) => sum + c, 0) / data.confidences.length), // Invert confidence for difficulty
        studentCount: data.students.size
      }))
      .filter(item => item.studentCount >= 3)
      .sort((a, b) => b.difficulty - a.difficulty)
  }

  private async generateStudentInsight(
    studentId: string,
    courseId: string,
    interactions: any[],
    progress: any
  ): Promise<StudentInsight> {
    const recentInteractions = interactions.filter(i => 
      new Date(i.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    )

    const engagementScore = this.calculateEngagementScore(interactions, recentInteractions)
    const riskLevel = this.calculateRiskLevel(engagementScore, interactions, progress)
    const progressTrend = this.calculateProgressTrend(interactions)
    
    return {
      studentId,
      level: this.determineStudentLevel(interactions),
      engagementScore,
      riskLevel,
      learningGaps: [], // Would be populated by StudentContextManager
      strengths: progress?.strongAreas || [],
      recommendations: this.generateStudentRecommendations(riskLevel, engagementScore, interactions),
      progressTrend,
      lastActivity: interactions.length > 0 ? new Date(interactions[0].createdAt) : new Date(),
      totalInteractions: interactions.length,
      averageConfidence: this.calculateAverageConfidence(interactions)
    }
  }

  private determineStudentLevel(interactions: any[]): 'beginner' | 'intermediate' | 'advanced' {
    if (interactions.length < 5) return 'beginner'
    
    const avgConfidence = this.calculateAverageConfidence(interactions)
    const complexQuestions = interactions.filter(i => i.query.length > 100).length / interactions.length
    
    if (avgConfidence > 0.8 && complexQuestions > 0.5) return 'advanced'
    if (avgConfidence > 0.6 && complexQuestions > 0.3) return 'intermediate'
    return 'beginner'
  }

  private calculateRiskLevel(
    engagementScore: number,
    interactions: any[],
    progress: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0
    
    // Low engagement increases risk
    if (engagementScore < 0.3) riskScore += 3
    else if (engagementScore < 0.5) riskScore += 2
    else if (engagementScore < 0.7) riskScore += 1
    
    // Low confidence increases risk
    const avgConfidence = this.calculateAverageConfidence(interactions)
    if (avgConfidence < 0.3) riskScore += 3
    else if (avgConfidence < 0.5) riskScore += 2
    else if (avgConfidence < 0.7) riskScore += 1
    
    // Inactivity increases risk
    const daysSinceLastActivity = interactions.length > 0 
      ? Math.floor((Date.now() - new Date(interactions[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 30
    
    if (daysSinceLastActivity > 14) riskScore += 3
    else if (daysSinceLastActivity > 7) riskScore += 2
    else if (daysSinceLastActivity > 3) riskScore += 1
    
    if (riskScore >= 7) return 'critical'
    if (riskScore >= 5) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }

  private calculateProgressTrend(interactions: any[]): 'improving' | 'stable' | 'declining' {
    if (interactions.length < 10) return 'stable'
    
    const recent = interactions.slice(0, Math.floor(interactions.length / 2))
    const older = interactions.slice(Math.floor(interactions.length / 2))
    
    const recentAvg = this.calculateAverageConfidence(recent)
    const olderAvg = this.calculateAverageConfidence(older)
    
    const improvement = recentAvg - olderAvg
    
    if (improvement > 0.1) return 'improving'
    if (improvement < -0.1) return 'declining'
    return 'stable'
  }

  private generateStudentRecommendations(
    riskLevel: string,
    engagementScore: number,
    interactions: any[]
  ): string[] {
    const recommendations: string[] = []
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Schedule immediate instructor consultation')
      recommendations.push('Consider peer tutoring or study group')
    }
    
    if (engagementScore < 0.5) {
      recommendations.push('Increase study frequency')
      recommendations.push('Set daily learning goals')
    }
    
    const avgConfidence = this.calculateAverageConfidence(interactions)
    if (avgConfidence < 0.5) {
      recommendations.push('Review fundamental concepts')
      recommendations.push('Practice with additional exercises')
    }
    
    return recommendations
  }

  private getRiskScore(riskLevel: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 }
    return scores[riskLevel] || 0
  }

  private getSeverityScore(severity: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 }
    return scores[severity] || 0
  }
}