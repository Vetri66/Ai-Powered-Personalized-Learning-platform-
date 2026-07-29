"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Search, Brain, User, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  confidence?: number
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (session: ChatSession) => {
    setSelectedSession(session)
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${session.id}`)
      if (res.ok) setMessages(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await fetch(`/api/chat/sessions?id=${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
    if (selectedSession?.id === id) { setSelectedSession(null); setMessages([]) }
  }

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    if (!isMounted) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    if (!isMounted) return ''
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Chat History</h1>
        <p className="text-muted-foreground">Review your AI tutor conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>Sessions ({sessions.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-2">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No chat sessions yet</p>
                    </div>
                  ) : filtered.map(session => (
                    <div
                      key={session.id}
                      onClick={() => loadMessages(session)}
                      className={`group p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${selectedSession?.id === session.id ? "bg-accent/10 border-accent" : "border-border"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm truncate flex-1">{session.title}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          onClick={e => deleteSession(e, session.id)}>
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Messages View */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">{selectedSession.title}</CardTitle>
                <CardDescription suppressHydrationWarning>{formatDate(selectedSession.created_at)}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No messages in this session</p>
                    ) : messages.map(message => (
                      <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        {message.role === "assistant" && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                              <Brain className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl ${message.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                              {formatTime(message.created_at)}
                            </span>
                            {message.confidence && (
                              <Badge variant="outline" className="text-xs py-0">
                                {Math.round(message.confidence * 100)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Chat Session</h3>
                <p className="text-muted-foreground text-sm">Choose a session from the left to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
