"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Brain, Send, User, Lightbulb, BookOpen, Zap, MessageSquare, Upload, FileText, PlusCircle, History, Trash2, EyeOff } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { QuizModal } from './QuizModal'
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  followUpQuestions?: string[]
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  timestamp: Date
}

export default function AITutorPage() {
  const { language, t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isMounted, setIsMounted] = useState(false)

  const formatTime = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("JavaScript Fundamentals")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  // Chat Session State
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isTemporary, setIsTemporary] = useState(false)
  const [showHistory, setShowHistory] = useState(false) // Toggle for mobile/compact view if needed
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load sessions from API on mount
  useEffect(() => {
    setIsMounted(true)
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
        // If we have sessions, load the messages for the most recent one (first one)
        if (data.length > 0 && !isTemporary) {
          loadSessionMessages(data[0].id)
        } else if (data.length === 0) {
          createNewSession()
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        setCurrentSessionId(sessionId)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // Remove localStorage saving effect
  // useEffect(() => { ... }, [sessions])

  const createNewSession = async () => {
    // If temporary, just exit temporary mode
    if (isTemporary) {
      setIsTemporary(false)
      fetchSessions()
      return
    }

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      })

      if (response.ok) {
        const newSession = await response.json()
        setSessions(prev => [newSession, ...prev])
        setCurrentSessionId(newSession.id)

        const initialMessage: ChatMessage = {
          id: 'init', // Backend will generate real ID
          role: 'assistant',
          content: "Hello! I'm your AI tutor. I'm here to guide you through your learning journey. What would you like to explore today?",
          timestamp: new Date()
        }
        // Save initial greeting
        await saveMessage(newSession.id, initialMessage)
        setMessages([initialMessage])
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const saveMessage = async (sessionId: string, message: Partial<ChatMessage>) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          role: message.role,
          content: message.content,
          confidence: message.confidence,
          sources: message.sources,
          followUpQuestions: message.followUpQuestions
        })
      })

      // Refresh sessions list to update timestamps/titles if needed
      fetchSessions()
    } catch (error) {
      console.error('Failed to save message:', error)
    }
  }

  const switchSession = async (sessionId: string) => {
    setIsTemporary(false)
    await loadSessionMessages(sessionId)
  }

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    try {
      await fetch(`/api/chat/sessions?id=${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== sessionId))

      if (currentSessionId === sessionId) {
        // Deleted current session
        const remaining = sessions.filter(s => s.id !== sessionId)
        if (remaining.length > 0) {
          switchSession(remaining[0].id)
        } else {
          createNewSession()
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const toggleTemporaryChat = () => {
    if (!isTemporary) {
      // Switching TO temporary
      setMessages([{
        id: 'temp-1',
        role: 'assistant',
        content: "You are now in Temporary Mode. This chat will not be saved.",
        timestamp: new Date()
      }])
      setCurrentSessionId(null)
      setIsTemporary(true)
    } else {
      // Switching BACK to saved chats
      fetchSessions()
      setIsTemporary(false)
    }
  }

  const courses = [
    "JavaScript Fundamentals",
    "React Development",
    "Node.js Backend",
    "Database Design"
  ]

  const mockCourseContent = [
    "JavaScript is a programming language that enables interactive web pages.",
    "Variables in JavaScript can be declared using var, let, or const keywords.",
    "Functions are reusable blocks of code that perform specific tasks.",
    "Objects are collections of key-value pairs in JavaScript.",
    "Arrays are ordered lists of values in JavaScript."
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }

    // Update current session title optimistically or fetch fresh list
    // Note: Backend code in /api/chat/messages updates title automatically for first user message
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Save User Message (if not temporary)
    if (!isTemporary && currentSessionId) {
      await saveMessage(currentSessionId, userMessage)
    }

    // Check for Quiz Request
    if (input.toLowerCase().includes('quiz') || input.toLowerCase().includes('test me')) {
      setIsQuizOpen(true)
      setIsLoading(false)
      // Add system message
      const systemMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm starting a quiz for you! Check the popup window.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, systemMsg])
      return
    }

    try {
      const response = await fetch('/api/ai-tutor/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          courseContext: {
            courseId: 'js-101',
            courseName: selectedCourse,
            content: mockCourseContent
          },
          conversationHistory: messages.slice(-5),
          language: language
        })
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          confidence: data.confidence,
          sources: data.sources,
          followUpQuestions: data.followUpQuestions
        }

        setMessages(prev => [...prev, assistantMessage])

        // Save Assistant Message (if not temporary)
        if (!isTemporary && currentSessionId) {
          await saveMessage(currentSessionId, assistantMessage)
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble processing your question. Please try again or rephrase your question.",
        timestamp: new Date(),
        confidence: 0
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUpClick = (question: string) => {
    setInput(question)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setIsUploading(true)
    setUploadStatus('uploading')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('courseId', 'js-101')

      const response = await fetch('/api/upload-context', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedFileName(selectedFile.name)
        setUploadStatus('success')
        // Add system message in chat
        const uploadMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **File uploaded successfully!**\n\n📄 **File:** ${selectedFile.name}\n📦 **Chunks processed:** ${data.chunks}\n\nYou can now ask me anything about this file!`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, uploadMsg])
      } else {
        setUploadStatus('error')
        const errMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ **Upload failed:** ${data.error}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errMsg])
      }
    } catch (error) {
      setUploadStatus('error')
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">AI Tutor</h1>
        <p className="text-muted-foreground">Get personalized guidance and step-by-step explanations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">

          {/* Main Controls */}
          <div className="space-y-2">
            <Button
              onClick={createNewSession}
              className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              New Chat
            </Button>

            <Button
              variant={isTemporary ? "destructive" : "outline"}
              onClick={toggleTemporaryChat}
              className="w-full flex items-center justify-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              {isTemporary ? "Exit Temporary" : "Temporary Chat"}
            </Button>
          </div>

          {/* Chat History List */}
          <Card className="max-h-[300px] flex flex-col">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[200px]">
                <div className="flex flex-col p-2 space-y-1">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => switchSession(session.id)}
                      className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm hover:bg-muted transition-colors ${currentSessionId === session.id ? 'bg-muted font-medium' : ''
                        }`}
                    >
                      <span className="truncate flex-1 pr-2">{session.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteSession(e, session.id)}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No saved chats</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Current Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Learning Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Session Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Understanding Level</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Questions Asked</span>
                  <span>{messages.filter(m => m.role === 'user').length}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Avg Confidence</span>
                  <span>
                    {Math.round(
                      messages
                        .filter(m => m.role === 'assistant' && m.confidence)
                        .reduce((acc, m) => acc + (m.confidence || 0), 0) /
                      messages.filter(m => m.role === 'assistant' && m.confidence).length * 100
                    ) || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Explain this concept simpler",
                "Give me an example",
                "What's the next step?",
                "Test my understanding"
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => setInput(action)}
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Upload Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploadedFileName && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-green-600 truncate font-medium">{uploadedFileName}</span>
                </div>
              )}
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                uploadStatus === 'success' ? 'border-green-500/40 bg-green-500/5' :
                uploadStatus === 'error' ? 'border-red-500/40 bg-red-500/5' :
                'hover:bg-muted/50'
              }`}>
                <input
                  type="file"
                  accept=".pdf,.csv,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {isUploading ? 'Processing...' : 'Click to upload'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, CSV, TXT, Images
                    </span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent" />
                  AI Tutor Chat
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </CardTitle>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <Badge variant="outline">{selectedCourse}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8 border-2 border-accent/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            <Brain className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div className={`p-4 rounded-2xl ${message.role === 'user'
                          ? 'bg-accent text-accent-foreground ml-12'
                          : 'bg-muted'
                          }`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>

                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span suppressHydrationWarning>{isMounted ? formatTime(message.timestamp) : ''}</span>
                              {message.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(message.confidence * 100)}% confidence
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Follow-up Questions */}
                        {message.role === 'assistant' && message.followUpQuestions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-muted-foreground">Suggested questions:</p>
                            {message.followUpQuestions.map((question, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="text-xs mr-2"
                                onClick={() => handleFollowUpClick(question)}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Sources */}
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && message.sources[0] !== 'General Knowledge' && (
                          <div className="mt-2 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Source: {uploadedFileName || 'Uploaded file'}
                            </span>
                          </div>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="w-8 h-8 border-2 border-primary/20">
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 border-2 border-accent/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-4 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-6 border-t">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about the course..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI Tutor is powered by Gemini and acts as a knowledge expert
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        courseContext={{ course: selectedCourse, content: mockCourseContent }}
        conversationHistory={messages.slice(-10)} // Pass last 10 messages for context
      />
    </div>
  )
}