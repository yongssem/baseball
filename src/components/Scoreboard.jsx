import { GAME_MODE } from '../game/constants'

export default function Scoreboard({ inning, outs, score, atBats, mode }) {
  return (
    <div className="bg-text text-white rounded-card px-4 py-3 flex items-center justify-between gap-4 font-score tracking-wider">
      {mode === GAME_MODE.INNING ? (
        <>
          <div className="text-center">
            <div className="text-[10px] opacity-60">이닝</div>
            <div className="text-xl text-mint">{inning}회</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] opacity-60">아웃</div>
            <div className="text-xl">
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < outs ? 'text-coral' : 'opacity-30'}>●</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-[10px] opacity-60">타석</div>
          <div className="text-xl text-mint">{atBats}/10</div>
        </div>
      )}
      <div className="text-center">
        <div className="text-[10px] opacity-60">점수</div>
        <div className="text-2xl text-coral">{String(score).padStart(2, '0')}</div>
      </div>
    </div>
  )
}
