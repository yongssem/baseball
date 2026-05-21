import { useCallback, useState } from 'react'
import { getSampleQuestions } from '../data/sampleQuestions'

// 하드코딩 모드: API 키 없이 즉시 플레이.
// (Gemini API 연결 모드로 돌리려면 .env.local 에 VITE_USE_API=1 설정 + /api/generate-quiz 활용)
const USE_API = import.meta.env.VITE_USE_API === '1'

export default function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateQuiz = useCallback(async ({ subject, grade, difficulty, count = 10 }) => {
    setLoading(true)
    setError(null)
    try {
      if (USE_API) {
        const resp = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, grade, difficulty, count }),
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        return await resp.json()
      }
      // 하드코딩 풀에서 즉시 반환
      await new Promise((r) => setTimeout(r, 250)) // 로딩 UX
      return {
        questions: getSampleQuestions({ subject, grade, difficulty, count }),
        tokenCount: 0,
        source: 'hardcoded',
      }
    } catch (err) {
      setError(err)
      return {
        questions: getSampleQuestions({ subject, grade, difficulty, count }),
        tokenCount: 0,
        source: 'hardcoded_fallback',
        warning: '서버 호출 실패 - 하드코딩 문제 반환',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateQuiz, loading, error }
}
