import type { TreeSvgProps } from "./types"

export function StarGalaxyTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Star Galaxy Tree">
      <defs>
        <linearGradient id="galaxyCanopy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1A237E" />
          <stop offset="50%" stopColor="#283593" />
          <stop offset="100%" stopColor="#4A148C" />
        </linearGradient>
        <linearGradient id="galaxyTrunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B4E9A" />
          <stop offset="100%" stopColor="#4A2C62" />
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="135" rx="33" ry="8" fill="rgba(30,41,59,0.2)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 114" stroke="#6E67D0" strokeWidth="3" strokeLinecap="round" />
          <circle cx="75" cy="109" r="5" fill="#8E7CF2" className="animate-glow-pulse" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C75 111 75 98 75 84 C75 72 80 61 88 53" stroke="url(#galaxyTrunk)" strokeWidth={stage === 2 ? 7 : 10} strokeLinecap="round" fill="none" />
          <path d="M75 95 C67 86 61 76 57 66" stroke="#5D3A79" strokeWidth={stage >= 3 ? 4 : 3} strokeLinecap="round" fill="none" />
          <path d="M78 84 C88 77 96 69 102 60" stroke="#5D3A79" strokeWidth={stage >= 3 ? 4 : 3} strokeLinecap="round" fill="none" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "75px 100px" }}>
          <ellipse cx="75" cy="66" rx={stage === 2 ? 20 : stage === 3 ? 30 : 40} ry={stage === 2 ? 14 : stage === 3 ? 24 : 30} fill="url(#galaxyCanopy)" />
          {stage >= 3 && <ellipse cx="62" cy="72" rx="20" ry="14" fill="#303F9F" opacity="0.85" />}
          {stage >= 3 && <ellipse cx="90" cy="72" rx="18" ry="12" fill="#5E35B1" opacity="0.8" />}
          {stage === 4 && <ellipse cx="75" cy="58" rx="22" ry="13" fill="#6A1B9A" opacity="0.6" className="animate-leaf-sway" />}
        </g>
      )}

      {stage >= 3 && (
        <g>
          <circle cx="51" cy="54" r="1.8" fill="#FFD700" className="animate-star-twinkle" />
          <circle cx="68" cy="45" r="1.6" fill="#FFE082" className="animate-star-twinkle" style={{ animationDelay: "0.4s" }} />
          <circle cx="86" cy="50" r="1.9" fill="#FFD700" className="animate-star-twinkle" style={{ animationDelay: "0.8s" }} />
          <circle cx="100" cy="62" r="1.6" fill="#FFE082" className="animate-star-twinkle" style={{ animationDelay: "1.2s" }} />
          {stage === 4 && <circle cx="63" cy="67" r="2" fill="#FFD700" className="animate-star-twinkle" style={{ animationDelay: "1.5s" }} />}
        </g>
      )}
    </svg>
  )
}
