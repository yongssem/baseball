import { useCallback, useState } from 'react'

const MOCK_FALLBACK = (count, subject, grade) =>
  Array.from({ length: count }, (_, i) => {
    if (subject === 'math') {
      const a = Math.floor(Math.random() * (grade * 3)) + 1
      const b = Math.floor(Math.random() * (grade * 3)) + 1
      const correct = a + b
      const wrongs = new Set()
      while (wrongs.size < 3) {
        const w = correct + (Math.floor(Math.random() * 7) - 3)
        if (w !== correct && w > 0) wrongs.add(w)
      }
      const options = [...wrongs, correct].sort(() => Math.random() - 0.5).map(String)
      return {
        q: `${a} + ${b} = ?`,
        options,
        answer: options.indexOf(String(correct)),
        explanation: `${a} + ${b} = ${correct}`,
      }
    }
    const opts = ['가', '나', '다', '라']
    return {
      q: `[샘플 문제 ${i + 1}] 정답은?`,
      options: opts,
      answer: Math.floor(Math.random() * 4),
      explanation: '샘플 문제입니다.',
    }
  })

export default function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateQuiz = useCallback(async ({ subject, grade, difficulty, count = 10 }) => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, difficulty, count }),
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      return data // { questions, tokenCount, source, warning? }
    } catch (err) {
      // 서버리스 함수가 안 떠있는 로컬 dev 환경 등에서의 안전망
      setError(err)
      return {
        questions: MOCK_FALLBACK(count, subject, grade),
        tokenCount: 0,
        source: 'client_mock',
        warning: '서버 함수 호출 실패 - 클라이언트 폴백 문제 반환',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateQuiz, loading, error }
}
