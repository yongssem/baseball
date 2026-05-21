import { useEffect, useRef, useState } from 'react'

/**
 * 타이밍 게이지: 0 → pitchDuration ms 사이 마커가 좌→우로 이동.
 * 중앙(노란/녹색존)이 Perfect/Good 영역.
 */
export default function TimingBar({ startAt, duration, grade }) {
  const [progress, setProgress] = useState(0) // 0~1
  const rafRef = useRef()

  useEffect(() => {
    if (!startAt || !duration) return
    function tick() {
      const p = Math.min(1, Math.max(0, (performance.now() - startAt) / duration))
      setProgress(p)
      if (p < 1.2) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [startAt, duration])

  // Perfect ±100ms, Good ±250ms 영역을 bar에 환산
  const perfectHalf = 100 / duration
  const goodHalf = 250 / duration
  const center = 1.0

  return (
    <div className="w-full">
      <div className="relative w-full h-4 rounded-full bg-white shadow-inner overflow-hidden">
        {/* Good zone */}
        <div
          className="absolute top-0 bottom-0 bg-mint/60"
          style={{
            left: `${Math.max(0, (center - goodHalf) * 100)}%`,
            width: `${Math.min(100, goodHalf * 2 * 100)}%`,
          }}
        />
        {/* Perfect zone */}
        <div
          className="absolute top-0 bottom-0 bg-coral/70"
          style={{
            left: `${Math.max(0, (center - perfectHalf) * 100)}%`,
            width: `${Math.min(100, perfectHalf * 2 * 100)}%`,
          }}
        />
        {/* 마커 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-text"
          style={{ left: `calc(${progress * 100}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] mt-1 opacity-70">
        <span>스윙은 스페이스바 ⎵</span>
        <span className="font-bold">{grade || '대기'}</span>
      </div>
    </div>
  )
}
