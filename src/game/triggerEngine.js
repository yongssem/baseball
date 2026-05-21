import { TRIGGER, TRIGGER_LIST } from './constants'

// 균등 33% 랜덤 분배
export function pickTrigger() {
  const i = Math.floor(Math.random() * TRIGGER_LIST.length)
  return TRIGGER_LIST[i]
}

// 트리거별 상태 머신 키
export const PHASES = {
  [TRIGGER.BEFORE_PITCH]: ['idle', 'quiz', 'pitch', 'swing', 'result'],
  [TRIGGER.DURING_PITCH]: ['idle', 'pitch_with_quiz', 'judge', 'result'],
  [TRIGGER.AFTER_HIT]: ['idle', 'auto_hit', 'flying', 'quiz', 'result'],
}

export function nextPhase(trigger, current) {
  const seq = PHASES[trigger]
  const idx = seq.indexOf(current)
  return idx < 0 || idx >= seq.length - 1 ? seq[seq.length - 1] : seq[idx + 1]
}

export function describeTrigger(trigger) {
  switch (trigger) {
    case TRIGGER.BEFORE_PITCH:
      return { title: '🔴 예측 타격', sub: '문제 먼저 풀고 스윙권 획득!' }
    case TRIGGER.DURING_PITCH:
      return { title: '🟡 동시 타격', sub: '스페이스바 + 4지선다 동시!' }
    case TRIGGER.AFTER_HIT:
      return { title: '🟢 도주 타격', sub: '자동 타격 → 야수 잡기 전 문제!' }
    default:
      return { title: '타석', sub: '' }
  }
}
