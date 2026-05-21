import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { RESULT_LABEL } from '../game/constants'
import { isHit } from '../game/resultCalculator'

export default function Result() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const subject = params.get('subject') || '수학'
  const grade = params.get('grade') || '3'
  const difficulty = params.get('difficulty') || 'normal'
  const score = Number(params.get('score') || 0)
  const atBats = Number(params.get('atBats') || 0)
  const history = (params.get('history') || '').split(',').filter(Boolean)

  const hits = history.filter(isHit).length
  const avg = atBats > 0 ? (hits / atBats).toFixed(3) : '.000'

  return (
    <Layout>
      <div className="text-center mb-4">
        <div className="text-5xl mb-1">🏆</div>
        <h1 className="text-2xl font-bold text-coral">경기 종료</h1>
        <div className="text-sm opacity-70">{subject} · {grade}학년 · {difficulty}</div>
      </div>

      <Card delay={0} className="mb-3 text-center">
        <div className="text-xs opacity-60 mb-1">최종 점수</div>
        <div className="font-score text-5xl text-coral">{score}</div>
      </Card>

      <Card delay={0.05} className="mb-3">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-[10px] opacity-60">타석</div>
            <div className="font-score text-2xl">{atBats}</div>
          </div>
          <div>
            <div className="text-[10px] opacity-60">안타</div>
            <div className="font-score text-2xl text-mint">{hits}</div>
          </div>
          <div>
            <div className="text-[10px] opacity-60">타율</div>
            <div className="font-score text-2xl">{avg}</div>
          </div>
        </div>
      </Card>

      <Card delay={0.1} className="mb-5">
        <div className="font-bold text-sm mb-2">📝 타석 기록</div>
        <div className="flex flex-wrap gap-1">
          {history.length === 0 && <div className="text-xs opacity-50">기록 없음</div>}
          {history.map((r, i) => (
            <span key={i} className={`text-[11px] px-2 py-1 rounded-full ${isHit(r) ? 'bg-mint/40' : 'bg-text/5'}`}>
              {i + 1}. {RESULT_LABEL[r] || r}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => nav(`/game?subject=${subject}&grade=${grade}&difficulty=${difficulty}`)}>
          🔄 다시하기
        </Button>
        <Button onClick={() => nav('/')}>🏠 홈으로</Button>
      </div>
    </Layout>
  )
}
