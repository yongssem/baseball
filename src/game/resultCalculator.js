import {
  RESULT,
  TIMING,
  TRIGGER,
  DIFFICULTY_CAP,
  RESULT_SCORE,
} from './constants.js'

// 보상 등급 순서 (높을수록 좋음)
const HIT_ORDER = [
  RESULT.HOME_RUN,
  RESULT.TRIPLE,
  RESULT.DOUBLE,
  RESULT.SINGLE,
]

function capByDifficulty(result, difficulty) {
  if (!HIT_ORDER.includes(result)) return result // 아웃·파울은 캡 무관
  const cap = DIFFICULTY_CAP[difficulty] || RESULT.HOME_RUN
  const capIdx = HIT_ORDER.indexOf(cap)
  const resIdx = HIT_ORDER.indexOf(result)
  return resIdx < capIdx ? HIT_ORDER[capIdx] : result
}

/**
 * 결과 매핑.
 * @param {Object} p
 * @param {'BEFORE_PITCH'|'DURING_PITCH'|'AFTER_HIT'} p.trigger
 * @param {'PERFECT'|'GOOD'|'MISS'|null} p.timing - DURING_PITCH 일 때만 의미 있음
 * @param {boolean} p.correct - 문제 정답 여부
 * @param {number} p.solveMs - 문제 푼 시간(ms)
 * @param {'easy'|'normal'|'hard'} p.difficulty
 * @returns {{ result: keyof typeof RESULT, score: number }}
 */
export function calculateResult({ trigger, timing, correct, solveMs, difficulty }) {
  let result = RESULT.GROUND_OUT

  if (trigger === TRIGGER.BEFORE_PITCH) {
    // 예측형: 문제 먼저, 정답이어야 스윙권. 푼 시간이 빠를수록 좋은 결과
    if (!correct) {
      result = RESULT.STRIKEOUT
    } else if (solveMs < 3000) {
      result = RESULT.HOME_RUN
    } else if (solveMs < 6000) {
      result = RESULT.TRIPLE
    } else if (solveMs < 10000) {
      result = RESULT.DOUBLE
    } else {
      result = RESULT.SINGLE
    }
  } else if (trigger === TRIGGER.DURING_PITCH) {
    // 멀티태스킹: 타이밍 × 정답
    if (timing === TIMING.PERFECT && correct) result = RESULT.HOME_RUN
    else if (timing === TIMING.PERFECT && !correct) result = RESULT.FOUL
    else if (timing === TIMING.GOOD && correct) result = RESULT.DOUBLE
    else if (timing === TIMING.GOOD && !correct) result = RESULT.FOUL
    else if (timing === TIMING.MISS && correct) result = RESULT.GROUND_OUT
    else result = RESULT.STRIKEOUT
  } else if (trigger === TRIGGER.AFTER_HIT) {
    // 도주형: 빠르면 안타, 늦거나 오답이면 아웃
    if (!correct) {
      result = RESULT.CAUGHT_OUT
    } else if (solveMs < 2500) {
      result = RESULT.HOME_RUN
    } else if (solveMs < 4500) {
      result = RESULT.TRIPLE
    } else if (solveMs < 7000) {
      result = RESULT.DOUBLE
    } else if (solveMs < 9500) {
      result = RESULT.SINGLE
    } else {
      result = RESULT.CAUGHT_OUT
    }
  }

  result = capByDifficulty(result, difficulty)
  return { result, score: RESULT_SCORE[result] ?? 0 }
}

export function isOut(result) {
  return (
    result === RESULT.STRIKEOUT ||
    result === RESULT.GROUND_OUT ||
    result === RESULT.CAUGHT_OUT
  )
}

export function isHit(result) {
  return HIT_ORDER.includes(result)
}
