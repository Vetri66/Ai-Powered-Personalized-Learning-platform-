import type { TreeSvgProps } from "./types"

export function CherryBlossomTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Cherry Blossom Tree">
      <defs>
        <linearGradient id="cherryTrunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A5B34" />
          <stop offset="100%" stopColor="#6E3C1D" />
        </linearGradient>
      </defs>

      <ellipse cx="75" cy="135" rx="34" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 112" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="70" cy="112" rx="5" ry="3" fill="#81C784" />
          <ellipse cx="80" cy="110" rx="4" ry="3" fill="#7BC47F" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C72 112 72 98 74 82 C76 68 81 59 88 51" stroke="url(#cherryTrunk)" strokeWidth={stage === 2 ? 7 : 10} strokeLinecap="round" fill="none" />
          <path d="M74 90 C67 80 62 72 57 66" stroke="#7D4425" strokeWidth={stage >= 3 ? 4 : 3} strokeLinecap="round" fill="none" />
          <path d="M78 79 C87 72 94 65 100 57" stroke="#7D4425" strokeWidth={stage >= 3 ? 4 : 3} strokeLinecap="round" fill="none" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "75px 98px" }}>
          <circle cx="74" cy="66" r={stage === 2 ? 12 : stage === 3 ? 24 : 34} fill="#FFB7C5" />
          <circle cx="56" cy="73" r={stage === 2 ? 9 : stage === 3 ? 19 : 28} fill="#FF9EBF" opacity="0.9" />
          <circle cx="94" cy="73" r={stage === 2 ? 9 : stage === 3 ? 19 : 28} fill="#FF9EBF" opacity="0.9" />
          {stage >= 3 && (
            <>
              <circle cx="66" cy="52" r="8" fill="#FFC4D4" />
              <circle cx="86" cy="52" r="8" fill="#FFC4D4" />
            </>
          )}
        </g>
      )}

      {stage === 4 && (
        <g>
          <circle cx="36" cy="30" r="3" fill="#FFB7C5" opacity="0.8" className="animate-petal-fall" />
          <circle cx="80" cy="24" r="2.6" fill="#FF9EBF" opacity="0.7" className="animate-petal-fall" style={{ animationDelay: "0.7s" }} />
          <circle cx="113" cy="34" r="3" fill="#FFB7C5" opacity="0.75" className="animate-petal-fall" style={{ animationDelay: "1.2s" }} />
        </g>
      )}
    </svg>
  )
}
