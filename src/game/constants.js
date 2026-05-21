export const TRIGGERS = {
  BEFORE_PITCH: 'BEFORE_PITCH',   // 공 오기 전에 문제 풀기 (예측형)
  DURING_PITCH: 'DURING_PITCH',   // 공 오는 동안 문제+타이밍 동시 (멀티)
  AFTER_HIT: 'AFTER_HIT',         // 친 후 야수 캐치 전 문제 풀기 (도주형)
}

export const TIMING = {
  PERFECT_MS: 100,
  GOOD_MS: 250,
}

export const RESULT = {
  HOMERUN: 'HOMERUN',
  TRIPLE: 'TRIPLE',
  DOUBLE: 'DOUBLE',
  SINGLE: 'SINGLE',
  FOUL: 'FOUL',
  GROUNDOUT: 'GROUNDOUT',
  STRIKEOUT: 'STRIKEOUT',
  FLYOUT: 'FLYOUT',
}

export const RESULT_LABEL = {
  HOMERUN: '🎉 홈런!',
  TRIPLE: '⚡ 3루타',
  DOUBLE: '✨ 2루타',
  SINGLE: '👍 안타',
  FOUL: '😬 파울',
  GROUNDOUT: '😢 땅볼 아웃',
  STRIKEOUT: '💥 삼진 아웃',
  FLYOUT: '🪂 플라이 아웃',
}

export const DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
}

// 난이도별 최대 보상 (CLAUDE.md 매핑)
export const REWARD_CAP = {
  easy: ['SINGLE'],
  normal: ['SINGLE', 'DOUBLE'],
  hard: ['SINGLE', 'DOUBLE', 'TRIPLE', 'HOMERUN'],
}

// 공 도착까지 시간 (ms)
export const PITCH_DURATION = {
  easy: 2000,
  normal: 1500,
  hard: 1100,
}

// 도주형: 야수 캐치까지 허용 시간 (ms)
export const FIELDER_CATCH_MS = {
  easy: 6000,
  normal: 4500,
  hard: 3000,
}
