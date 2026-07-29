"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Brain, MessageSquare, TrendingUp, Flame, Calendar, Clock } from "lucide-react"
import { ForestBackdrop } from "@/components/forest/forest-theme"

interface Session { id: string; title: string; created_at: string; updated_at: string }
interface Message { id: string; role: string; content: string; confidence?: number; created_at: string }

// LeetCode-style calendar heatmap
function ActivityCalendar({ activityMap }: { activityMap: Map<string, number> }) {
  const today = new Date()
  const weeks: { date: Date; count: number }[][] = []

  // Build 52 weeks of data
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay())

  let week: { date: Date; count: number }[] = []
  const cur = new Date(startDate)

  while (cur <= today) {
    const key = cur.toISOString().split('T')[0]
    week.push({ date: new Date(cur), count: activityMap.get(key) || 0 })
    if (week.length === 7) { weeks.push(week); week = [] }
    cur.setDate(cur.getDate() + 1)
  }
  if (week.length > 0) weeks.push(week)

  const maxCount = Math.max(...Array.from(activityMap.values()), 1)

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted'
    const intensity = count / maxCount
    if (intensity < 0.25) return 'bg-violet-200 dark:bg-violet-900'
    if (intensity < 0.5) return 'bg-violet-400 dark:bg-violet-700'
    if (intensity < 0.75) return 'bg-violet-600 dark:bg-violet-500'
    return 'bg-violet-800 dark:bg-violet-300'
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthLabels: { label: string; col: number }[] = []
  weeks.forEach((week, i) => {
    const firstDay = week[0]?.date
    if (firstDay && firstDay.getDate() <= 7) {
      monthLabels.push({ label: months[firstDay.getMonth()], col: i })
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {weeks.map((_, i) => {
            const label = monthLabels.find(m => m.col === i)
            return (
              <div key={i} className="w-3 mr-0.5 text-xs text-muted-foreground" style={{ minWidth: '14px' }}>
                {label ? label.label : ''}
              </div>
            )
          })}
        </div>
        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <div key={i} className="h-3 text-xs text-muted-foreground leading-3" style={{ minHeight: '14px' }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date.toDateString()}: ${day.count} messages`}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-80 ${getColor(day.count)}`}
                  style={{ minWidth: '12px', minHeight: '12px' }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-xs text-muted-foreground mr-1">Less</span>
          {['bg-muted', 'bg-violet-200 dark:bg-violet-900', 'bg-violet-400 dark:bg-violet-700', 'bg-violet-600 dark:bg-violet-500', 'bg-violet-800 dark:bg-violet-300'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [allMessages, setAllMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/chat/sessions')
      if (!res.ok) return
      const sessionData: Session[] = await res.json()
      setSessions(sessionData)
      const results = await Promise.all(
        sessionData.map(s => fetch(`/api/chat/messages?sessionId=${s.id}`).then(r => r.json()))
      )
      setAllMessages(results.flat())
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const userMessages = allMessages.filter(m => m.role === 'user')
  const aiMessages = allMessages.filter(m => m.role === 'assistant')
  const avgConfidence = aiMessages.length > 0
    ? Math.round(aiMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / aiMessages.length * 100) : 0

  // Activity map: date -> message count
  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    allMessages.forEach(m => {
      const key = new Date(m.created_at).toISOString().split('T')[0]
      map.set(key, (map.get(key) || 0) + 1)
    })
    return map
  }, [allMessages])

  // Streak calculation
  const { currentStreak, longestStreak } = useMemo(() => {
    if (!isMounted || activityMap.size === 0) return { currentStreak: 0, longestStreak: 0 }
    let cur = 0, longest = 0, streak = 0
    const d = new Date()
    // current streak
    while (true) {
      const key = d.toISOString().split('T')[0]
      if (activityMap.has(key)) { cur++; d.setDate(d.getDate() - 1) }
      else break
    }
    // longest streak
    const sorted = Array.from(activityMap.keys()).sort()
    let prev: Date | null = null
    for (const dateStr of sorted) {
      const date = new Date(dateStr)
      if (prev && (date.getTime() - prev.getTime()) === 86400000) streak++
      else streak = 1
      longest = Math.max(longest, streak)
      prev = date
    }
    return { currentStreak: cur, longestStreak: longest }
  }, [activityMap, isMounted])

  // Most active day
  const mostActiveDay = useMemo(() => {
    if (!isMounted || activityMap.size === 0) return null
    let maxKey = '', maxVal = 0
    activityMap.forEach((v, k) => { if (v > maxVal) { maxVal = v; maxKey = k } })
    return maxKey ? { date: new Date(maxKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), count: maxVal } : null
  }, [activityMap, isMounted])

  // Hourly activity
  const hourlyData = useMemo(() => {
    if (!isMounted) return []
    const map = new Map<number, number>()
    allMessages.forEach(m => {
      const h = new Date(m.created_at).getHours()
      map.set(h, (map.get(h) || 0) + 1)
    })
    return Array.from({ length: 24 }, (_, h) => ({
      hour: h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
      messages: map.get(h) || 0
    }))
  }, [allMessages, isMounted])

  // Session details with message counts
  const sessionDetails = useMemo(() => {
    return sessions.map(s => {
      const msgs = allMessages.filter(m => {
        // We can't directly filter by session_id from allMessages since we don't store it
        // Use created_at proximity to session
        return true
      })
      return s
    })
  }, [sessions, allMessages])

  // Topics from real messages
  const topicKeywords = ['javascript', 'react', 'python', 'database', 'sql', 'api', 'css', 'node', 'aws', 'ai', 'machine learning', 'algorithm', 'array', 'function', 'class', 'html', 'typescript', 'git']
  const topicCounts = topicKeywords.map(t => ({
    topic: t.charAt(0).toUpperCase() + t.slice(1),
    count: userMessages.filter(m => m.content.toLowerCase().includes(t)).length
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count).slice(0, 8)

  // Daily messages for bar chart (last 14 days)
  const last14Days = useMemo(() => {
    if (!isMounted) return []
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const key = d.toISOString().split('T')[0]
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: activityMap.get(key) || 0
      }
    })
  }, [activityMap, isMounted])

  if (isLoading) return (
    <div className="container mx-auto p-6 relative flex items-center justify-center h-64">
      <ForestBackdrop density="light" />
      <p className="relative z-10 text-muted-foreground">Loading analytics...</p>
    </div>
  )

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: MessageSquare, label: 'Total Sessions', value: sessions.length },
          { icon: Brain, label: 'Questions Asked', value: userMessages.length },
          { icon: TrendingUp, label: 'Avg Confidence', value: `${avgConfidence}%` },
          { icon: Flame, label: 'Current Streak', value: `${currentStreak} days` },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border-white/20 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar Heatmap */}
      <Card className="border-white/20 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Activity Calendar
              </CardTitle>
              <CardDescription>
                {activityMap.size} active days · Longest streak: {longestStreak} days
                {mostActiveDay && ` · Most active: ${mostActiveDay.date} (${mostActiveDay.count} messages)`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMounted && <ActivityCalendar activityMap={activityMap} />}
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 border border-white/20 bg-white/70 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border-white/20 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
            <CardHeader>
              <CardTitle>Last 14 Days</CardTitle>
              <CardDescription>Daily message activity</CardDescription>
            </CardHeader>
            <CardContent>
              {last14Days.some(d => d.messages > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={last14Days}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No activity in last 14 days</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/20 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>When you study the most</CardDescription>
            </CardHeader>
            <CardContent>
              {hourlyData.some(h => h.messages > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics">
          <Card className="border-white/20 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
            <CardHeader>
              <CardTitle>Topics You've Explored</CardTitle>
              <CardDescription>Based on your actual questions to the AI tutor</CardDescription>
            </CardHeader>
            <CardContent>
              {topicCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="topic" type="category" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <p className="text-sm">No topic data yet — start asking questions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card className="border-white/20 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:bg-slate-950/60 dark:border-white/10">
            <CardHeader>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>{sessions.length} total sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <ForestEmptyState
                  title="No sessions yet"
                  description="Start a conversation with your AI tutor and your analytics forest will begin to grow here."
                  progress={14}
                  species="cherry"
                />
              ) : (
                <div className="space-y-2">
                  {sessions.map((session, i) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-white/15 bg-white/60 transition-colors hover:bg-white/80 dark:bg-slate-950/40 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                          {sessions.length - i}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{session.title}</p>
                          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                            {isMounted ? new Date(session.updated_at).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            }) : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {isMounted ? new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
