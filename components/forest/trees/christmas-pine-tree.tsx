import type { TreeSvgProps } from "./types"

export function ChristmasPineTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Christmas Pine Tree">
      <ellipse cx="75" cy="135" rx="33" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 114" stroke="#5C8E45" strokeWidth="3" strokeLinecap="round" />
          <path d="M75 114 L70 109" stroke="#74A85C" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M75 114 L80 109" stroke="#74A85C" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "75px 115px" }}>
          <rect x="70" y="102" width="10" height="28" rx="4" fill="#6D4C41" />
          <path d="M75 52 L52 90 H98 Z" fill="#0F5132" />
          {stage >= 3 && <path d="M75 63 L46 103 H104 Z" fill="#14633A" opacity="0.95" />}
          {stage === 4 && <path d="M75 72 L40 116 H110 Z" fill="#1A7A47" opacity="0.92" />}
        </g>
      )}

      {stage >= 3 && (
        <g>
          <circle cx="64" cy="84" r="2.8" fill="#E53935" className="animate-glow-pulse" />
          <circle cx="85" cy="90" r="2.6" fill="#FFCA28" className="animate-glow-pulse" style={{ animationDelay: "0.5s" }} />
          <circle cx="74" cy="100" r="2.6" fill="#E53935" className="animate-glow-pulse" style={{ animationDelay: "0.9s" }} />
          {stage === 4 && <circle cx="92" cy="106" r="2.8" fill="#FFCA28" className="animate-glow-pulse" style={{ animationDelay: "1.2s" }} />}
        </g>
      )}

      {stage === 4 && (
        <g>
          <circle cx="38" cy="22" r="2.2" fill="#ffffff" opacity="0.8" className="animate-petal-fall" />
          <circle cx="81" cy="20" r="2" fill="#ffffff" opacity="0.8" className="animate-petal-fall" style={{ animationDelay: "0.8s" }} />
          <circle cx="112" cy="24" r="2.2" fill="#ffffff" opacity="0.8" className="animate-petal-fall" style={{ animationDelay: "1.4s" }} />
        </g>
      )}
    </svg>
  )
}
