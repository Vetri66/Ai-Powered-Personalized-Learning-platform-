"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type TreeSpecies =
  | "cherry"
  | "maple"
  | "mystic"
  | "jacaranda"
  | "willow"
  | "golden"

type AnimatedTreeProps = {
  species?: TreeSpecies
  progress?: number
  className?: string
}

const speciesLabel: Record<TreeSpecies, string> = {
  cherry: "Cherry Blossom",
  maple: "Autumn Maple",
  mystic: "Mystic Study",
  jacaranda: "Jacaranda",
  willow: "Willow",
  golden: "Golden Knowledge",
}

function TreeCanopy({ species }: { species: TreeSpecies }) {
  switch (species) {
    case "maple":
      return (
        <g>
          <path d="M74 58C63 35 36 35 26 58c-9 21 8 43 23 45h28c16-1 34-21 28-44-4-13-15-19-31-19z" fill="url(#mapleCanopy)" className="forest-tree-breathe" />
          <path d="M49 38l5 8 9-2-4 8 8 5-9 3 2 9-8-5-6 7-3-9-9 3 2-9-8-5 9-3-4-8 9 2z" fill="rgba(255,255,255,0.16)" opacity="0.9" className="forest-tree-sway" />
          <circle cx="34" cy="47" r="2" fill="#fff7ed" className="forest-tree-particle" />
          <circle cx="70" cy="52" r="2.2" fill="#fde68a" className="forest-tree-particle" />
        </g>
      )
    case "mystic":
      return (
        <g>
          <path d="M73 54C67 33 38 31 26 50c-10 17-6 43 13 53h43c21-4 31-28 23-45-4-8-14-13-31-4z" fill="url(#mysticCanopy)" className="forest-tree-breathe" />
          <path d="M34 44c8-8 24-11 37-3 11 7 15 18 13 31-8 6-19 10-32 10-14 0-26-4-33-11 0-11 5-20 15-27z" fill="rgba(255,255,255,0.12)" className="forest-tree-sway" />
          <circle cx="37" cy="46" r="4" fill="#c4b5fd" opacity="0.9" className="forest-tree-glow" />
          <circle cx="58" cy="39" r="3" fill="#99f6e4" opacity="0.85" className="forest-tree-glow" />
          <circle cx="78" cy="56" r="4" fill="#ddd6fe" opacity="0.9" className="forest-tree-glow" />
          <circle cx="51" cy="66" r="3" fill="#93c5fd" opacity="0.9" className="forest-tree-glow" />
        </g>
      )
    case "jacaranda":
      return (
        <g>
          <path d="M75 58C64 34 35 36 25 57c-11 23 6 46 25 46h28c20 0 35-22 27-45-4-10-14-16-30-18z" fill="url(#jacarandaCanopy)" className="forest-tree-breathe" />
          <g opacity="0.92">
            <circle cx="38" cy="44" r="4" fill="#e9d5ff" className="forest-tree-glow" />
            <circle cx="48" cy="38" r="3.5" fill="#c4b5fd" className="forest-tree-glow" />
            <circle cx="60" cy="45" r="4.5" fill="#ddd6fe" className="forest-tree-glow" />
            <circle cx="72" cy="54" r="4" fill="#c084fc" className="forest-tree-glow" />
            <circle cx="54" cy="63" r="3.8" fill="#e9d5ff" className="forest-tree-glow" />
            <circle cx="32" cy="56" r="3.5" fill="#c084fc" className="forest-tree-glow" />
          </g>
        </g>
      )
    case "willow":
      return (
        <g>
          <path d="M72 52C66 35 47 30 31 37c-16 7-20 29-11 42 11 17 35 24 53 17 18-7 24-28 18-44-2-4-6-7-19-0z" fill="url(#willowCanopy)" className="forest-tree-breathe" />
          <path d="M40 58c-4 9-5 18-5 27" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" opacity="0.55" className="forest-tree-sway" />
          <path d="M51 49c-2 11-2 22 1 34" stroke="#86efac" strokeWidth="2" strokeLinecap="round" opacity="0.5" className="forest-tree-sway" />
          <path d="M63 52c0 12 2 23 7 35" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" opacity="0.55" className="forest-tree-sway" />
        </g>
      )
    case "golden":
      return (
        <g>
          <path d="M76 57C66 34 37 34 25 54c-10 18-5 44 15 54h40c19-5 31-26 25-45-3-10-14-15-29-6z" fill="url(#goldenCanopy)" className="forest-tree-breathe" />
          <g opacity="0.85">
            <circle cx="34" cy="43" r="3.5" fill="#fde68a" className="forest-tree-glow" />
            <circle cx="48" cy="38" r="4.2" fill="#fbbf24" className="forest-tree-glow" />
            <circle cx="61" cy="45" r="4" fill="#fde68a" className="forest-tree-glow" />
            <circle cx="72" cy="58" r="3.8" fill="#f59e0b" className="forest-tree-glow" />
            <circle cx="52" cy="65" r="3.8" fill="#facc15" className="forest-tree-glow" />
          </g>
          <circle cx="74" cy="41" r="2.3" fill="#fff7cc" className="forest-tree-glow" />
          <circle cx="30" cy="66" r="2" fill="#fff7cc" className="forest-tree-glow" />
        </g>
      )
    case "cherry":
    default:
      return (
        <g>
          <path d="M77 58C67 33 38 34 26 54c-11 18-6 43 14 53h41c19-5 31-26 25-44-4-10-14-16-29-5z" fill="url(#cherryCanopy)" className="forest-tree-breathe" />
          <g opacity="0.9">
            <circle cx="37" cy="44" r="4" fill="#fbcfe8" className="forest-tree-glow" />
            <circle cx="49" cy="39" r="4.3" fill="#f9a8d4" className="forest-tree-glow" />
            <circle cx="61" cy="46" r="4.4" fill="#fbcfe8" className="forest-tree-glow" />
            <circle cx="71" cy="57" r="4" fill="#f472b6" className="forest-tree-glow" />
            <circle cx="52" cy="66" r="3.8" fill="#fce7f3" className="forest-tree-glow" />
            <circle cx="33" cy="57" r="3.6" fill="#fda4af" className="forest-tree-glow" />
          </g>
        </g>
      )
  }
}

function TreeBase({ progress }: { progress: number }) {
  const opacity = Math.max(0.35, Math.min(1, progress / 100))

  return (
    <g>
      <path
        d="M49 92c2-11 3-22 2-32-1-7 2-14 8-20 5 7 7 14 6 22-1 10 0 20 3 30"
        fill="none"
        stroke="url(#trunkStroke)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M51 68c-7-5-12-12-15-20m31 6c6-6 11-13 14-21m-18 18c-3-4-4-9-4-15"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={opacity}
      />
      <path d="M29 94h45" stroke="rgba(31,41,55,0.18)" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

export function AnimatedTree({ species = "mystic", progress = 100, className }: AnimatedTreeProps) {
  const currentProgress = Math.max(0, Math.min(100, progress))

  return (
    <div
      className={cn(
        "forest-tree-shell relative isolate w-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-gradient-to-br from-white/70 via-white/35 to-transparent p-4 shadow-[0_18px_45px_-24px_rgba(10,14,22,0.45)] backdrop-blur",
        "dark:border-white/10 dark:from-slate-950/80 dark:via-slate-900/60 dark:to-slate-900/20",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(167,243,208,0.25),transparent_40%)] opacity-80" />
      <svg viewBox="0 0 100 110" className="forest-tree-svg relative z-10 h-40 w-full drop-shadow-[0_24px_24px_rgba(0,0,0,0.12)]">
        <defs>
          <linearGradient id="trunkStroke" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(92,64,51,0.95)" />
            <stop offset="100%" stopColor="rgba(82,51,36,0.9)" />
          </linearGradient>
          <linearGradient id="cherryCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe4f1" />
            <stop offset="48%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="mapleCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="mysticCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="jacarandaCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="55%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="willowCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d9f99d" />
            <stop offset="50%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="goldenCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <g className="forest-tree-base forest-tree-sway">
          <TreeBase progress={currentProgress} />
        </g>
        <g className="forest-tree-canopy forest-tree-sway forest-tree-breathe">
          <TreeCanopy species={species} />
        </g>
        <g className="forest-tree-breathe">
          <circle cx="22" cy="28" r="1.9" fill="#fff7cc" className="forest-tree-glow" />
          <circle cx="79" cy="24" r="2.2" fill="#c4b5fd" className="forest-tree-glow" />
          <circle cx="84" cy="73" r="1.5" fill="#bbf7d0" className="forest-tree-glow" />
          <circle cx="16" cy="74" r="1.7" fill="#fce7f3" className="forest-tree-glow" />
        </g>
      </svg>
      <div className="relative z-10 mt-1 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
        <span>{speciesLabel[species]}</span>
        <span>{currentProgress}% grown</span>
      </div>
    </div>
  )
}

export function ForestBackdrop({ className, density = "medium" }: { className?: string; density?: "light" | "medium" | "dense" }) {
  const particles = density === "dense" ? 18 : density === "light" ? 8 : 12

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className="forest-sky absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.75),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(196,181,253,0.26),_transparent_28%),linear-gradient(180deg,_rgba(244,244,245,0.92),_rgba(232,245,233,0.55)_48%,_rgba(219,234,254,0.34)_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.24),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(34,197,94,0.12),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.92),_rgba(15,23,42,0.92)_50%,_rgba(10,16,34,0.96)_100%)]" />
      <div className="forest-mist absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)] blur-2xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      <div className="forest-hills absolute inset-x-[-5%] bottom-[-3%] h-[38%] rounded-t-[55%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),rgba(16,185,129,0.08)_42%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),rgba(34,197,94,0.08)_42%,transparent_72%)]" />
      <div className="forest-silhouette absolute inset-x-[-2%] bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(31,41,55,0.0),rgba(15,23,42,0.12)_10%,rgba(15,23,42,0.28)_100%)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.0),rgba(15,23,42,0.42)_8%,rgba(4,8,20,0.95)_100%)]" />
      <div className="forest-sun absolute left-[10%] top-[14%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.55),rgba(253,224,71,0.12)_38%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(167,139,250,0.36),rgba(167,139,250,0.08)_38%,transparent_74%)]" />
      <div className="forest-rays absolute left-[8%] top-0 h-full w-[42%] bg-[linear-gradient(120deg,transparent,_rgba(255,255,255,0.12),transparent)] opacity-50 blur-xl dark:opacity-30" />
      <div className="forest-fireflies absolute inset-0">
        {Array.from({ length: particles }).map((_, index) => (
          <span
            key={index}
            className="forest-firefly absolute rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,210,0.85)] dark:bg-emerald-200/75"
            style={{
              left: `${8 + ((index * 17) % 84)}%`,
              top: `${12 + ((index * 23) % 68)}%`,
              width: `${1.5 + (index % 3) * 1.2}px`,
              height: `${1.5 + (index % 3) * 1.2}px`,
              animationDelay: `${index * 0.45}s`,
              animationDuration: `${5 + (index % 4)}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function ForestProgressTree({ progress }: { progress: number }) {
  const species: TreeSpecies = progress < 35 ? "mystic" : progress < 70 ? "jacaranda" : "golden"
  return <AnimatedTree species={species} progress={progress} className="h-full" />
}

export function ForestEmptyState({
  title,
  description,
  action,
  progress = 18,
  species = "cherry",
}: {
  title: string
  description: string
  action?: ReactNode
  progress?: number
  species?: TreeSpecies
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-card/80 p-6 shadow-lg shadow-emerald-900/5 backdrop-blur dark:bg-slate-950/55 dark:border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_26%),radial-gradient(circle_at_left,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Forest learning state</p>
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
          {action ? <div>{action}</div> : null}
        </div>
        <AnimatedTree species={species} progress={progress} className="min-h-[220px]" />
      </div>
    </div>
  )
}
