import { motion } from 'framer-motion'

/**
 * 공 애니메이션. phase에 따라 다른 궤적:
 *  - 'pitch': 마운드 → 홈 (직선)
 *  - 'hit':   홈 → 외야 (포물선)
 *  - 'idle':  보이지 않음
 *
 * 좌표는 Field SVG viewBox(400x300) 기준 → % 변환.
 */
export default function Ball({ phase = 'idle', duration = 1500, hitTarget = { x: 50, y: 20 } }) {
  if (phase === 'idle') return null

  // % 좌표
  const moundPct = { x: 50, y: 58 }
  const homePct = { x: 50, y: 86 }

  if (phase === 'pitch') {
    return (
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-white shadow-md border border-coral/50"
        initial={{ left: `${moundPct.x}%`, top: `${moundPct.y}%`, scale: 0.6 }}
        animate={{ left: `${homePct.x}%`, top: `${homePct.y}%`, scale: 1.2 }}
        transition={{ duration: duration / 1000, ease: 'easeIn' }}
        style={{ transform: 'translate(-50%,-50%)' }}
      />
    )
  }

  if (phase === 'hit') {
    // 포물선: y는 중간에 위로 솟구쳤다가 hitTarget으로
    return (
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-white shadow-md border border-coral/50"
        initial={{ left: `${homePct.x}%`, top: `${homePct.y}%` }}
        animate={{
          left: [`${homePct.x}%`, `${(homePct.x + hitTarget.x) / 2}%`, `${hitTarget.x}%`],
          top: [`${homePct.y}%`, `15%`, `${hitTarget.y}%`],
        }}
        transition={{ duration: 1.2, times: [0, 0.5, 1], ease: 'easeOut' }}
        style={{ transform: 'translate(-50%,-50%)' }}
      />
    )
  }

  return null
}
