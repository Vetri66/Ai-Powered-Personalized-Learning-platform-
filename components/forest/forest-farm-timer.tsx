"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Clock3, Flame, Sparkles, Trees } from "lucide-react"
import { TREE_DEFINITIONS, type TreeId, type TreeStage } from "@/components/forest/trees"

type EnvironmentId = "firefly" | "sakura" | "rain" | "autumn" | "cosmic"

type SessionRecord = {
  id: string
  treeId: TreeId
  treeName: string
  duration: number
  completedAt: string
  environment: EnvironmentId
  stage: TreeStage
}

type PlantedTree = {
  id: string
  treeId: TreeId
  treeName: string
  plantedAt: string
  totalMinutes: number
  sessions: number
  stage: 1 | 2 | 3 | 4 | 5 | 6
  environment: EnvironmentId
  history: SessionRecord[]
}

type PendingAction =
  | { type: "reset" }
  | { type: "change-duration"; value: number }
  | { type: "change-tree"; value: TreeId }
  | null

const STORAGE_KEY = "study-forest-premium-v3"

const ENVIRONMENTS: Array<{ id: EnvironmentId; label: string; pill: string; sky: string; ground: string }> = [
  {
    id: "firefly",
    label: "Firefly Night",
    pill: "from-indigo-500/25 to-blue-400/15",
    sky: "bg-[radial-gradient(circle_at_18%_20%,rgba(129,140,248,0.28),transparent_30%),radial-gradient(circle_at_75%_18%,rgba(96,165,250,0.2),transparent_30%)]",
    ground: "bg-[linear-gradient(180deg,transparent,rgba(30,41,59,0.26)_20%,rgba(15,23,42,0.45)_100%)]",
  },
  {
    id: "sakura",
    label: "Morning Sakura",
    pill: "from-pink-400/30 to-rose-200/15",
    sky: "bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,0.23),transparent_28%),radial-gradient(circle_at_74%_22%,rgba(244,114,182,0.18),transparent_30%)]",
    ground: "bg-[linear-gradient(180deg,transparent,rgba(251,191,36,0.18)_26%,rgba(251,146,60,0.28)_100%)]",
  },
  {
    id: "rain",
    label: "Rain Study",
    pill: "from-blue-400/25 to-cyan-300/15",
    sky: "bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_75%_22%,rgba(56,189,248,0.18),transparent_32%)]",
    ground: "bg-[linear-gradient(180deg,transparent,rgba(14,116,144,0.16)_26%,rgba(15,23,42,0.28)_100%)]",
  },
  {
    id: "autumn",
    label: "Autumn Evening",
    pill: "from-orange-400/30 to-amber-200/15",
    sky: "bg-[radial-gradient(circle_at_18%_20%,rgba(249,115,22,0.26),transparent_30%),radial-gradient(circle_at_76%_20%,rgba(251,191,36,0.18),transparent_30%)]",
    ground: "bg-[linear-gradient(180deg,transparent,rgba(180,83,9,0.18)_24%,rgba(120,53,15,0.34)_100%)]",
  },
  {
    id: "cosmic",
    label: "Cosmic Focus",
    pill: "from-violet-500/30 to-indigo-300/15",
    sky: "bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.28),transparent_30%),radial-gradient(circle_at_76%_20%,rgba(79,70,229,0.22),transparent_30%)]",
    ground: "bg-[linear-gradient(180deg,transparent,rgba(49,46,129,0.2)_24%,rgba(17,24,39,0.4)_100%)]",
  },
]

function safeLoad() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as {
      selectedTreeId: TreeId
      selectedDuration: number
      secondsLeft: number
      running: boolean
      environment: EnvironmentId
      sessions: SessionRecord[]
      plantedTrees: PlantedTree[]
    }) : null
  } catch {
    return null
  }
}

function safeSave(value: unknown) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

function stageFromProgress(progress: number): TreeStage {
  if (progress < 0.25) return 1
  if (progress < 0.5) return 2
  if (progress < 0.75) return 3
  return 4
}

function matureStage(minutes: number): 1 | 2 | 3 | 4 | 5 | 6 {
  if (minutes < 50) return 1
  if (minutes < 140) return 2
  if (minutes < 320) return 3
  if (minutes < 520) return 4
  if (minutes < 760) return 5
  return 6
}

function stageLabel(stage: number) {
  return ["Seed", "Sprout", "Sapling", "Young Tree", "Mature Tree", "Ancient Tree"][stage - 1] ?? "Seed"
}

function formatClock(seconds: number) {
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

async function saveSessionToSupabase(record: SessionRecord) {
  const hasKeys = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!hasKeys) return

  try {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id ?? null
    await supabase.from("study_forest_sessions").insert({
      user_id: userId,
      tree_id: record.treeId,
      tree_name: record.treeName,
      duration_minutes: record.duration,
      completed_at: record.completedAt,
      environment: record.environment,
      growth_stage: record.stage,
    })
  } catch {
    // Keep local progress even when DB table is unavailable.
  }
}

export function ForestFarmTimer() {
  const [selectedTreeId, setSelectedTreeId] = useState<TreeId>("cherry")
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [environment, setEnvironment] = useState<EnvironmentId>("firefly")
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [plantedTrees, setPlantedTrees] = useState<PlantedTree[]>([])
  const [burst, setBurst] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [rainLevel, setRainLevel] = useState(40)
  const [sparrowLevel, setSparrowLevel] = useState(35)
  const [musicLevel, setMusicLevel] = useState(45)
  const [soundStatus, setSoundStatus] = useState<"idle" | "playing" | "blocked">("idle")

  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const rainGainRef = useRef<GainNode | null>(null)
  const sparrowGainRef = useRef<GainNode | null>(null)
  const musicGainRef = useRef<GainNode | null>(null)
  const rainSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const padOscillatorsRef = useRef<OscillatorNode[]>([])
  const sparrowIntervalRef = useRef<number | null>(null)

  const tree = TREE_DEFINITIONS.find((t) => t.id === selectedTreeId) ?? TREE_DEFINITIONS[0]
  const totalSeconds = selectedDuration * 60
  const progressValue = 1 - secondsLeft / totalSeconds
  const growthStage = stageFromProgress(Math.max(0, Math.min(1, progressValue)))
  const envDef = ENVIRONMENTS.find((e) => e.id === environment) ?? ENVIRONMENTS[0]

  useEffect(() => {
    const saved = safeLoad()
    if (!saved) return
    setSelectedTreeId(saved.selectedTreeId)
    setSelectedDuration(saved.selectedDuration)
    setSecondsLeft(saved.secondsLeft)
    setRunning(false)
    setEnvironment(saved.environment)
    setSessions(saved.sessions)
    setPlantedTrees(saved.plantedTrees)
  }, [])

  useEffect(() => {
    safeSave({
      selectedTreeId,
      selectedDuration,
      secondsLeft,
      running: false,
      environment,
      sessions,
      plantedTrees,
    })
  }, [selectedTreeId, selectedDuration, secondsLeft, environment, sessions, plantedTrees])

  useEffect(() => {
    const ctx = audioContextRef.current
    if (!soundEnabled || !ctx) return

    if (rainGainRef.current) rainGainRef.current.gain.setTargetAtTime((rainLevel / 100) * 0.25, ctx.currentTime, 0.12)
    if (sparrowGainRef.current) sparrowGainRef.current.gain.setTargetAtTime((sparrowLevel / 100) * 0.22, ctx.currentTime, 0.12)
    if (musicGainRef.current) musicGainRef.current.gain.setTargetAtTime((musicLevel / 100) * 0.22, ctx.currentTime, 0.12)
  }, [soundEnabled, rainLevel, sparrowLevel, musicLevel])

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          completeSession()
          return selectedDuration * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running, selectedDuration])

  useEffect(() => {
    const onUnload = (event: BeforeUnloadEvent) => {
      if (!running) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [running])

  const requestSafeAction = (action: PendingAction) => {
    if (!running) {
      commitAction(action)
      return
    }
    setPendingAction(action)
    setConfirmOpen(true)
  }

  const commitAction = (action: PendingAction) => {
    if (!action) return

    if (action.type === "reset") {
      setRunning(false)
      setSecondsLeft(selectedDuration * 60)
      return
    }

    if (action.type === "change-duration") {
      setRunning(false)
      setSelectedDuration(action.value)
      setSecondsLeft(action.value * 60)
      return
    }

    if (action.type === "change-tree") {
      const next = TREE_DEFINITIONS.find((t) => t.id === action.value)
      if (!next) return
      setRunning(false)
      setSelectedTreeId(next.id)
      setSelectedDuration(next.duration)
      setSecondsLeft(next.duration * 60)
    }
  }

  const completeSession = async () => {
    const completed: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      treeId: tree.id,
      treeName: tree.name,
      duration: selectedDuration,
      completedAt: new Date().toISOString(),
      environment,
      stage: 4,
    }

    setSessions((prev) => [completed, ...prev])
    setPlantedTrees((prev) => {
      const index = prev.findIndex((p) => p.treeId === completed.treeId)
      if (index === -1) {
        return [
          {
            id: completed.id,
            treeId: completed.treeId,
            treeName: completed.treeName,
            plantedAt: completed.completedAt,
            totalMinutes: completed.duration,
            sessions: 1,
            stage: matureStage(completed.duration),
            environment,
            history: [completed],
          },
          ...prev,
        ]
      }

      const clone = [...prev]
      const current = clone[index]
      const totalMinutes = current.totalMinutes + completed.duration
      clone[index] = {
        ...current,
        totalMinutes,
        sessions: current.sessions + 1,
        stage: matureStage(totalMinutes),
        environment,
        history: [completed, ...current.history],
      }
      return clone
    })

    setBurst(true)
    window.setTimeout(() => setBurst(false), 2000)
    await saveSessionToSupabase(completed)
  }

  const weeklySessions = useMemo(() => {
    const weekStart = Date.now() - 7 * 86400000
    return sessions.filter((session) => new Date(session.completedAt).getTime() >= weekStart).length
  }, [sessions])

  const totalFocusHours = useMemo(() => {
    const mins = sessions.reduce((sum, s) => sum + s.duration, 0)
    return (mins / 60).toFixed(1)
  }, [sessions])

  const monthlyMilestones = useMemo(() => {
    const milestones: string[] = []
    if (sessions.length > 0) {
      const first = sessions[sessions.length - 1]
      milestones.push(`\uD83C\uDF31 First tree planted on ${new Date(first.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`)
    }
    plantedTrees.forEach((treeEntry) => {
      if (treeEntry.stage >= 5) {
        milestones.push(`\u2728 ${treeEntry.treeName} reached ${stageLabel(treeEntry.stage)} after ${Math.round(treeEntry.totalMinutes / 60)}h focus`)
      }
    })
    if (weeklySessions >= 7) milestones.push("\uD83D\uDD25 7-day focus rhythm unlocked")
    return milestones.slice(0, 6)
  }, [sessions, plantedTrees, weeklySessions])

  const TreeComponent = tree.component
  const ringCircumference = 2 * Math.PI * 122
  const ringOffset = ringCircumference * (1 - progressValue)

  const buildNoise = (ctx: AudioContext) => {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  const stopAudio = () => {
    if (sparrowIntervalRef.current !== null) {
      window.clearInterval(sparrowIntervalRef.current)
      sparrowIntervalRef.current = null
    }
    rainSourceRef.current?.stop()
    rainSourceRef.current = null
    padOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
      } catch {
        // noop
      }
    })
    padOscillatorsRef.current = []
    audioContextRef.current?.close()
    audioContextRef.current = null
    masterGainRef.current = null
    rainGainRef.current = null
    sparrowGainRef.current = null
    musicGainRef.current = null
  }

  const ensureAudioStarted = async () => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return false

    if (!audioContextRef.current) {
      const ctx = new AudioCtor()
      audioContextRef.current = ctx

      const master = ctx.createGain()
      master.gain.value = 0.28
      master.connect(ctx.destination)
      masterGainRef.current = master

      const rainGain = ctx.createGain()
      rainGain.gain.value = 0.16
      rainGain.connect(master)
      rainGainRef.current = rainGain

      const sparrowGain = ctx.createGain()
      sparrowGain.gain.value = 0.12
      sparrowGain.connect(master)
      sparrowGainRef.current = sparrowGain

      const musicGain = ctx.createGain()
      musicGain.gain.value = 0.16
      musicGain.connect(master)
      musicGainRef.current = musicGain

      const rainSource = ctx.createBufferSource()
      rainSource.buffer = buildNoise(ctx)
      rainSource.loop = true
      const rainFilter = ctx.createBiquadFilter()
      rainFilter.type = "lowpass"
      rainFilter.frequency.value = 1200
      rainSource.connect(rainFilter)
      rainFilter.connect(rainGain)
      rainSource.start()
      rainSourceRef.current = rainSource

      const chord = [220, 277.18, 329.63]
      padOscillatorsRef.current = chord.map((freq, idx) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = idx === 0 ? "sine" : "triangle"
        osc.frequency.value = freq
        oscGain.gain.value = 0.02
        osc.connect(oscGain)
        oscGain.connect(musicGain)
        osc.start()
        return osc
      })

      const chirp = () => {
        if (!audioContextRef.current || !sparrowGainRef.current) return
        const c = audioContextRef.current
        const o = c.createOscillator()
        const g = c.createGain()
        o.type = "sine"
        o.frequency.setValueAtTime(1600 + Math.random() * 700, c.currentTime)
        o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 200, c.currentTime + 0.12)
        g.gain.setValueAtTime(0.0001, c.currentTime)
        g.gain.exponentialRampToValueAtTime(0.09, c.currentTime + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.15)
        o.connect(g)
        g.connect(sparrowGainRef.current)
        o.start()
        o.stop(c.currentTime + 0.16)
      }

      sparrowIntervalRef.current = window.setInterval(() => {
        if (Math.random() > 0.45) chirp()
      }, 2400)
    }

    const ctx = audioContextRef.current
    if (ctx?.state === "suspended") {
      await ctx.resume()
    }

    return audioContextRef.current?.state === "running"
  }

  const handleSoundToggle = async () => {
    if (soundEnabled) {
      setSoundEnabled(false)
      setSoundStatus("idle")
      stopAudio()
      return
    }

    try {
      const ok = await ensureAudioStarted()
      if (!ok) {
        setSoundStatus("blocked")
        return
      }
      setSoundEnabled(true)
      setSoundStatus("playing")
    } catch {
      setSoundStatus("blocked")
    }
  }

  const playTestTone = async () => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) {
      alert("Web Audio API not supported in your browser")
      return
    }

    try {
      const ctx = new AudioCtor()
      if (ctx.state === "suspended") {
        await ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.2)
      setSoundStatus("playing")
      window.setTimeout(() => setSoundStatus("idle"), 300)
    } catch (error) {
      alert("Could not play test tone: " + String(error))
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white">
      <div className={cn("absolute inset-0", envDef.sky)} />
      <div className={cn("absolute inset-x-0 bottom-0 h-[44%]", envDef.ground)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(192,132,252,0.12),transparent_28%)]" />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr_0.8fr]">
          <section className="space-y-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-[0.14em] text-white/85">FOREST INSIGHTS</h2>
              <Badge className="bg-white/20 text-white">{envDef.label}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Trees" value={String(plantedTrees.length)} icon={<Trees className="h-4 w-4" />} />
              <StatTile label="Focus" value={`${totalFocusHours}h`} icon={<Clock3 className="h-4 w-4" />} />
              <StatTile label="Week" value={`${weeklySessions}`} icon={<Flame className="h-4 w-4" />} />
              <StatTile label="Sessions" value={`${sessions.length}`} icon={<Sparkles className="h-4 w-4" />} />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-white/70">Environment</p>
              <div className="flex flex-wrap gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setEnvironment(env.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition",
                      environment === env.id ? "border-white/30 bg-white/20 text-white" : "border-white/12 bg-white/5 text-white/75 hover:bg-white/12"
                    )}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/12 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/65">Growth ladder</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((stage) => (
                  <div key={stage} className={cn("rounded-xl border p-2 text-center", growthStage >= stage ? "border-white/28 bg-white/18" : "border-white/10 bg-white/4")}>
                    <p className="text-[11px] font-semibold">S{stage}</p>
                    <p className="text-[10px] text-white/70">{["Seed", "Sprout", "Young", "Full"][stage - 1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/12 bg-white/6 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-white/70">Calm soundscape</p>
                <Button size="sm" variant="outline" className="border-white/20 bg-white/8 text-white hover:bg-white/15" onClick={handleSoundToggle}>
                  {soundEnabled ? "Sound On" : "Enable Sound"}
                </Button>
              </div>
              <p className="text-[11px] text-white/70">
                {soundStatus === "playing"
                  ? "Playing rain, sparrow, and calm music."
                  : soundStatus === "blocked"
                    ? "Browser blocked autoplay. Press Enable Sound again."
                    : "Enable sound to hear ambient forest audio."}
              </p>
              <SoundSlider label="Rain" value={rainLevel} onChange={setRainLevel} disabled={!soundEnabled} />
              <SoundSlider label="Sparrow" value={sparrowLevel} onChange={setSparrowLevel} disabled={!soundEnabled} />
              <SoundSlider label="Calm music" value={musicLevel} onChange={setMusicLevel} disabled={!soundEnabled} />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 md:p-8 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: environment === "rain" ? 26 : 14 }).map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "absolute rounded-full bg-white/70",
                    environment === "rain" ? "h-4 w-[1.5px] animate-rain-drift" : "h-1.5 w-1.5 animate-float-orb"
                  )}
                  style={{
                    left: `${7 + ((idx * 13) % 84)}%`,
                    top: `${8 + ((idx * 19) % 80)}%`,
                    animationDelay: `${idx * 0.25}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center">
              <p className="text-xs uppercase tracking-[0.26em] text-white/70">Study Forest Core</p>
              <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Grow a living tree while you focus</h1>
            </div>

            <div className="relative z-10 mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="relative flex items-center justify-center rounded-[2rem] border border-white/12 bg-white/[0.07] p-4">
                <svg viewBox="0 0 300 300" className="h-[300px] w-[300px] max-w-full">
                  <defs>
                    <linearGradient id="focus-ring-gradient" x1="0" x2="1">
                      <stop offset="0%" stopColor="#93C5FD" />
                      <stop offset="45%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#F9A8D4" />
                    </linearGradient>
                  </defs>
                  <circle cx="150" cy="150" r="122" stroke="rgba(255,255,255,0.16)" strokeWidth="16" fill="none" />
                  <motion.circle
                    cx="150"
                    cy="150"
                    r="122"
                    stroke="url(#focus-ring-gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 150 150)"
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
                    Focus timer
                  </p>
                  <p className="mt-4 text-6xl font-semibold leading-none text-white">{formatClock(secondsLeft)}</p>
                  <p className="mt-2 text-xs text-white/70">{tree.name} • Stage {growthStage}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button onClick={() => setRunning((v) => !v)} className="rounded-full bg-white/18 text-white hover:bg-white/26">
                      {running ? "Pause" : "Start Focus"}
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => requestSafeAction({ type: "reset" })}>
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Live growth scene</p>
                  <Badge className={cn("border-none bg-gradient-to-r text-white", envDef.pill)}>{envDef.label}</Badge>
                </div>
                <div className="relative flex h-[300px] items-end justify-center overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(125,211,252,0.15),rgba(74,222,128,0.08)_60%,rgba(22,163,74,0.18))]">
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(21,128,61,0.1),rgba(21,128,61,0.45))]" />
                  <motion.div key={`${tree.id}-${growthStage}`} initial={{ opacity: 0.7, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10 h-[170px] w-[170px]">
                    <TreeComponent stage={growthStage} className="h-full w-full" />
                  </motion.div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[25, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      className={cn(
                        "rounded-full border px-2 py-1.5 text-xs transition",
                        selectedDuration === m ? "border-white/30 bg-white/22 text-white" : "border-white/12 bg-white/6 text-white/75 hover:bg-white/12"
                      )}
                      onClick={() => requestSafeAction({ type: "change-duration", value: m })}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {burst && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_50%_62%,rgba(250,204,21,0.28),transparent_20%)]"
                />
              )}
            </AnimatePresence>
          </section>

          <section className="space-y-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-[0.14em] text-white/85">TREE SPECIES</h3>
              <Badge className="bg-white/20 text-white">{TREE_DEFINITIONS.length} types</Badge>
            </div>

            <ScrollArea className="h-[620px] pr-3">
              <div className="space-y-3">
                {TREE_DEFINITIONS.map((candidate) => {
                  const CandidateTree = candidate.component
                  const locked = selectedDuration < candidate.duration
                  return (
                    <button
                      key={candidate.id}
                      onClick={() => requestSafeAction({ type: "change-tree", value: candidate.id })}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition",
                        selectedTreeId === candidate.id ? "border-white/35 bg-white/22" : "border-white/12 bg-white/8 hover:bg-white/14",
                        locked && "opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-20 w-20 shrink-0 rounded-xl border border-white/12 bg-white/8 p-1">
                          <CandidateTree stage={4} className="h-full w-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{candidate.name}</p>
                          <p className="mt-1 text-xs text-white/70">{candidate.description}</p>
                          <p className="mt-1 text-[11px] text-white/60">
                            {candidate.duration} min • {candidate.rarity}
                          </p>
                          {locked ? <p className="mt-1 text-[11px] text-amber-200">Unlocks with {candidate.duration}m timer</p> : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-[0.14em] text-white/85">FOREST FLOOR</h3>
                <Badge className="bg-white/20 text-white">Scrollable timeline</Badge>
              </div>

              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex min-w-max items-end gap-4 pr-4">
                  {plantedTrees.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/8 px-6 py-5 text-sm text-white/70">
                      No planted trees yet. Complete a focus session to grow your first tree.
                    </div>
                  ) : (
                    plantedTrees.map((planted) => {
                      const PlantedComponent = TREE_DEFINITIONS.find((t) => t.id === planted.treeId)?.component ?? TREE_DEFINITIONS[0].component
                      return (
                        <motion.div key={planted.id} whileHover={{ y: -6 }} className="w-[260px] shrink-0 rounded-2xl border border-white/18 bg-white/10 p-3">
                          <div className="flex h-36 items-end justify-center rounded-xl border border-white/12 bg-white/8">
                            <PlantedComponent stage={Math.min(4, Math.max(1, Math.ceil(planted.stage / 1.5))) as TreeStage} className="h-[130px] w-[130px]" />
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white">{planted.treeName}</p>
                          <p className="mt-1 text-xs text-white/70">
                            Planted {new Date(planted.plantedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {planted.sessions} sessions • {stageLabel(planted.stage)}
                          </p>
                          <p className="mt-1 text-xs text-white/65">{Math.round((planted.totalMinutes / 60) * 10) / 10} focus hours • {ENVIRONMENTS.find((e) => e.id === planted.environment)?.label}</p>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-[0.14em] text-white/85">FOREST MEMORY</h3>
              <ScrollArea className="h-[230px] pr-3">
                <div className="space-y-2">
                  {monthlyMilestones.length === 0 ? (
                    <div className="rounded-xl border border-white/16 bg-white/8 p-3 text-xs text-white/70">
                      Milestones appear as your forest matures.
                    </div>
                  ) : (
                    monthlyMilestones.map((milestone, idx) => (
                      <div key={`${milestone}-${idx}`} className="rounded-xl border border-white/16 bg-white/8 p-3 text-xs text-white/80">
                        {milestone}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </section>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard current focus session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your in-progress tree growth is not saved until the timer completes. Continue only if you want to abandon this run.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>Keep session</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false)
                commitAction(pendingAction)
                setPendingAction(null)
              }}
            >
              Discard and continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/8 p-3">
      <div className="mb-2 flex items-center justify-between text-white/70">
        <p className="text-[11px] uppercase tracking-[0.12em]">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function SoundSlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <label className={cn("block", disabled && "opacity-60")}>
      <div className="mb-1 flex items-center justify-between text-xs text-white/75">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20"
      />
    </label>
  )
}
