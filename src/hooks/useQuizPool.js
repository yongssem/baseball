import { useCallback, useEffect, useRef, useState } from 'react'
import useAI from './useAI'
import { getDb, isFirebaseConfigured } from '../lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const REFILL_THRESHOLD = 2 // 남은 문제 수가 이만큼 떨어지면 백그라운드 추가 생성
const REFILL_BATCH = 5
const DEFAULT_DAILY_LIMIT = 200

function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function makePoolKey({ subject, grade, difficulty }) {
  return `${subject}_grade${grade}_${difficulty}_${todayKey()}`
}

function localCacheGet(key) {
  try {
    const raw = localStorage.getItem(`quizpool:${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function localCacheSet(key, value) {
  try {
    localStorage.setItem(
      `quizpool:${key}`,
      JSON.stringify({ ...value, savedAt: Date.now() }),
    )
  } catch {
    // 무시 (사파리 사적모드 등)
  }
}

async function readFirestorePool(poolKey) {
  const db = getDb()
  if (!db) return null
  const ref = doc(db, 'quiz_pools', poolKey)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  const created =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toMillis()
      : Number(data.createdAt) || Date.now()
  if (Date.now() - created > CACHE_TTL_MS) return null
  return Array.isArray(data.questions) ? data.questions : null
}

async function writeFirestorePool(poolKey, payload, questions) {
  const db = getDb()
  if (!db) return
  const ref = doc(db, 'quiz_pools', poolKey)
  await setDoc(ref, {
    ...payload,
    questions,
    createdAt: serverTimestamp(),
  })
}

async function logAICall({ classId, prompt, response, userId, tokenCount }) {
  const db = getDb()
  if (!db || !classId) return
  await addDoc(collection(db, `classes/${classId}/ai_logs`), {
    prompt,
    response,
    userId: userId || 'anonymous',
    tokenCount: tokenCount || 0,
    createdAt: serverTimestamp(),
  })
}

async function checkAndBumpDailyLimit({ classId, limit }) {
  const db = getDb()
  if (!db || !classId) return { ok: true, count: 0 }
  const ref = doc(db, 'classes', classId, 'counters', todayKey())
  const snap = await getDoc(ref)
  const count = snap.exists() ? snap.data().count || 0 : 0
  if (count >= limit) return { ok: false, count }
  await setDoc(ref, { count: count + 1, updatedAt: serverTimestamp() }, { merge: true })
  return { ok: true, count: count + 1 }
}

/**
 * 문제 풀 훅.
 * @param {Object} p
 * @param {string} p.subject
 * @param {number} p.grade
 * @param {'easy'|'normal'|'hard'} p.difficulty
 * @param {string} [p.classId] - 공유 풀/일일 한도 카운터 키
 * @param {string} [p.userId]
 * @param {number} [p.dailyLimit]
 */
export default function useQuizPool({
  subject,
  grade,
  difficulty,
  classId,
  userId,
  dailyLimit = DEFAULT_DAILY_LIMIT,
}) {
  const { generateQuiz, loading: aiLoading } = useAI()
  const [pool, setPool] = useState([])
  const [index, setIndex] = useState(0)
  const [warning, setWarning] = useState(null)
  const [ready, setReady] = useState(false)
  const refillingRef = useRef(false)

  const poolKey = makePoolKey({ subject, grade, difficulty })

  // 초기 적재 (캐시 우선, 없으면 AI 호출)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setReady(false)

      const localHit = localCacheGet(poolKey)
      if (localHit?.questions?.length) {
        if (!cancelled) {
          setPool(localHit.questions)
          setIndex(0)
          setReady(true)
        }
        return
      }

      // Firestore 조회 (가능할 때만)
      if (isFirebaseConfigured()) {
        try {
          const remote = await readFirestorePool(poolKey)
          if (remote?.length && !cancelled) {
            setPool(remote)
            setIndex(0)
            localCacheSet(poolKey, { questions: remote })
            setReady(true)
            return
          }
        } catch (e) {
          console.warn('Firestore 풀 조회 실패', e)
        }
      }

      // 일일 한도 체크
      try {
        const limit = await checkAndBumpDailyLimit({ classId, limit: dailyLimit })
        if (!limit.ok) {
          setWarning('오늘 클래스의 AI 호출 한도를 초과했어요. 캐시된 문제만 사용합니다.')
        }
      } catch (e) {
        console.warn('일일 한도 카운터 실패', e)
      }

      const { questions, tokenCount, source, warning: w } = await generateQuiz({
        subject,
        grade,
        difficulty,
        count: 10,
      })
      if (cancelled) return
      setPool(questions)
      setIndex(0)
      setReady(true)
      if (w) setWarning(w)
      localCacheSet(poolKey, { questions })

      // Firestore 저장 + 로그
      if (isFirebaseConfigured()) {
        try {
          await writeFirestorePool(poolKey, { subject, grade, difficulty }, questions)
          await logAICall({
            classId,
            prompt: `${subject}/${grade}/${difficulty}/10`,
            response: source,
            userId,
            tokenCount,
          })
        } catch (e) {
          console.warn('Firestore 저장 실패', e)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [poolKey, subject, grade, difficulty, classId, userId, dailyLimit, generateQuiz])

  // 남은 문제 부족 → 백그라운드 추가 생성
  useEffect(() => {
    const remaining = pool.length - index
    if (!ready || remaining > REFILL_THRESHOLD || refillingRef.current) return
    refillingRef.current = true
    ;(async () => {
      const { questions } = await generateQuiz({
        subject,
        grade,
        difficulty,
        count: REFILL_BATCH,
      })
      setPool((p) => {
        const merged = [...p, ...questions]
        localCacheSet(poolKey, { questions: merged })
        return merged
      })
      refillingRef.current = false
    })()
  }, [pool.length, index, ready, generateQuiz, subject, grade, difficulty, poolKey])

  const current = pool[index] || null
  const next = useCallback(() => {
    setIndex((i) => i + 1)
  }, [])

  return {
    question: current,
    remaining: Math.max(0, pool.length - index),
    next,
    ready,
    loading: aiLoading && !ready,
    warning,
  }
}
