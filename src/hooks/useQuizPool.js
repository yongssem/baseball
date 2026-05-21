import { useCallback, useEffect, useRef, useState } from 'react'
import useAI from './useAI'
import { getDb, isFirebaseEnabled } from '../lib/firebase'
import { pickFallback } from '../lib/fallbackQuiz'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const DAILY_LIMIT = 50 // 클래스당 일일 AI 호출 상한 (간단 가드)

function poolKey({ subject, grade, difficulty }) {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${subject}_${grade}_${difficulty}_${day}`
}

async function readCache(key) {
  if (!isFirebaseEnabled()) {
    const raw = localStorage.getItem(`pool:${key}`)
    if (!raw) return null
    try {
      const obj = JSON.parse(raw)
      if (Date.now() - obj.t > CACHE_TTL_MS) return null
      return obj.questions
    } catch { return null }
  }
  const db = getDb()
  if (!db) return null
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'quiz_pools', key))
  if (!snap.exists()) return null
  const data = snap.data()
  const created = data.createdAt?.toMillis?.() || data.createdAt || 0
  if (Date.now() - created > CACHE_TTL_MS) return null
  return data.questions || null
}

async function writeCache(key, questions, meta) {
  if (!isFirebaseEnabled()) {
    localStorage.setItem(`pool:${key}`, JSON.stringify({ t: Date.now(), questions }))
    return
  }
  const db = getDb()
  if (!db) return
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(doc(db, 'quiz_pools', key), {
    ...meta,
    questions,
    createdAt: serverTimestamp(),
  })
}

async function logAIUsage(meta) {
  if (!isFirebaseEnabled()) return
  const db = getDb()
  if (!db) return
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    await addDoc(collection(db, 'classes', meta.classId || 'default', 'ai_logs'), {
      ...meta,
      createdAt: serverTimestamp(),
    })
  } catch (e) {
    console.warn('ai log failed', e)
  }
}

async function getTodayCount(classId) {
  // 단순 가드: localStorage 기반 (Firestore 카운터는 차후)
  const k = `aiCount:${classId || 'default'}:${new Date().toISOString().slice(0,10)}`
  return Number(localStorage.getItem(k) || '0')
}
async function bumpTodayCount(classId) {
  const k = `aiCount:${classId || 'default'}:${new Date().toISOString().slice(0,10)}`
  const n = Number(localStorage.getItem(k) || '0') + 1
  localStorage.setItem(k, String(n))
  return n
}

export default function useQuizPool({ subject, grade, difficulty, classId = 'default' }) {
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const { generateQuiz } = useAI()
  const fetchingRef = useRef(false)

  const loadInitial = useCallback(async () => {
    if (!subject || !grade || !difficulty) return
    setLoading(true); setError(null)
    const key = poolKey({ subject, grade, difficulty })
    try {
      const cached = await readCache(key)
      if (cached && cached.length > 0) {
        setQuestions(cached); setIndex(0); setLoading(false)
        return
      }
      const todayCount = await getTodayCount(classId)
      if (todayCount >= DAILY_LIMIT) {
        // 한도 초과 → 폴백
        setQuestions(pickFallback({ subject, grade, difficulty }))
        setUsedFallback(true); setIndex(0); setLoading(false)
        return
      }
      const res = await generateQuiz({ subject, grade, difficulty, count: 10 })
      await writeCache(key, res.questions, { subject, grade, difficulty })
      await bumpTodayCount(classId)
      await logAIUsage({ classId, subject, grade, difficulty, tokenCount: res.tokens?.total || 0 })
      setQuestions(res.questions); setIndex(0)
    } catch (e) {
      setError(e.message || String(e))
      // 안전망: 폴백 사용
      setQuestions(pickFallback({ subject, grade, difficulty }))
      setUsedFallback(true); setIndex(0)
    } finally {
      setLoading(false)
    }
  }, [subject, grade, difficulty, classId, generateQuiz])

  // 백그라운드로 추가 5개 생성 (문제 부족 시)
  const ensureMore = useCallback(async () => {
    if (fetchingRef.current) return
    if (usedFallback) return
    const remaining = questions.length - index
    if (remaining > 3) return
    fetchingRef.current = true
    try {
      const todayCount = await getTodayCount(classId)
      if (todayCount >= DAILY_LIMIT) return
      const res = await generateQuiz({ subject, grade, difficulty, count: 5 })
      await bumpTodayCount(classId)
      await logAIUsage({ classId, subject, grade, difficulty, tokenCount: res.tokens?.total || 0 })
      setQuestions(qs => [...qs, ...res.questions])
    } catch (e) {
      console.warn('ensureMore failed', e)
    } finally {
      fetchingRef.current = false
    }
  }, [questions.length, index, subject, grade, difficulty, classId, generateQuiz, usedFallback])

  useEffect(() => { loadInitial() }, [loadInitial])

  useEffect(() => {
    if (questions.length - index <= 3) ensureMore()
  }, [index, questions.length, ensureMore])

  const next = useCallback(() => setIndex(i => i + 1), [])
  const current = questions[index] || null

  return { current, next, loading, error, usedFallback, total: questions.length, index }
}
