export default function Scoreboard({ inning, half, outs, score, atBats }) {
  return (
    <div className="bg-text text-white rounded-card px-5 py-3 font-score tracking-wider flex items-center gap-6 shadow-md">
      <div>
        <div className="text-[10px] opacity-60">이닝</div>
        <div className="text-xl">{inning}{half === 'top' ? '▲' : '▼'}</div>
      </div>
      <div>
        <div className="text-[10px] opacity-60">아웃</div>
        <div className="text-xl">
          {['●', '●', '●'].map((c, i) => (
            <span key={i} style={{ opacity: i < outs ? 1 : 0.25 }}>{c}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] opacity-60">점수</div>
        <div className="text-2xl text-coral">{score}</div>
      </div>
      <div className="ml-auto">
        <div className="text-[10px] opacity-60">타석</div>
        <div className="text-xl">{atBats}</div>
      </div>
    </div>
  )
}
