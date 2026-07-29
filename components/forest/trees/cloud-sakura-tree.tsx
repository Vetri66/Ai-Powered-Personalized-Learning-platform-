import type { TreeSvgProps } from "./types"

export function CloudSakuraTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Cloud Sakura Tree">
      <ellipse cx="75" cy="135" rx="34" ry="8" fill="rgba(30,41,59,0.16)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 114" stroke="#77B86D" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="72" cy="111" rx="4" ry="2.6" fill="#A5D6A7" />
        </g>
      )}

      {stage >= 2 && <rect x="70" y="98" width={stage === 2 ? 8 : 10} height="32" rx="4" fill="#7B6E66" />}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "75px 100px" }}>
          <ellipse cx="75" cy="68" rx={stage === 2 ? 24 : stage === 3 ? 34 : 43} ry={stage === 2 ? 15 : stage === 3 ? 22 : 28} fill="#FFF0F5" />
          <ellipse cx="56" cy="74" rx={stage === 2 ? 14 : stage === 3 ? 22 : 28} ry={stage === 2 ? 10 : stage === 3 ? 15 : 18} fill="#FFE4EE" opacity="0.9" />
          <ellipse cx="95" cy="74" rx={stage === 2 ? 14 : stage === 3 ? 22 : 28} ry={stage === 2 ? 10 : stage === 3 ? 15 : 18} fill="#FFE4EE" opacity="0.9" />
          {stage === 4 && <ellipse cx="75" cy="58" rx="24" ry="12" fill="#FFFFFF" opacity="0.75" className="animate-glow-pulse" />}
        </g>
      )}
    </svg>
  )
}
