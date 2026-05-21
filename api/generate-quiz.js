// Vercel Serverless Function (Node 런타임)
// POST /api/generate-quiz
// 입력: { subject, grade, difficulty, count }
// 출력: { questions: [{ q, options[4], answer, explanation }], tokenCount, source }
//
// 🔐 GEMINI_API_KEY 는 Vercel 환경변수로만 주입한다. 절대 클라이언트에 노출 금지.

const MODEL = 'gemini-2.5-flash'
const ENDPOINT = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`

const DIFFICULTY_GUIDE = {
  easy: '즉답 가능한 1단계 연산/사실 확인 수준',
  normal: '2단계 사고나 어휘 응용이 필요한 수준',
  hard: '응용·추론·서술형으로 사고를 요하는 수준',
}

const SUBJECT_LABEL = {
  math: '수학',
  korean: '국어',
  english: '영어',
  science: '과학',
  social: '사회',
}

function buildPrompt({ subject, grade, difficulty, count }) {
  return `너는 한국 초등학교 ${grade}학년 ${SUBJECT_LABEL[subject] || subject} 선생님이야.
난이도 가이드: ${DIFFICULTY_GUIDE[difficulty] || '보통'}.
4지선다 객관식 문제 ${count}개를 만들어줘.

규칙:
- 각 문제는 한국어로 작성.
- options 는 정확히 4개.
- answer 는 정답 보기의 인덱스(0~3).
- explanation 은 1~2문장 짧은 풀이.
- 결과는 JSON 배열 한 줄로만 응답 (코드블록·설명 텍스트 금지).
- JSON 스키마:
  [{ "q": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..." }, ...]`
}

function safeParseJSON(text) {
  if (!text) return null
  // 코드블록 제거
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // 배열 부분만 추출 시도
    const m = cleaned.match(/\[[\s\S]*\]/)
    if (m) {
      try {
        return JSON.parse(m[0])
      } catch {
        return null
      }
    }
    return null
  }
}

function validate(questions, count) {
  if (!Array.isArray(questions)) return null
  const ok = questions
    .filter(
      (q) =>
        q &&
        typeof q.q === 'string' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < 4,
    )
    .slice(0, count)
  return ok.length ? ok : null
}

// 키 없을 때 / 호출 실패 시의 안전한 폴백
function mockQuestions({ subject, grade, count }) {
  const out = []
  for (let i = 0; i < count; i++) {
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
      out.push({
        q: `${a} + ${b} = ?`,
        options,
        answer: options.indexOf(String(correct)),
        explanation: `${a} 더하기 ${b}는 ${correct}.`,
      })
    } else {
      const opts = ['가', '나', '다', '라']
      const ans = Math.floor(Math.random() * 4)
      out.push({
        q: `[샘플 ${SUBJECT_LABEL[subject] || subject}] 보기 중 정답은? (${grade}학년)`,
        options: opts,
        answer: ans,
        explanation: '샘플 문제입니다.',
      })
    }
  }
  return out
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  // body parsing (Vercel은 자동 파싱하지만 안전망)
  const body =
    typeof req.body === 'string' ? safeParseJSON(req.body) || {} : req.body || {}
  const subject = String(body.subject || 'math')
  const grade = Number(body.grade) || 3
  const difficulty = String(body.difficulty || 'normal')
  const count = Math.max(1, Math.min(20, Number(body.count) || 10))

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    // 키 미설정 → 폴백 (개발/데모 용)
    res.status(200).json({
      questions: mockQuestions({ subject, grade, count }),
      tokenCount: 0,
      source: 'mock',
      warning: 'GEMINI_API_KEY 미설정 - 폴백 문제를 반환합니다.',
    })
    return
  }

  try {
    const resp = await fetch(ENDPOINT(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt({ subject, grade, difficulty, count }) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      res.status(502).json({ error: 'Gemini 호출 실패', detail: errText.slice(0, 500) })
      return
    }

    const data = await resp.json()
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
    const parsed = safeParseJSON(text)
    const questions = validate(parsed, count)

    const tokenCount =
      (data?.usageMetadata?.totalTokenCount ??
        data?.usageMetadata?.candidatesTokenCount ??
        0) | 0

    if (!questions) {
      res.status(200).json({
        questions: mockQuestions({ subject, grade, count }),
        tokenCount,
        source: 'mock_fallback',
        warning: 'AI 응답 파싱 실패 - 폴백 문제 반환',
      })
      return
    }

    res.status(200).json({
      questions,
      tokenCount,
      source: 'gemini',
    })
  } catch (err) {
    res.status(200).json({
      questions: mockQuestions({ subject, grade, count }),
      tokenCount: 0,
      source: 'mock_error',
      warning: `호출 오류: ${err.message}`,
    })
  }
}
