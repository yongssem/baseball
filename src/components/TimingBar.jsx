import { useEffect, useState } from 'react'
import { TIMING_WINDOW } from '../game/constants'

/**
 * 타이밍 게이지: 0 → 100% 진행, 가운데가 Perfect 존.
 * @param {Object} p
 * @param {number} p.startedAt - performance.now()
 * @param {number} p.durationMs - 공 비행시간
 * @param {boolean} p.active
 */
export default function TimingBar({ startedAt, durationMs, active }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) return
    let raf
    const tick = () => {
      const now = performance.now()
      const p = Math.min(1, Math.max(0, (now - startedAt) / durationMs))
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, startedAt, durationMs])

  // Perfect/Good 윈도우를 % 로 환산하여 시각화
  const perfectHalf = (TIMING_WINDOW.PERFECT / durationMs) * 100
  const goodHalf = (TIMING_WINDOW.GOOD / durationMs) * 100

  return (
    <div className="w-full">
      <div className="relative h-6 bg-white rounded-full border border-black/10 overflow-hidden">
        {/* Good zone */}
        <div
          className="absolute top-0 bottom-0 bg-mint/60"
          style={{
            left: `calc(50% - ${goodHalf}%)`,
            width: `${goodHalf * 2}%`,
          }}
        />
        {/* Perfect zone */}
        <div
          className="absolute top-0 bottom-0 bg-coral/80"
          style={{
            left: `calc(50% - ${perfectHalf}%)`,
            width: `${perfectHalf * 2}%`,
          }}
        />
        {/* 진행 마커 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-text"
          style={{ left: `calc(${progress * 100}% - 2px)` }}
        />
      </div>
      <p className="text-center text-xs mt-1 opacity-70 font-score">SPACE!</p>
    </div>
  )
}
