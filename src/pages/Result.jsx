import Button from '../components/Button'
import Card from '../components/Card'
import Footer from '../components/Footer'
import { RESULT_LABEL } from '../game/constants'

export default function Result({ game, onRestart, onHome }) {
  const { stats, history, score } = game
  const avgText = (stats.avg * 1000).toFixed(0).padStart(3, '0') // 야구 타율 표기

  const breakdown = history.reduce((acc, h) => {
    acc[h.result] = (acc[h.result] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-6 pb-8">
        <header className="text-center mb-4">
          <h1 className="font-score text-3xl text-coral">경기 종료!</h1>
        </header>

        <Card className="mb-3 text-center">
          <p className="text-xs opacity-60">최종 점수</p>
          <p className="font-score text-6xl text-coral my-1">{score}</p>
          <p className="text-sm opacity-70">
            안타 {stats.hits}개 · 홈런 {stats.homeruns}개 · 타율 .{avgText}
          </p>
        </Card>

        <Card className="mb-3">
          <p className="text-sm font-semibold mb-2">결과 분석</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.keys(RESULT_LABEL).map((k) =>
              breakdown[k] ? (
                <div key={k} className="flex justify-between bg-bg rounded-button px-3 py-1.5">
                  <span>{RESULT_LABEL[k]}</span>
                  <span className="font-score text-coral">{breakdown[k]}</span>
                </div>
              ) : null,
            )}
          </div>
        </Card>

        <Card className="mb-5">
          <p className="text-sm font-semibold mb-2">타석 기록</p>
          <ol className="space-y-1 text-xs max-h-48 overflow-auto pr-1">
            {history.map((h, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-bg rounded-button px-2 py-1"
              >
                <span className="opacity-70">{i + 1}번 타석</span>
                <span className="font-score text-coral">{RESULT_LABEL[h.result]}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-2">
          <Button className="w-full" onClick={onRestart}>
            🔁 다시 하기
          </Button>
          <Button className="w-full" variant="ghost" onClick={onHome}>
            🏠 메인으로
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
