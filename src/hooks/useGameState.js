import { useCallback, useMemo, useState } from 'react'
import { GAME_MODE, RESULT_SCORE } from '../game/constants'
import { isOut, isHit } from '../game/resultCalculator'

const MAX_INNINGS = 3
const MAX_OUTS = 3
const MAX_AT_BATS = 10

export default function useGameState({ mode = GAME_MODE.INNING } = {}) {
  const [history, setHistory] = useState([]) // [{ result, score, trigger, correct, timing, ts }]
  const [outs, setOuts] = useState(0)
  const [inning, setInning] = useState(1)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)

  const atBats = history.length

  const recordAtBat = useCallback(
    (entry) => {
      if (over) return
      const added = entry.score ?? RESULT_SCORE[entry.result] ?? 0
      setHistory((h) => [...h, { ...entry, ts: Date.now() }])
      setScore((s) => s + added)

      if (mode === GAME_MODE.AT_BAT) {
        if (atBats + 1 >= MAX_AT_BATS) setOver(true)
        return
      }

      if (isOut(entry.result)) {
        setOuts((o) => {
          const next = o + 1
          if (next >= MAX_OUTS) {
            // 이닝 종료
            setInning((iv) => {
              const ni = iv + 1
              if (ni > MAX_INNINGS) setOver(true)
              return ni
            })
            return 0
          }
          return next
        })
      }
    },
    [atBats, mode, over],
  )

  const reset = useCallback(() => {
    setHistory([])
    setOuts(0)
    setInning(1)
    setScore(0)
    setOver(false)
  }, [])

  const stats = useMemo(() => {
    const total = history.length
    const hits = history.filter((h) => isHit(h.result)).length
    const homeruns = history.filter((h) => h.result === 'HOME_RUN').length
    const avg = total > 0 ? (hits / total) : 0
    return { total, hits, homeruns, avg }
  }, [history])

  return {
    history,
    outs,
    inning,
    score,
    atBats,
    over,
    mode,
    stats,
    recordAtBat,
    reset,
  }
}
