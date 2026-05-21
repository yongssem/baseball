import { useCallback, useEffect, useRef, useState } from 'react'
import { TIMING, TIMING_WINDOW } from '../game/constants'

/**
 * 스페이스바 입력 타이밍 판정.
 * @param {Object} p
 * @param {boolean} p.active - 활성화 여부
 * @param {number} p.targetAt - 스트라이크존 도착 시각(ms, performance.now() 기준)
 * @param {(judge: { timing: string, delta: number }) => void} p.onJudge
 */
export default function useSwingTiming({ active, targetAt, onJudge }) {
  const [pressedAt, setPressedAt] = useState(null)
  const firedRef = useRef(false)

  // 활성 상태가 바뀔 때 초기화
  useEffect(() => {
    firedRef.current = false
    setPressedAt(null)
  }, [active, targetAt])

  const judge = useCallback(
    (now) => {
      if (firedRef.current) return
      firedRef.current = true
      const delta = now - targetAt
      const abs = Math.abs(delta)
      let timing = TIMING.MISS
      if (abs <= TIMING_WINDOW.PERFECT) timing = TIMING.PERFECT
      else if (abs <= TIMING_WINDOW.GOOD) timing = TIMING.GOOD
      setPressedAt(now)
      onJudge?.({ timing, delta })
    },
    [targetAt, onJudge],
  )

  useEffect(() => {
    if (!active) return
    const handler = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        judge(performance.now())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, judge])

  // 활성 + 입력 없이 타깃 시각 + GOOD 윈도우가 지나면 자동 Miss 판정
  useEffect(() => {
    if (!active) return
    const wait = Math.max(0, targetAt - performance.now()) + TIMING_WINDOW.GOOD + 50
    const t = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true
        onJudge?.({ timing: TIMING.MISS, delta: TIMING_WINDOW.GOOD + 1 })
      }
    }, wait)
    return () => clearTimeout(t)
  }, [active, targetAt, onJudge])

  return { pressedAt }
}
