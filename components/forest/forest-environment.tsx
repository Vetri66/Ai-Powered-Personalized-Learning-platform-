"use client"

import React from "react"

type Props = {
  value: string
  onChange: (v: string) => void
}

const OPTIONS = ["Firefly Night", "Morning Sakura", "Rain Study", "Autumn Evening", "Cosmic Focus"]

export function ForestEnvironment({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Environment</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-full px-3 py-1 text-sm ${value === opt ? "bg-white/20 text-white" : "bg-white/6 text-white/70"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
