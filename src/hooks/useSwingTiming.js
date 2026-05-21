import { useEffect, useRef, useState, useCallback } from 'react'
import { timingGrade } from '../game/resultCalculator'

/**
 * 스페이스바 스윙 타이밍 측정.
 *  - start(arriveAt): 공이 스트라이크존 도착 예정 시각(ms, performance.now 기준)을 등록
 *  - 사용자가 스페이스바를 누르면 도착 시각과의 차이를 기록
 *  - reset(): 다음 타석을 위해 초기화
 */
export default function useSwingTiming({ enabled = false, arriveAt = null, onSwing } = {}) {
  const [swung, setSwung] = useState(false)
  const [diffMs, setDiffMs] = useState(null)
  const [grade, setGrade] = useState(null)
  const enabledRef = useRef(enabled)
  const arriveAtRef = useRef(arriveAt)
  const swungRef = useRef(false)

  useEffect(() => { enabledRef.current = enabled }, [enabled])
  useEffect(() => { arriveAtRef.current = arriveAt }, [arriveAt])

  const swing = useCallback(() => {
    if (!enabledRef.current || swungRef.current || arriveAtRef.current == null) return
    swungRef.current = true
    const now = performance.now()
    const d = Math.abs(now - arriveAtRef.current)
    const g = timingGrade(d)
    setSwung(true)
    setDiffMs(d)
    setGrade(g)
    onSwing?.({ diffMs: d, grade: g })
  }, [onSwing])

  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        swing()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [swing])

  const reset = useCallback(() => {
    swungRef.current = false
    setSwung(false)
    setDiffMs(null)
    setGrade(null)
  }, [])

  return { swing, reset, swung, diffMs, grade }
}
