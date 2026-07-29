import type { TreeSvgProps } from "./types"

export function PlumBlossomTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Plum Blossom Tree">
      <ellipse cx="75" cy="135" rx="33" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 112" stroke="#5F8C4B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="75" cy="108" r="4.4" fill="#7EBB68" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C71 116 70 100 72 85 C73 70 66 58 56 50" stroke="#4E342E" strokeWidth={stage === 2 ? 7 : 10} fill="none" strokeLinecap="round" />
          <path d="M73 88 C80 78 87 70 96 62" stroke="#4E342E" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
          <path d="M70 98 C62 89 56 79 52 71" stroke="#5D4037" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "74px 96px" }}>
          <circle cx="62" cy="66" r={stage === 2 ? 10 : stage === 3 ? 17 : 22} fill="#E91E63" opacity="0.9" />
          <circle cx="86" cy="63" r={stage === 2 ? 8 : stage === 3 ? 15 : 20} fill="#C2185B" opacity="0.9" />
          {stage >= 3 && <circle cx="77" cy="52" r="14" fill="#E91E63" opacity="0.75" />}
          {stage === 4 && <circle cx="94" cy="78" r="10" fill="#F06292" opacity="0.7" className="animate-glow-pulse" />}
        </g>
      )}
    </svg>
  )
}
