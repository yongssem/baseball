import { Howl } from 'howler'
import { useRef } from 'react'

/**
 * 효과음 훅. public/sounds/ 에 CC0 음원 파일을 두면 자동 사용.
 * 파일이 없으면 silent (콘솔 경고만).
 *
 * 권장 파일:
 *   /sounds/hit.mp3    — 타격
 *   /sounds/miss.mp3   — 헛스윙
 *   /sounds/cheer.mp3  — 환호 (홈런)
 *   /sounds/out.mp3    — 삼진/아웃
 */
const SRC = {
  hit: '/sounds/hit.mp3',
  miss: '/sounds/miss.mp3',
  cheer: '/sounds/cheer.mp3',
  out: '/sounds/out.mp3',
}

export default function useSfx() {
  const ref = useRef({})
  function get(name) {
    if (!ref.current[name] && SRC[name]) {
      try {
        ref.current[name] = new Howl({ src: [SRC[name]], volume: 0.6, html5: true })
      } catch (e) {
        // 파일 없거나 로드 실패 — 무음 동작
      }
    }
    return ref.current[name]
  }
  return {
    play: (name) => {
      try { get(name)?.play() } catch {}
    },
  }
}
