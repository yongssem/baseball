import { TRIGGERS } from './constants'

const POOL = [TRIGGERS.BEFORE_PITCH, TRIGGERS.DURING_PITCH, TRIGGERS.AFTER_HIT]

export function pickTrigger() {
  return POOL[Math.floor(Math.random() * POOL.length)]
}

/**
 * 트리거별 상태 머신 정의 (UI 측에서 step 전환 가이드용).
 *  - BEFORE_PITCH: idle → quiz → swing → result
 *  - DURING_PITCH: idle → pitch+quiz(동시) → result
 *  - AFTER_HIT:    idle → autoswing → escape(quiz) → result
 */
export const STATE_FLOW = {
  [TRIGGERS.BEFORE_PITCH]: ['idle', 'quiz', 'swing', 'result'],
  [TRIGGERS.DURING_PITCH]: ['idle', 'combo', 'result'],
  [TRIGGERS.AFTER_HIT]: ['idle', 'autoswing', 'escape', 'result'],
}

export function triggerLabel(t) {
  switch (t) {
    case TRIGGERS.BEFORE_PITCH: return '🔴 공이 날아오기 전 — 먼저 문제부터'
    case TRIGGERS.DURING_PITCH: return '🟡 공이 날아오는 중 — 타이밍 + 문제 동시에'
    case TRIGGERS.AFTER_HIT:    return '🟢 공을 친 후 — 야수가 잡기 전에 풀어!'
    default: return ''
  }
}
