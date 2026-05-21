import { useCallback, useState } from 'react'
import { basesGained, isHit, isOut } from '../game/resultCalculator'

/**
 * 간단한 경기 상태머신: 3아웃 = 이닝 종료, 3이닝 = 경기 종료.
 * 주자는 단순화하여 진루 합산으로 점수 계산
 * (홈런=4, 3루타=3 ...). 실제 베이스 시뮬은 차후 확장.
 */
export default function useGameState({ maxInnings = 3 } = {}) {
  const [inning, setInning] = useState(1)
  const [outs, setOuts] = useState(0)
  const [score, setScore] = useState(0)
  const [atBats, setAtBats] = useState(0)
  const [history, setHistory] = useState([])
  const [isOver, setIsOver] = useState(false)
  const [bases, setBases] = useState(0) // 누상 주자 누계 (단순화)

  const apply = useCallback((result) => {
    setAtBats(a => a + 1)
    setHistory(h => [...h, result])
    if (isOut(result)) {
      setOuts(o => {
        const next = o + 1
        if (next >= 3) {
          // 이닝 종료
          setBases(0)
          if (inning >= maxInnings) {
            setIsOver(true)
          } else {
            setInning(i => i + 1)
          }
          return 0
        }
        return next
      })
    } else if (isHit(result)) {
      const adv = basesGained(result)
      setBases(prev => {
        const total = prev + adv
        // 4 이상이면 득점
        const runs = Math.floor(total / 4)
        if (runs > 0) setScore(s => s + runs)
        return total % 4
      })
    }
    // 파울은 진루 없음 (간단 처리)
  }, [inning, maxInnings])

  const reset = useCallback(() => {
    setInning(1); setOuts(0); setScore(0); setAtBats(0)
    setHistory([]); setIsOver(false); setBases(0)
  }, [])

  return { inning, outs, score, atBats, history, isOver, bases, apply, reset }
}
