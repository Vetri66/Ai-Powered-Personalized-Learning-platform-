import type { TreeSvgProps } from "./types"

export function WeepingWillowTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Weeping Willow Tree">
      <ellipse cx="75" cy="135" rx="35" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 113" stroke="#5F8A4A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="75" cy="108" r="4" fill="#9CCC65" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C74 118 74 105 75 90 C76 74 82 62 90 53" stroke="#6D5C54" strokeWidth={stage === 2 ? 7 : 10} strokeLinecap="round" fill="none" />
          <path d="M75 96 C66 86 60 76 56 68" stroke="#726158" strokeWidth={stage >= 3 ? 4 : 3} strokeLinecap="round" fill="none" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "75px 96px" }}>
          <ellipse cx="74" cy="68" rx={stage === 2 ? 20 : stage === 3 ? 30 : 36} ry={stage === 2 ? 14 : stage === 3 ? 20 : 24} fill="#90EE90" opacity="0.9" />
          <ellipse cx="58" cy="74" rx={stage === 2 ? 11 : stage === 3 ? 16 : 20} ry={stage === 2 ? 8 : stage === 3 ? 12 : 14} fill="#A5D6A7" opacity="0.9" />
          <ellipse cx="92" cy="74" rx={stage === 2 ? 11 : stage === 3 ? 16 : 20} ry={stage === 2 ? 8 : stage === 3 ? 12 : 14} fill="#A5D6A7" opacity="0.9" />
        </g>
      )}

      {stage >= 3 && (
        <g>
          <path d="M58 74 C54 88 53 98 53 111" stroke="#808000" strokeWidth="2.4" strokeLinecap="round" className="animate-leaf-sway" />
          <path d="M70 72 C67 90 66 101 67 116" stroke="#6E8B3D" strokeWidth="2.4" strokeLinecap="round" className="animate-leaf-sway" style={{ animationDelay: "0.4s" }} />
          <path d="M83 72 C82 88 83 100 86 115" stroke="#6E8B3D" strokeWidth="2.4" strokeLinecap="round" className="animate-leaf-sway" style={{ animationDelay: "0.8s" }} />
          <path d="M95 74 C97 90 100 101 104 113" stroke="#808000" strokeWidth="2.4" strokeLinecap="round" className="animate-leaf-sway" style={{ animationDelay: "1.2s" }} />
        </g>
      )}
    </svg>
  )
}
