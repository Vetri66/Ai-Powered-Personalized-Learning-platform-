'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  BookOpen, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Lightbulb,
  MessageSquare,
  BarChart3
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  responseType?: 'explanation' | 'hint' | 'question' | 'warning' | 'escalation'
}

interface AdaptiveLearningResponse {
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
    learningGaps: any[]
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

interface AdaptiveAITutorProps {
  courseId: string
  courseName: string
}

export default function AdaptiveAITutor({ courseId, courseName }: AdaptiveAITutorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(`session_${Date.now()}`)
  const [currentInsights, setCurrentInsights] = useState<AdaptiveLearningResponse['personalizedInsights'] | null>(null)
  const [showInsights, setShowInsights] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-tutor/adaptive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          courseId,
          sessionId,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const adaptiveResponse: AdaptiveLearningResponse = data.data

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: adaptiveResponse.response,
        timestamp: new Date(),
        confidence: adaptiveResponse.confidence,
        sources: adaptiveResponse.sources,
        responseType: adaptiveResponse.responseType
      }

      setMessages(prev => [...prev, assistantMessage])
      setCurrentInsights(adaptiveResponse.personalizedInsights)
      
      // Show insights panel if there are important updates
      if (adaptiveResponse.personalizedInsights.learningGaps.length > 0 || 
          adaptiveResponse.requiresHumanReview) {
        setShowInsights(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact your instructor if the problem persists.',
        timestamp: new Date(),
        confidence: 0,
        responseType: 'escalation'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getResponseTypeIcon = (type?: string) => {
    switch (type) {
      case 'hint': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'question': return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'escalation': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Brain className="h-4 w-4 text-green-500" />
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-200'
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold">AI Learning Assistant</h1>
                <p className="text-sm text-gray-600">{courseName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Insights
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to your AI Learning Assistant!</h3>
                    <p className="text-gray-600 mb-4">
                      I'm here to help you learn and understand concepts through guided exploration. 
                      Ask me questions about the course material, and I'll help you think through the answers.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Personalized explanations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Step-by-step guidance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Learning gap detection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Adaptive difficulty</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getResponseTypeIcon(message.responseType)}
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {message.responseType || 'explanation'}
                        </span>
                      </div>
                      {message.confidence !== undefined && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getConfidenceColor(message.confidence)}`}
                              style={{ width: `${message.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(message.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the course material..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      {showInsights && currentInsights && (
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Learning Insights</h2>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Student Level */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Current Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {currentInsights.studentLevel}
                </Badge>
              </CardContent>
            </Card>

            {/* Strong Topics */}
            {currentInsights.strongTopics.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Strong Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {currentInsights.strongTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weak Topics */}
            {currentInsights.weakTopics.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-orange-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {currentInsights.weakTopics.map((topic, index) => (
                      <Badge key={index} variant="destructive" className="mr-1 mb-1">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Gaps */}
            {currentInsights.learningGaps.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Learning Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentInsights.learningGaps.slice(0, 3).map((gap, index) => (
                      <Alert key={index}>
                        <AlertDescription className="text-xs">
                          <strong>{gap.topic}</strong> - {gap.severity} priority
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {currentInsights.recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-blue-600">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentInsights.recommendations.map((rec, index) => (
                      <div key={index} className="text-xs p-2 bg-blue-50 rounded">
                        {rec}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}