import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'
import Field from '../components/Field'
import Batter from '../components/Batter'
import Pitcher from '../components/Pitcher'
import Scoreboard from '../components/Scoreboard'
import QuizCard from '../components/QuizCard'
import TimingBar from '../components/TimingBar'
import ResultModal from '../components/ResultModal'
import Button from '../components/Button'
import useGameState from '../hooks/useGameState'
import useQuizPool from '../hooks/useQuizPool'
import useSwingTiming from '../hooks/useSwingTiming'
import { PITCH_DURATION_MS, TIMING, TRIGGER } from '../game/constants'
import { pickTrigger, describeTrigger } from '../game/triggerEngine'
import { calculateResult } from '../game/resultCalculator'

// 트리거별 흐름:
//  BEFORE_PITCH: showQuiz -> answer -> pitch animation -> auto swing -> result
//  DURING_PITCH: pitch animation + quiz simultaneously -> end-of-pitch judge -> result
//  AFTER_HIT  : auto pitch+hit -> ball flying + quiz race -> result

const PHASE = {
  INTRO: 'INTRO',
  QUIZ: 'QUIZ',
  PITCH: 'PITCH',
  PITCH_QUIZ: 'PITCH_QUIZ',
  AUTO_HIT: 'AUTO_HIT',
  FLYING_QUIZ: 'FLYING_QUIZ',
  RESULT: 'RESULT',
}

export default function Game({ settings, onFinish }) {
  const { subject, grade, difficulty, mode } = settings
  const game = useGameState({ mode })
  const pool = useQuizPool({ subject, grade, difficulty, classId: 'demo', userId: 'student' })

  const [trigger, setTrigger] = useState(null)
  const [phase, setPhase] = useState(PHASE.INTRO)
  const [selected, setSelected] = useState(null)
  const [correct, setCorrect] = useState(null)
  const [resolved, setResolved] = useState(null) // { result, score }
  const [pitchStartedAt, setPitchStartedAt] = useState(0)
  const [timingResult, setTimingResult] = useState(null)

  const quizStartRef = useRef(0)
  const pitchDuration = PITCH_DURATION_MS[difficulty] ?? 1500

  // 새 타석 시작
  const startNextAtBat = useCallback(() => {
    if (game.over) return
    setSelected(null)
    setCorrect(null)
    setResolved(null)
    setTimingResult(null)
    setPhase(PHASE.INTRO)
    setTrigger(pickTrigger())
  }, [game.over])

  useEffect(() => {
    if (pool.ready && !trigger && !game.over) {
      startNextAtBat()
    }
  }, [pool.ready, trigger, game.over, startNextAtBat])

  // INTRO 짧게 보여주고 메인 단계 진입
  useEffect(() => {
    if (phase !== PHASE.INTRO || !trigger) return
    const t = setTimeout(() => {
      if (trigger === TRIGGER.BEFORE_PITCH) {
        quizStartRef.current = performance.now()
        setPhase(PHASE.QUIZ)
      } else if (trigger === TRIGGER.DURING_PITCH) {
        quizStartRef.current = performance.now()
        setPitchStartedAt(performance.now())
        setPhase(PHASE.PITCH_QUIZ)
      } else if (trigger === TRIGGER.AFTER_HIT) {
        setPhase(PHASE.AUTO_HIT)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [phase, trigger])

  // BEFORE_PITCH: 정답 후 자동 투구 → 결과
  const onAnswerBeforePitch = (i) => {
    if (selected !== null) return
    setSelected(i)
    const ok = i === pool.question.answer
    const solveMs = performance.now() - quizStartRef.current
    setCorrect(ok)
    setPhase(PHASE.PITCH)
    setPitchStartedAt(performance.now())
    setTimeout(() => {
      const r = calculateResult({
        trigger: TRIGGER.BEFORE_PITCH,
        timing: null,
        correct: ok,
        solveMs,
        difficulty,
      })
      finishAtBat(r, ok)
    }, pitchDuration + 200)
  }

  // DURING_PITCH: 답 선택
  const onAnswerDuringPitch = (i) => {
    if (selected !== null) return
    setSelected(i)
    setCorrect(i === pool.question.answer)
  }

  // DURING_PITCH: 타이밍 판정 핸들러
  const handleTimingJudge = useCallback(({ timing }) => {
    setTimingResult(timing)
  }, [])

  const targetAt = useMemo(() => pitchStartedAt + pitchDuration, [pitchStartedAt, pitchDuration])
  useSwingTiming({
    active: phase === PHASE.PITCH_QUIZ,
    targetAt,
    onJudge: handleTimingJudge,
  })

  // DURING_PITCH 완료 판정
  useEffect(() => {
    if (phase !== PHASE.PITCH_QUIZ) return
    if (timingResult === null) return
    // 타이밍 판정 완료 + (선택 여부 무관하게 진행 가능: 미선택은 오답으로 처리)
    const t = setTimeout(() => {
      const ok = correct === true
      const r = calculateResult({
        trigger: TRIGGER.DURING_PITCH,
        timing: timingResult,
        correct: ok,
        solveMs: performance.now() - quizStartRef.current,
        difficulty,
      })
      finishAtBat(r, ok)
    }, 400)
    return () => clearTimeout(t)
  }, [phase, timingResult, correct, difficulty])

  // AFTER_HIT: 자동 타격 애니메이션 후 비행+퀴즈
  useEffect(() => {
    if (phase !== PHASE.AUTO_HIT) return
    const t = setTimeout(() => {
      quizStartRef.current = performance.now()
      setPhase(PHASE.FLYING_QUIZ)
    }, 700)
    return () => clearTimeout(t)
  }, [phase])

  const onAnswerAfterHit = (i) => {
    if (selected !== null) return
    setSelected(i)
    const ok = i === pool.question.answer
    const solveMs = performance.now() - quizStartRef.current
    setCorrect(ok)
    const r = calculateResult({
      trigger: TRIGGER.AFTER_HIT,
      timing: null,
      correct: ok,
      solveMs,
      difficulty,
    })
    finishAtBat(r, ok)
  }

  // AFTER_HIT 시간 초과 시 자동 아웃
  useEffect(() => {
    if (phase !== PHASE.FLYING_QUIZ) return
    const t = setTimeout(() => {
      if (selected === null) {
        const r = calculateResult({
          trigger: TRIGGER.AFTER_HIT,
          timing: null,
          correct: false,
          solveMs: 99999,
          difficulty,
        })
        finishAtBat(r, false)
      }
    }, 10000)
    return () => clearTimeout(t)
  }, [phase, selected, difficulty])

  function finishAtBat(r, ok) {
    setResolved(r)
    setPhase(PHASE.RESULT)
    game.recordAtBat({
      result: r.result,
      score: r.score,
      trigger,
      correct: ok,
      timing: timingResult,
    })
    pool.next()
  }

  const handleNext = () => {
    if (game.over) {
      onFinish(game)
      return
    }
    startNextAtBat()
  }

  // 게임 종료 자동 이동
  useEffect(() => {
    if (game.over && phase !== PHASE.RESULT) {
      onFinish(game)
    }
  }, [game.over, phase, game, onFinish])

  // 로딩
  if (!pool.ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="font-score text-coral text-2xl animate-pulse">문제 준비 중...</div>
        <p className="text-xs opacity-60 mt-2">AI가 {subject} {grade}학년 문제를 만들고 있어요</p>
      </div>
    )
  }

  const triggerInfo = trigger ? describeTrigger(trigger) : null

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-6">
        <Scoreboard
          inning={game.inning}
          outs={game.outs}
          score={game.score}
          atBats={game.atBats}
          mode={game.mode}
        />

        {pool.warning && (
          <div className="text-xs bg-coral/20 text-coral rounded-button px-3 py-2 mt-2">
            ⚠️ {pool.warning}
          </div>
        )}

        {/* 야구장 + 캐릭터 + 공 */}
        <div className="relative my-3 rounded-card overflow-hidden bg-sky/40">
          <Field className="block" />
          {/* 투수 */}
          <div className="absolute top-[42%] left-[44%]">
            <Pitcher />
          </div>
          {/* 타자 */}
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
            <Batter
              swinging={
                phase === PHASE.PITCH ||
                phase === PHASE.AUTO_HIT ||
                (phase === PHASE.PITCH_QUIZ && timingResult !== null)
              }
            />
          </div>

          {/* 공 애니메이션 */}
          <AnimatePresence>
            {(phase === PHASE.PITCH || phase === PHASE.PITCH_QUIZ) && (
              <motion.div
                key="ball-incoming"
                initial={{ x: '0%', y: '0%', scale: 0.5, opacity: 0 }}
                animate={{ x: 0, y: '60%', scale: 1.4, opacity: 1 }}
                transition={{ duration: pitchDuration / 1000, ease: 'easeIn' }}
                className="absolute top-[44%] left-[48%] w-3 h-3 rounded-full bg-white border border-coral shadow"
              />
            )}
            {(phase === PHASE.AUTO_HIT || phase === PHASE.FLYING_QUIZ) && (
              <motion.div
                key="ball-flying"
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{ x: 120, y: -90, scale: 0.6 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute bottom-[18%] left-[50%] w-3 h-3 rounded-full bg-white border border-coral shadow"
              />
            )}
          </AnimatePresence>

          {/* 트리거 안내 배너 */}
          <AnimatePresence>
            {phase === PHASE.INTRO && triggerInfo && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-3 mx-auto w-fit bg-white/90 rounded-button px-3 py-2 text-center shadow"
              >
                <div className="font-score text-coral text-sm">{triggerInfo.title}</div>
                <div className="text-xs opacity-70">{triggerInfo.sub}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 단계별 하단 UI */}
        {phase === PHASE.QUIZ && (
          <QuizCard
            question={pool.question}
            selected={selected}
            disabled={selected !== null}
            onAnswer={onAnswerBeforePitch}
          />
        )}

        {phase === PHASE.PITCH_QUIZ && (
          <div className="space-y-3">
            <TimingBar startedAt={pitchStartedAt} durationMs={pitchDuration} active />
            <QuizCard
              question={pool.question}
              selected={selected}
              disabled={selected !== null}
              onAnswer={onAnswerDuringPitch}
              compact
            />
            <p className="text-center text-xs opacity-70">
              ⌨️ 공이 가운데 오면 <span className="font-score text-coral">스페이스바</span>!
            </p>
          </div>
        )}

        {phase === PHASE.FLYING_QUIZ && (
          <div className="space-y-2">
            <p className="text-center font-score text-coral text-sm animate-pulse">
              ⚡ 야수가 잡기 전에 풀어!
            </p>
            <QuizCard
              question={pool.question}
              selected={selected}
              disabled={selected !== null}
              onAnswer={onAnswerAfterHit}
            />
          </div>
        )}

        {phase === PHASE.PITCH && (
          <div className="text-center py-4">
            <p className="font-score text-2xl text-coral animate-pulse">⚾ 투구 중!</p>
          </div>
        )}

        {phase === PHASE.AUTO_HIT && (
          <div className="text-center py-4">
            <p className="font-score text-2xl text-mint animate-pulse">💥 자동 타격!</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => onFinish(game)}>
            ↩ 그만하기
          </Button>
        </div>
      </main>

      <ResultModal
        open={phase === PHASE.RESULT && !!resolved}
        result={resolved?.result}
        score={resolved?.score}
        onNext={handleNext}
      />

      <Footer />
    </div>
  )
}
