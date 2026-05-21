export const TRIGGER = {
  BEFORE_PITCH: 'BEFORE_PITCH', // 예측형: 문제 먼저 → 스윙권
  DURING_PITCH: 'DURING_PITCH', // 멀티태스킹: 타이밍 + 4지선다 동시
  AFTER_HIT: 'AFTER_HIT',       // 도주형: 자동 타격 후 야수 잡기 전 문제
}

export const TRIGGER_LIST = [TRIGGER.BEFORE_PITCH, TRIGGER.DURING_PITCH, TRIGGER.AFTER_HIT]

// 결과
export const RESULT = {
  HOME_RUN: 'HOME_RUN',
  TRIPLE: 'TRIPLE',
  DOUBLE: 'DOUBLE',
  SINGLE: 'SINGLE',
  FOUL: 'FOUL',
  GROUND_OUT: 'GROUND_OUT',
  STRIKEOUT: 'STRIKEOUT',
  CAUGHT_OUT: 'CAUGHT_OUT',
}

export const RESULT_LABEL = {
  HOME_RUN: '홈런',
  TRIPLE: '3루타',
  DOUBLE: '2루타',
  SINGLE: '안타',
  FOUL: '파울',
  GROUND_OUT: '땅볼',
  STRIKEOUT: '삼진',
  CAUGHT_OUT: '플라이 아웃',
}

export const TIMING = {
  PERFECT: 'PERFECT',
  GOOD: 'GOOD',
  MISS: 'MISS',
}

// 스페이스바 입력 윈도우 (ms)
export const TIMING_WINDOW = {
  PERFECT: 100,
  GOOD: 250,
}

// 공 비행 시간 (난이도별)
export const PITCH_DURATION_MS = {
  easy: 1800,
  normal: 1500,
  hard: 1100,
}

// 난이도별 보상 상한
export const DIFFICULTY_CAP = {
  easy: RESULT.SINGLE,
  normal: RESULT.DOUBLE,
  hard: RESULT.HOME_RUN,
}

// 점수
export const RESULT_SCORE = {
  HOME_RUN: 4,
  TRIPLE: 3,
  DOUBLE: 2,
  SINGLE: 1,
  FOUL: 0,
  GROUND_OUT: 0,
  STRIKEOUT: 0,
  CAUGHT_OUT: 0,
}

// 게임 모드
export const GAME_MODE = {
  INNING: 'INNING', // 3아웃 × 3이닝
  AT_BAT: 'AT_BAT', // 10타석
}

export const SUBJECTS = [
  { id: 'math', label: '수학' },
  { id: 'korean', label: '국어' },
  { id: 'english', label: '영어' },
  { id: 'science', label: '과학' },
  { id: 'social', label: '사회' },
]

export const GRADES = [1, 2, 3, 4, 5, 6]

export const DIFFICULTIES = [
  { id: 'easy', label: '쉬움' },
  { id: 'normal', label: '보통' },
  { id: 'hard', label: '어려움' },
]
