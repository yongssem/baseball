export default function Batter({ swinging = false }) {
  return (
    <svg viewBox="0 0 80 100" className="w-16 h-20" aria-hidden="true">
      {/* 몸 */}
      <rect x="32" y="40" width="16" height="32" rx="4" fill="#FF9A8B" />
      {/* 머리 */}
      <circle cx="40" cy="30" r="10" fill="#FFE0B2" stroke="#8B6F47" strokeWidth="1.5" />
      {/* 모자 */}
      <path d="M30 26 Q40 18 50 26 L50 30 L30 30 Z" fill="#8B6F47" />
      {/* 다리 */}
      <rect x="34" y="72" width="5" height="20" fill="#2D2D2D" />
      <rect x="41" y="72" width="5" height="20" fill="#2D2D2D" />
      {/* 배트 */}
      <g
        style={{
          transformOrigin: '48px 50px',
          transform: swinging ? 'rotate(-90deg)' : 'rotate(20deg)',
          transition: 'transform 120ms ease-out',
        }}
      >
        <rect x="46" y="20" width="6" height="32" rx="2" fill="#8B6F47" />
        <rect x="46" y="14" width="6" height="8" rx="1.5" fill="#5C4429" />
      </g>
    </svg>
  )
}
