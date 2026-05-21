/**
 * 야구장 SVG (다이아몬드 시점, 단순화).
 * 베이스 좌표는 [x%, y%] - 부모 컨테이너 비율 기반.
 * 향후 공/야수 애니메이션은 이 좌표를 기준으로 합성한다.
 */
export const BASE_POS = {
  home: [50, 88],
  first: [82, 58],
  second: [50, 28],
  third: [18, 58],
  mound: [50, 58],
}

export default function Field({ className = '', children }) {
  return (
    <div className={['relative w-full aspect-[4/3] overflow-hidden rounded-card', className].join(' ')}>
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* 외야 잔디 */}
        <defs>
          <radialGradient id="grass" cx="50%" cy="100%" r="100%">
            <stop offset="0%" stopColor="#C8E6CF" />
            <stop offset="60%" stopColor="#A8E6CF" />
            <stop offset="100%" stopColor="#8DD0B5" />
          </radialGradient>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9E8F0" />
            <stop offset="100%" stopColor="#B6CED9" />
          </linearGradient>
        </defs>

        {/* 하늘 */}
        <rect x="0" y="0" width="400" height="80" fill="url(#sky)" />
        {/* 잔디 */}
        <rect x="0" y="60" width="400" height="240" fill="url(#grass)" />

        {/* 다이아몬드 (흙) */}
        <polygon
          points="200,250 320,170 200,90 80,170"
          fill="#D9B891"
          stroke="#8B6F47"
          strokeWidth="2"
        />
        {/* 마운드 */}
        <circle cx="200" cy="170" r="18" fill="#C8A574" stroke="#8B6F47" strokeWidth="1.5" />
        <rect x="196" y="166" width="8" height="3" fill="#FFFFFF" />

        {/* 베이스 */}
        {[
          { x: 200, y: 250 }, // home
          { x: 320, y: 170 }, // 1st
          { x: 200, y: 90 },  // 2nd
          { x: 80, y: 170 },  // 3rd
        ].map((b, i) => (
          <rect
            key={i}
            x={b.x - 8}
            y={b.y - 8}
            width="16"
            height="16"
            fill="#FFFFFF"
            stroke="#8B6F47"
            strokeWidth="1.5"
            transform={`rotate(45 ${b.x} ${b.y})`}
          />
        ))}

        {/* 홈플레이트 오각형 */}
        <polygon
          points="192,250 208,250 208,256 200,262 192,256"
          fill="#FFFFFF"
          stroke="#8B6F47"
          strokeWidth="1.5"
        />

        {/* 파울 라인 */}
        <line x1="200" y1="250" x2="20" y2="60" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
        <line x1="200" y1="250" x2="380" y2="60" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      </svg>

      {/* 오버레이 슬롯 (공, 야수, 타자) */}
      {children}
    </div>
  )
}
