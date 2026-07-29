"use client"

import React from "react"

type Session = {
  id: string
  label: string
  duration: number
  completedAt: string
  growth: number
}

export function ForestTimeline({ sessions }: { sessions: Session[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Forest timeline</p>
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="text-xs text-white/70">No growth records yet — complete sessions to fill the timeline.</div>
        ) : (
          sessions.slice(0, 8).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-white/6 px-3 py-2 text-xs">
              <div>
                <div className="font-medium">{s.label}</div>
                <div className="text-[11px] text-white/60">{new Date(s.completedAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{s.duration}m</div>
                <div className="text-[11px] text-white/60">+{s.growth}%</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
