import type { TreeSvgProps } from "./types"

export function AutumnMapleTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Autumn Maple Tree">
      <defs>
        <linearGradient id="mapleTrunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#5F3C1D" />
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="135" rx="32" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 111" stroke="#6DAE4E" strokeWidth="3" strokeLinecap="round" />
          <path d="M75 112 L69 106" stroke="#79C35A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M75 112 L81 106" stroke="#79C35A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C74 114 73 96 76 78 C78 67 84 57 93 50" stroke="url(#mapleTrunk)" strokeWidth={stage === 2 ? 7 : 10} fill="none" strokeLinecap="round" />
          <path d="M75 93 C66 86 60 77 56 69" stroke="#7A4A22" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
          <path d="M79 84 C89 76 97 67 103 58" stroke="#7A4A22" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-leaf-sway">
          <path d="M58 76 C44 68 45 48 63 44 C66 33 82 32 87 42 C104 42 112 58 101 71 C97 84 81 88 70 83 C64 86 58 83 58 76Z" fill={stage === 2 ? "#FFB347" : "#FF6B35"} opacity="0.9" />
          {stage >= 3 && <path d="M78 50 C90 45 103 51 106 63 C111 73 101 84 90 84 C87 90 79 91 72 87" fill="#DC143C" opacity="0.75" />}
          {stage === 4 && <path d="M50 55 C41 63 42 76 52 82 C63 88 77 83 81 72 C90 63 86 47 75 43 C64 40 54 45 50 55Z" fill="#FFD700" opacity="0.55" />}
        </g>
      )}

      {stage === 4 && (
        <g>
          <circle cx="42" cy="28" r="2.6" fill="#FF6B35" className="animate-petal-fall" />
          <circle cx="76" cy="22" r="2.2" fill="#DC143C" className="animate-petal-fall" style={{ animationDelay: "0.8s" }} />
          <circle cx="110" cy="27" r="2.4" fill="#FFD700" className="animate-petal-fall" style={{ animationDelay: "1.4s" }} />
        </g>
      )}
    </svg>
  )
}
