// Vercel Serverless Function (Node runtime)
// 입력: { subject, grade, difficulty, count }
// 출력: { questions: [{q, options[4], answer, explanation}], tokens }
//
// 보안: GEMINI_API_KEY는 서버 환경변수에서만 읽음. 절대 클라이언트로 보내지 않음.

const MODEL = 'gemini-2.5-flash'

function buildPrompt({ subject, grade, difficulty, count }) {
  const diffGuide = {
    easy: '즉답 가능한 1단계 연산이나 기초 개념',
    normal: '2단계 사고 또는 어휘력이 필요한 수준',
    hard: '응용·추론·짧은 서술이 필요한 도전 문제',
  }[difficulty] || '보통 수준'

  return `당신은 한국 초등학교 ${grade}학년 ${subject} 교사입니다.
다음 조건의 4지선다 문제를 ${count}개 생성하세요.

- 난이도: ${difficulty} (${diffGuide})
- 각 문제는 명확한 단일 정답을 가져야 함
- 문제는 짧고 명료하게 (한 줄~두 줄)
- 보기는 4개, 정답 1개
- 응답은 반드시 JSON 형식으로만 (마크다운 코드블록 금지)

JSON 스키마:
{
  "questions": [
    { "q": "문제", "options": ["보기1","보기2","보기3","보기4"], "answer": 0, "explanation": "간단한 해설" }
  ]
}

"answer"는 0-3 인덱스입니다.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const { subject = '수학', grade = 3, difficulty = 'normal', count = 10 } = req.body || {}
  const safeCount = Math.min(20, Math.max(1, Number(count) || 10))

  const prompt = buildPrompt({ subject, grade, difficulty, count: safeCount })

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!r.ok) {
      const txt = await r.text()
      return res.status(502).json({ error: 'Gemini upstream error', detail: txt.slice(0, 500) })
    }

    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const usage = data?.usageMetadata || {}

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return res.status(502).json({ error: 'Failed to parse model output', raw: text.slice(0, 500) })
    }

    const questions = Array.isArray(parsed?.questions) ? parsed.questions : []
    const cleaned = questions
      .filter(q => q && q.q && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === 'number')
      .map(q => ({
        q: String(q.q),
        options: q.options.map(String),
        answer: Math.max(0, Math.min(3, q.answer)),
        explanation: String(q.explanation || ''),
      }))

    return res.status(200).json({
      questions: cleaned,
      tokens: {
        prompt: usage.promptTokenCount || 0,
        output: usage.candidatesTokenCount || 0,
        total: usage.totalTokenCount || 0,
      },
    })
  } catch (e) {
    return res.status(500).json({ error: 'generate-quiz failed', detail: String(e?.message || e) })
  }
}
