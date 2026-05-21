import { useCallback, useState } from 'react'

export default function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateQuiz = useCallback(async ({ subject, grade, difficulty, count = 10 }) => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, difficulty, count }),
      })
      if (!r.ok) {
        const t = await r.text()
        throw new Error(`AI 호출 실패 (${r.status}) ${t.slice(0, 200)}`)
      }
      const data = await r.json()
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('생성된 문제가 없습니다')
      }
      return data
    } catch (e) {
      setError(e.message || String(e))
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateQuiz, loading, error }
}
