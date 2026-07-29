"use client"

import { motion } from "framer-motion"
import React from "react"

type Props = {
  count?: number
  density?: "sparse" | "normal" | "dense"
}

export function AmbientParticles({ count = 12, density = "normal" }: Props) {
  const mult = density === "dense" ? 1.6 : density === "sparse" ? 0.6 : 1

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {Array.from({ length: Math.max(4, Math.floor(count * mult)) }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/70"
          style={{ width: 4 + (i % 3), height: 4 + (i % 3), left: `${10 + (i * 7) % 80}%`, top: `${8 + (i * 9) % 70}%` }}
          animate={{ y: [0, -8 - (i % 6), 0], opacity: [0.2, 1, 0.25], x: [0, (i % 5) - 2, 0] }}
          transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }}
        />
      ))}
    </div>
  )
}
