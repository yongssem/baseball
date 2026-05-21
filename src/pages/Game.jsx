import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Field from '../components/Field'
import Ball from '../components/Ball'
import Scoreboard from '../components/Scoreboard'
import QuizCard from '../components/QuizCard'
import TimingBar from '../components/TimingBar'
import ResultModal from '../components/ResultModal'
import Button from '../components/Button'
import useQuizPool from '../hooks/useQuizPool'
import useGameState from '../hooks/useGameState'
import useSwingTiming from '../hooks/useSwingTiming'
import { pickTrigger, triggerLabel } from '../game/triggerEngine'
import { calculate } from '../game/resultCalculator'
import { TRIGGERS, PITCH_DURATION, FIELDER_CATCH_MS } from '../game/constants'

/**
 * Phase별 step:
 *   'ready'       — 다음 타석 대기 (트리거 안내)
 *   'quiz_pre'    — BEFORE_PITCH: 먼저 문제
 *   'pitch'       — 공 날아오는 중 (BEFORE 정답 후 / DURING 시작)
 *   'combo'       — DURING_PITCH: 문제+타이밍 동시
 *   'auto_swing'  — AFTER_HIT: 자동 타격 애니메이션
 *   'escape'      — AFTER_HIT: 야수 캐치 전 풀기
 *   'result'      — 결과 모달
 */
export default function Game() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const subject = params.get('subject') || '수학'
  const grade = Number(params.get('grade') || 3)
  const difficulty = params.get('difficulty') || 'normal'
  const pitchDur = PITCH_DURATION[difficulty]
  const escapeLimit = FIELDER_CATCH_MS[difficulty]

  const game = useGameState({ maxInnings: 3 })
  const pool = useQuizPool({ subject, grade, difficulty })

  const [step, setStep] = useState('ready')
  const [trigger, setTrigger] = useState(null)
  const [selected, setSelected] = useState(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [arriveAt, setArriveAt] = useState(null)
  const [pitchPhase, setPitchPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [resultDetail, setResultDetail] = useState('')
  const [quizStartAt, setQuizStartAt] = useState(0)
  const [remainMs, setRemainMs] = useState(null)
  const remainRafRef = useRef()

  const swingEnabled = step === 'pitch' || step === 'combo'

  const timing = useSwingTiming({
    enabled: swingEnabled,
    arriveAt,
  })

  // 결과 종합 적용
  const finish = useCallback((r, detail = '') => {
    setResult(r); setResultDetail(detail)
    setStep('result')
    setPitchPhase('idle')
    game.apply(r)
  }, [game])

  // 다음 타석 시작
  const startAtBat = useCallback(() => {
    if (game.isOver) return
    timing.reset()
    setSelected(null); setAnswerLocked(false)
    setResult(null); setResultDetail('')
    setArriveAt(null); setPitchPhase('idle')
    const t = pickTrigger()
    setTrigger(t)
    setStep('ready')
    setTimeout(() => {
      if (t === TRIGGERS.BEFORE_PITCH) {
        setQuizStartAt(performance.now())
        setStep('quiz_pre')
      } else if (t === TRIGGERS.DURING_PITCH) {
        const at = performance.now() + pitchDur
        setArriveAt(at)
        setPitchPhase('pitch')
        setQuizStartAt(performance.now())
        setStep('combo')
      } else {
        setStep('auto_swing')
        setPitchPhase('pitch')
        const at = performance.now() + pitchDur
        setArriveAt(at)
      }
    }, 600)
  }, [game.isOver, pitchDur, timing])

  // 첫 타석 자동 시작
  useEffect(() => {
    if (!pool.loading && pool.current && step === 'ready' && !trigger && !game.isOver) {
      startAtBat()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.loading, pool.current])

  // 경기 종료 → 결과 페이지
  useEffect(() => {
    if (game.isOver) {
      setTimeout(() => {
        const sp = new URLSearchParams({
          subject, grade: String(grade), difficulty,
          score: String(game.score),
          atBats: String(game.atBats),
          history: game.history.join(','),
        })
        nav(`/result?${sp.toString()}`)
      }, 1500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isOver])

  // 카운트다운 (문제 풀이 제한 시간)
  useEffect(() => {
    if (step !== 'quiz_pre' && step !== 'combo' && step !== 'escape') {
      setRemainMs(null)
      cancelAnimationFrame(remainRafRef.current)
      return
    }
    const limit = step === 'quiz_pre' ? 5000 : step === 'combo' ? pitchDur + 500 : escapeLimit
    const start = quizStartAt || performance.now()
    function tick() {
      const elapsed = performance.now() - start
      const r = limit - elapsed
      setRemainMs(r)
      if (r > 0) remainRafRef.current = requestAnimationFrame(tick)
      else handleTimeout()
    }
    remainRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(remainRafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, quizStartAt])

  function handleTimeout() {
    if (answerLocked) return
    setAnswerLocked(true)
    // BEFORE_PITCH timeout = 삼진, AFTER_HIT timeout = flyout, COMBO timeout 후 결과
    if (trigger === TRIGGERS.BEFORE_PITCH) {
      finish('STRIKEOUT', '문제를 못 풀어 삼진이에요')
    } else if (trigger === TRIGGERS.AFTER_HIT) {
      finish('FLYOUT', '야수가 잡았어요')
    } else if (trigger === TRIGGERS.DURING_PITCH) {
      // 시간 끝났는데 답 없음 → calculate에 맡김
      const g = timing.grade || 'MISS'
      const r = calculate({ trigger, timing: g, correct: false, solveMs: pitchDur, solveLimitMs: pitchDur, difficulty })
      finish(r, '문제·타이밍 모두 놓쳤어요')
    }
  }

  // 답 선택
  function onAnswer(i) {
    if (answerLocked || !pool.current) return
    setSelected(i)
    setAnswerLocked(true)
    const correct = i === pool.current.answer
    const solveMs = performance.now() - quizStartAt

    if (trigger === TRIGGERS.BEFORE_PITCH) {
      if (!correct) {
        finish('STRIKEOUT', `정답은 ${pool.current.options[pool.current.answer]} 입니다`)
        return
      }
      // 정답 → 공 던지기
      const at = performance.now() + pitchDur
      setArriveAt(at)
      setPitchPhase('pitch')
      setStep('pitch')
      // 공 도착 후 자동 결과 (스윙 미입력 시 MISS)
      setTimeout(() => {
        const g = timing.grade || 'MISS'
        const r = calculate({ trigger, timing: g, correct: true, solveMs, solveLimitMs: 5000, difficulty })
        finish(r, `타이밍: ${g}`)
      }, pitchDur + 350)
      return
    }

    if (trigger === TRIGGERS.DURING_PITCH) {
      // 답만 먼저 골랐을 수도, 공이 아직 도착 전일 수도
      // 공 도착 후 결과 처리 (아래 useEffect에서 처리)
      // 즉시 결과를 내지 않고 공 도착 시점까지 대기
      const wait = Math.max(0, (arriveAt || performance.now()) - performance.now() + 250)
      setTimeout(() => {
        const g = timing.grade || 'MISS'
        const r = calculate({ trigger, timing: g, correct, solveMs, solveLimitMs: pitchDur, difficulty })
        finish(r, `타이밍: ${g} · 정답: ${correct ? 'O' : 'X'}`)
      }, wait)
      return
    }

    if (trigger === TRIGGERS.AFTER_HIT) {
      const r = calculate({ trigger, timing: 'PERFECT', correct, solveMs, solveLimitMs: escapeLimit, difficulty })
      finish(r, correct ? `푼 시간 ${(solveMs/1000).toFixed(1)}초` : `정답은 ${pool.current.options[pool.current.answer]}`)
      return
    }
  }

  // AFTER_HIT: 자동 스윙 애니메이션 → escape 단계로
  useEffect(() => {
    if (step !== 'auto_swing') return
    const t = setTimeout(() => {
      setPitchPhase('hit')
      setQuizStartAt(performance.now())
      setStep('escape')
    }, pitchDur + 200)
    return () => clearTimeout(t)
  }, [step, pitchDur])

  function onNextAtBat() {
    pool.next()
    setTrigger(null)
    setStep('ready')
    setTimeout(() => startAtBat(), 300)
  }

  const triggerHint = useMemo(() => trigger ? triggerLabel(trigger) : '', [trigger])

  if (pool.loading && !pool.current) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🤖</div>
          <div className="font-bold">AI가 문제를 만들고 있어요...</div>
          <div className="text-xs opacity-60 mt-2">{subject} · {grade}학년 · {difficulty}</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Scoreboard
        inning={game.inning}
        half="bottom"
        outs={game.outs}
        score={game.score}
        atBats={game.atBats}
      />

      <div className="mt-4 text-center text-sm font-semibold text-coral min-h-[20px]">
        {triggerHint}
      </div>

      <div className="mt-2">
        <Card delay={0} className="!p-2">
          <Field>
            <Ball phase={pitchPhase} duration={pitchDur} />
          </Field>
        </Card>
      </div>

      {(step === 'pitch' || step === 'combo') && arriveAt && (
        <div className="mt-3">
          <TimingBar startAt={arriveAt - pitchDur} duration={pitchDur} grade={timing.grade} />
        </div>
      )}

      <div className="mt-4">
        {(step === 'quiz_pre' || step === 'combo' || step === 'escape') && pool.current && (
          <QuizCard
            question={pool.current.q}
            options={pool.current.options}
            onAnswer={onAnswer}
            selected={selected}
            locked={answerLocked}
            remainMs={remainMs}
          />
        )}

        {step === 'pitch' && (
          <Card delay={0} className="text-center">
            <div className="text-sm opacity-70 mb-2">공이 와요! 스페이스바로 타이밍 맞추세요 ⎵</div>
            <Button onClick={() => timing.swing()} variant="primary">⚾ 스윙</Button>
          </Card>
        )}

        {step === 'auto_swing' && (
          <Card delay={0} className="text-center">
            <div className="text-sm">💥 자동 타격! 공이 날아갑니다...</div>
          </Card>
        )}
      </div>

      <ResultModal open={step === 'result'} result={result} detail={resultDetail} onNext={onNextAtBat} />
    </Layout>
  )
}
