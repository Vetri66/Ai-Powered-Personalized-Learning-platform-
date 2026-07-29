import type { TreeSvgProps } from "./types"

export function JacarandaTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Jacaranda Tree">
      <ellipse cx="75" cy="135" rx="34" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 112" stroke="#628E4E" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="72" cy="108" rx="4" ry="2.5" fill="#92D180" />
          <ellipse cx="79" cy="108" rx="4" ry="2.5" fill="#92D180" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C74 118 74 102 76 88 C78 73 83 62 92 54" stroke="#4A2C22" strokeWidth={stage === 2 ? 7 : 10} fill="none" strokeLinecap="round" />
          <path d="M75 93 C67 84 62 75 58 67" stroke="#5B372A" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
          <path d="M79 84 C88 78 95 69 100 61" stroke="#5B372A" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "76px 98px" }}>
          <ellipse cx="76" cy="66" rx={stage === 2 ? 22 : stage === 3 ? 31 : 40} ry={stage === 2 ? 14 : stage === 3 ? 21 : 27} fill="#9C27B0" opacity="0.88" />
          <ellipse cx="58" cy="72" rx={stage === 2 ? 10 : stage === 3 ? 16 : 21} ry={stage === 2 ? 7 : stage === 3 ? 11 : 14} fill="#CE93D8" opacity="0.85" />
          <ellipse cx="94" cy="72" rx={stage === 2 ? 10 : stage === 3 ? 16 : 21} ry={stage === 2 ? 7 : stage === 3 ? 11 : 14} fill="#CE93D8" opacity="0.85" />
          {stage === 4 && <ellipse cx="76" cy="55" rx="20" ry="11" fill="#E1BEE7" opacity="0.65" />}
        </g>
      )}

      {stage >= 3 && (
        <g>
          <circle cx="44" cy="32" r="2.3" fill="#C77DFF" className="animate-petal-fall" />
          <circle cx="79" cy="24" r="2.2" fill="#D9A9FF" className="animate-petal-fall" style={{ animationDelay: "0.6s" }} />
          <circle cx="108" cy="33" r="2.3" fill="#C77DFF" className="animate-petal-fall" style={{ animationDelay: "1.1s" }} />
        </g>
      )}
    </svg>
  )
}
