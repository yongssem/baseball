import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'

const SUBJECTS = ['수학', '국어', '영어', '과학', '사회']
const GRADES = [1, 2, 3, 4, 5, 6]
const DIFFS = [
  { key: 'easy', label: '쉬움', desc: '1루까지', emoji: '🌱' },
  { key: 'normal', label: '보통', desc: '2루까지', emoji: '⭐' },
  { key: 'hard', label: '어려움', desc: '홈런 가능 🔥', emoji: '🔥' },
]

export default function Home() {
  const nav = useNavigate()
  const [subject, setSubject] = useState('수학')
  const [grade, setGrade] = useState(3)
  const [difficulty, setDifficulty] = useState('normal')

  const start = () => {
    const params = new URLSearchParams({ subject, grade: String(grade), difficulty })
    nav(`/game?${params.toString()}`)
  }

  return (
    <Layout>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">⚾</div>
        <h1 className="text-3xl font-bold text-coral">뚝딱야구</h1>
        <p className="text-sm opacity-70 mt-1">문제 풀고 안타 치는 학습 야구 게임</p>
      </div>

      <Card delay={0} className="mb-3">
        <div className="font-bold mb-3">📚 과목</div>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(s => (
            <button key={s}
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-button text-sm font-medium border ${subject === s ? 'bg-coral text-white border-coral' : 'bg-white border-text/10'}`}>
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card delay={0.05} className="mb-3">
        <div className="font-bold mb-3">🎒 학년</div>
        <div className="flex flex-wrap gap-2">
          {GRADES.map(g => (
            <button key={g}
              onClick={() => setGrade(g)}
              className={`px-4 py-2 rounded-button text-sm font-score border ${grade === g ? 'bg-mint border-mint text-text' : 'bg-white border-text/10'}`}>
              {g}학년
            </button>
          ))}
        </div>
      </Card>

      <Card delay={0.1} className="mb-5">
        <div className="font-bold mb-3">🔥 난이도</div>
        <div className="grid grid-cols-3 gap-2">
          {DIFFS.map(d => (
            <button key={d.key}
              onClick={() => setDifficulty(d.key)}
              className={`rounded-button p-3 text-center border ${difficulty === d.key ? 'bg-coral/10 border-coral' : 'bg-white border-text/10'}`}>
              <div className="text-2xl">{d.emoji}</div>
              <div className="font-bold text-sm mt-1">{d.label}</div>
              <div className="text-[10px] opacity-60">{d.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Button onClick={start} className="w-full text-lg">⚾ 경기 시작</Button>
    </Layout>
  )
}
