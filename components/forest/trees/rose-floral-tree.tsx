import type { TreeSvgProps } from "./types"

export function RoseFloralTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Rose Floral Tree">
      <ellipse cx="75" cy="135" rx="34" ry="8" fill="rgba(30,41,59,0.18)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 113" stroke="#6E9A52" strokeWidth="3" strokeLinecap="round" />
          <circle cx="75" cy="108" r="4" fill="#8BCB6D" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C73 112 73 96 76 82 C78 68 84 58 94 50" stroke="#6D3F2B" strokeWidth={stage === 2 ? 7 : 10} fill="none" strokeLinecap="round" />
          <path d="M74 92 C66 84 61 76 57 68" stroke="#744733" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
          <path d="M79 84 C89 76 96 68 101 60" stroke="#744733" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "76px 100px" }}>
          <circle cx="74" cy="68" r={stage === 2 ? 12 : stage === 3 ? 22 : 30} fill="#F06292" opacity="0.9" />
          <circle cx="58" cy="74" r={stage === 2 ? 8 : stage === 3 ? 16 : 22} fill="#EC407A" opacity="0.85" />
          <circle cx="92" cy="74" r={stage === 2 ? 8 : stage === 3 ? 16 : 22} fill="#EC407A" opacity="0.85" />
          {stage >= 3 && <circle cx="76" cy="54" r="13" fill="#F48FB1" opacity="0.75" />}
          {stage === 4 && (
            <>
              <circle cx="64" cy="62" r="6" fill="#FCE4EC" opacity="0.75" className="animate-glow-pulse" />
              <circle cx="88" cy="62" r="6" fill="#FCE4EC" opacity="0.75" className="animate-glow-pulse" style={{ animationDelay: "0.6s" }} />
            </>
          )}
        </g>
      )}
    </svg>
  )
}
