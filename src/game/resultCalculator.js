import { RESULT, TRIGGERS, REWARD_CAP } from './constants'

/**
 * 타이밍 점수 등급 산출
 * @param {number} diffMs - 공 도착 기준 절댓값 ms
 */
export function timingGrade(diffMs) {
  if (diffMs == null || diffMs < 0) return 'MISS'
  if (diffMs <= 100) return 'PERFECT'
  if (diffMs <= 250) return 'GOOD'
  return 'MISS'
}

/**
 * 보상 상한 적용 - 난이도가 낮으면 큰 보상을 깎음
 */
function cap(result, difficulty) {
  const allowed = REWARD_CAP[difficulty] || REWARD_CAP.normal
  const order = [RESULT.HOMERUN, RESULT.TRIPLE, RESULT.DOUBLE, RESULT.SINGLE]
  if (!order.includes(result)) return result
  if (allowed.includes(result)) return result
  // 깎아내림: 허용 가능한 가장 큰 보상으로
  for (const r of order) {
    if (allowed.includes(r)) return r
  }
  return RESULT.SINGLE
}

/**
 * 핵심 결과 계산
 * @param {object} args
 * @param {string} args.trigger - TRIGGERS.*
 * @param {string} args.timing - PERFECT|GOOD|MISS
 * @param {boolean} args.correct - 정답 여부
 * @param {number} args.solveMs - 문제 푼 시간 ms
 * @param {number} args.solveLimitMs - 제한 시간 ms
 * @param {string} args.difficulty - easy|normal|hard
 */
export function calculate({ trigger, timing, correct, solveMs = 0, solveLimitMs = 5000, difficulty = 'normal' }) {
  // BEFORE_PITCH: 정답이어야 스윙권 → 스윙권 없으면 자동 삼진
  if (trigger === TRIGGERS.BEFORE_PITCH) {
    if (!correct) return RESULT.STRIKEOUT
    // 빨리 풀수록 보상 ↑
    const speed = solveMs / Math.max(solveLimitMs, 1) // 0~1
    if (timing === 'PERFECT' && speed < 0.4) return cap(RESULT.HOMERUN, difficulty)
    if (timing === 'PERFECT') return cap(RESULT.TRIPLE, difficulty)
    if (timing === 'GOOD' && speed < 0.5) return cap(RESULT.DOUBLE, difficulty)
    if (timing === 'GOOD') return cap(RESULT.SINGLE, difficulty)
    if (timing === 'MISS') return RESULT.FOUL // 정답인데 헛스윙 → 파울 (재시도 여지)
    return RESULT.GROUNDOUT
  }

  // DURING_PITCH: 타이밍 + 정답 동시
  if (trigger === TRIGGERS.DURING_PITCH) {
    if (timing === 'PERFECT' && correct) return cap(RESULT.HOMERUN, difficulty)
    if (timing === 'PERFECT' && !correct) return RESULT.FOUL
    if (timing === 'GOOD' && correct) return cap(RESULT.DOUBLE, difficulty)
    if (timing === 'GOOD' && !correct) return RESULT.FOUL
    if (timing === 'MISS' && correct) return RESULT.GROUNDOUT
    return RESULT.STRIKEOUT
  }

  // AFTER_HIT: 자동 타격 → 풀이 시간 빠를수록 진루
  if (trigger === TRIGGERS.AFTER_HIT) {
    if (!correct) return RESULT.FLYOUT // 못 풀면 야수가 잡음
    const speed = solveMs / Math.max(solveLimitMs, 1)
    if (speed < 0.25) return cap(RESULT.HOMERUN, difficulty)
    if (speed < 0.5) return cap(RESULT.TRIPLE, difficulty)
    if (speed < 0.75) return cap(RESULT.DOUBLE, difficulty)
    if (speed <= 1) return cap(RESULT.SINGLE, difficulty)
    return RESULT.FLYOUT
  }

  return RESULT.STRIKEOUT
}

export function isHit(result) {
  return [RESULT.HOMERUN, RESULT.TRIPLE, RESULT.DOUBLE, RESULT.SINGLE].includes(result)
}
export function isOut(result) {
  return [RESULT.STRIKEOUT, RESULT.GROUNDOUT, RESULT.FLYOUT].includes(result)
}
export function basesGained(result) {
  return { HOMERUN: 4, TRIPLE: 3, DOUBLE: 2, SINGLE: 1 }[result] || 0
}
