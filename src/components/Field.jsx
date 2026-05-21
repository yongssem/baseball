export default function Field({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 280"
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6E6EE" />
          <stop offset="100%" stopColor="#B6CED9" />
        </linearGradient>
        <radialGradient id="grassGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#C7EBD5" />
          <stop offset="100%" stopColor="#A8E6CF" />
        </radialGradient>
      </defs>

      {/* 하늘 */}
      <rect x="0" y="0" width="400" height="120" fill="url(#skyGrad)" />
      {/* 구름 */}
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx="70" cy="40" rx="22" ry="8" />
        <ellipse cx="90" cy="35" rx="16" ry="7" />
        <ellipse cx="300" cy="55" rx="24" ry="9" />
        <ellipse cx="320" cy="50" rx="14" ry="6" />
      </g>
      {/* 잔디 */}
      <rect x="0" y="120" width="400" height="160" fill="url(#grassGrad)" />

      {/* 다이아몬드 */}
      <polygon
        points="200,140 280,200 200,260 120,200"
        fill="#E9D9BD"
        stroke="#8B6F47"
        strokeWidth="2"
      />
      {/* 마운드 */}
      <circle cx="200" cy="200" r="18" fill="#C9A678" stroke="#8B6F47" strokeWidth="2" />
      <rect x="194" y="196" width="12" height="4" fill="#FFFFFF" rx="1" />

      {/* 베이스 4개 */}
      <g fill="#FFFFFF" stroke="#8B6F47" strokeWidth="1.5">
        <rect x="196" y="136" width="8" height="8" transform="rotate(45 200 140)" />
        <rect x="276" y="196" width="8" height="8" transform="rotate(45 280 200)" />
        <rect x="196" y="256" width="8" height="8" transform="rotate(45 200 260)" />
        <rect x="116" y="196" width="8" height="8" transform="rotate(45 120 200)" />
      </g>
    </svg>
  )
}
