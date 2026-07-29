"use client"

import { motion } from "framer-motion"
import React from "react"
import { AnimatedTree } from "./forest-theme"

type Props = {
  species: string
  progress: number
  onInspect?: () => void
  size?: number
}

export function TreeScene({ species, progress, onInspect, size = 220 }: Props) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} onClick={onInspect} className="select-none">
      <div style={{ width: size, height: size }} className="mx-auto">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <AnimatedTree species={species as any} progress={Math.round(progress)} className="mx-auto" />
        </motion.div>
      </div>
    </motion.div>
  )
}
