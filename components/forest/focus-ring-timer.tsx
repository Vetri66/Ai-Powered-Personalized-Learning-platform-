"use client"

import { motion } from "framer-motion"
import React from "react"

type Props = {
  secondsLeft: number
  totalSeconds: number
  running: boolean
  onStart: () => void
  onReset: () => void
  onToggle?: () => void
  label?: string
  progress: number
}

export function FocusRingTimer({ secondsLeft, totalSeconds, running, onStart, onReset, label = "Focus session", progress }: Props) {
  const stroke = 2 * Math.PI * 118
  const dashOffset = stroke - (stroke * progress) / 100

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 320 320" className="h-[360px] w-[360px]">
        <defs>
          <linearGradient id="focusRing" x1="0" x2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="160" r="118" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
        <motion.circle
          cx="160"
          cy="160"
          r={118}
          fill="none"
          stroke="url(#focusRing)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={stroke}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 160 160)"
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {label}
        </div>
        <div className="mt-4 text-6xl font-medium text-white">{Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:{(secondsLeft % 60).toString().padStart(2, "0")}</div>
        <div className="mt-3 flex gap-3">
          <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90" onClick={onStart}>
            {running ? "Pause" : "Start"}
          </button>
          <button className="rounded-full bg-transparent px-4 py-2 text-sm text-white/70 border border-white/10" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
