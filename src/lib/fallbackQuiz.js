/**
 * Firebase/AI 미설정 환경에서도 게임이 동작하도록 하는 데모 문제 풀.
 * 실제 운영에서는 사용되지 않음 (AI 호출 실패 시 안전망).
 */
export const FALLBACK = {
  math_3_easy: [
    { q: '12 + 7 = ?', options: ['18', '19', '20', '21'], answer: 1, explanation: '12+7=19' },
    { q: '20 - 6 = ?', options: ['12', '13', '14', '15'], answer: 2, explanation: '20-6=14' },
    { q: '3 × 4 = ?', options: ['10', '11', '12', '13'], answer: 2, explanation: '3×4=12' },
    { q: '18 ÷ 2 = ?', options: ['7', '8', '9', '10'], answer: 2, explanation: '18÷2=9' },
    { q: '5 + 6 = ?', options: ['10', '11', '12', '13'], answer: 1, explanation: '5+6=11' },
    { q: '15 - 8 = ?', options: ['5', '6', '7', '8'], answer: 2, explanation: '15-8=7' },
    { q: '4 × 5 = ?', options: ['18', '19', '20', '22'], answer: 2, explanation: '4×5=20' },
    { q: '14 + 9 = ?', options: ['22', '23', '24', '25'], answer: 1, explanation: '14+9=23' },
  ],
  korean_3_easy: [
    { q: '"사과"의 받침은?', options: ['ㄱ', 'ㅇ', '없음', 'ㄴ'], answer: 2, explanation: '"과"에 받침 없음' },
    { q: '"학교"의 첫 자음은?', options: ['ㅎ', 'ㄱ', 'ㅎ과 ㄱ', 'ㄴ'], answer: 0, explanation: '"학"의 첫 자음 ㅎ' },
    { q: '문장 끝에 쓰는 부호는?', options: [',', '?', '"', '!'], answer: 1, explanation: '의문문에는 ?' },
    { q: '"빨갛다"의 반대말은?', options: ['파랗다', '하얗다', '검다', '노랗다'], answer: 1, explanation: '대조' },
  ],
}

export function pickFallback({ subject, grade, difficulty }) {
  // subject 한글 → 영문 키
  const map = { 수학: 'math', 국어: 'korean', 영어: 'english', 과학: 'science', 사회: 'social' }
  const sub = map[subject] || 'math'
  const key = `${sub}_${grade}_${difficulty}`
  return FALLBACK[key] || FALLBACK.math_3_easy
}
