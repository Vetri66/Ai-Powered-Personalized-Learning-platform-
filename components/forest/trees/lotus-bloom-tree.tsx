import type { TreeSvgProps } from "./types"

export function LotusBloomTree({ stage, className }: TreeSvgProps) {
  return (
    <svg viewBox="0 0 150 150" className={className ?? "h-full w-full"} aria-label="Lotus Bloom Tree">
      <ellipse cx="75" cy="136" rx="35" ry="8" fill="rgba(30,41,59,0.16)" />

      {stage === 1 && (
        <g>
          <path d="M75 132 L75 114" stroke="#6B9C52" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="70" cy="111" rx="4" ry="2.6" fill="#9AD47D" />
          <ellipse cx="80" cy="111" rx="4" ry="2.6" fill="#9AD47D" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d="M75 130 C75 112 75 97 76 84 C77 71 82 61 90 53" stroke="#675045" strokeWidth={stage === 2 ? 7 : 10} fill="none" strokeLinecap="round" />
          <path d="M75 94 C67 86 62 78 58 70" stroke="#6E5A4F" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
          <path d="M78 85 C88 78 95 70 101 61" stroke="#6E5A4F" strokeWidth={stage >= 3 ? 4 : 3} fill="none" strokeLinecap="round" />
        </g>
      )}

      {stage >= 2 && (
        <g className="animate-gentle-sway" style={{ transformOrigin: "75px 101px" }}>
          <ellipse cx="75" cy="72" rx={stage === 2 ? 16 : stage === 3 ? 24 : 33} ry={stage === 2 ? 11 : stage === 3 ? 16 : 22} fill="#F8BBD0" opacity="0.9" />
          <path d="M75 58 L66 76 L75 70 L84 76 Z" fill="#FCE4EC" opacity="0.85" />
          {stage >= 3 && <path d="M58 76 L70 64 L71 82 Z" fill="#F48FB1" opacity="0.7" />}
          {stage >= 3 && <path d="M92 76 L80 64 L79 82 Z" fill="#F48FB1" opacity="0.7" />}
          {stage === 4 && <ellipse cx="75" cy="82" rx="24" ry="9" fill="#80CBC4" opacity="0.35" className="animate-leaf-sway" />}
        </g>
      )}
    </svg>
  )
}
