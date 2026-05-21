import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Footer from '../components/Footer'
import Field from '../components/Field'
import { SUBJECTS, GRADES, DIFFICULTIES, GAME_MODE } from '../game/constants'

export default function Home({ onStart }) {
  const [subject, setSubject] = useState('math')
  const [grade, setGrade] = useState(3)
  const [difficulty, setDifficulty] = useState('normal')
  const [mode, setMode] = useState(GAME_MODE.INNING)

  const Chip = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-button text-sm border transition ${
        active
          ? 'bg-coral text-white border-coral'
          : 'bg-white text-text border-black/10 hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-6 pb-10">
        <header className="text-center mb-4">
          <h1 className="font-score text-4xl text-coral leading-none">뚝딱야구</h1>
          <p className="text-xs opacity-70 mt-1">타이밍 + 퀴즈로 안타를 노려라!</p>
        </header>

        <div className="mb-4 rounded-card overflow-hidden bg-sky/30">
          <Field />
        </div>

        <Card className="mb-3">
          <p className="text-sm font-semibold mb-2">과목</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <Chip key={s.id} active={subject === s.id} onClick={() => setSubject(s.id)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </Card>

        <Card className="mb-3">
          <p className="text-sm font-semibold mb-2">학년</p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <Chip key={g} active={grade === g} onClick={() => setGrade(g)}>
                {g}학년
              </Chip>
            ))}
          </div>
        </Card>

        <Card className="mb-3">
          <p className="text-sm font-semibold mb-2">난이도</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip key={d.id} active={difficulty === d.id} onClick={() => setDifficulty(d.id)}>
                {d.label}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-text/60 mt-2">
            쉬움 = 1루타까지 · 보통 = 2루타까지 · 어려움 = 홈런 가능
          </p>
        </Card>

        <Card className="mb-5">
          <p className="text-sm font-semibold mb-2">게임 모드</p>
          <div className="flex gap-2">
            <Chip active={mode === GAME_MODE.INNING} onClick={() => setMode(GAME_MODE.INNING)}>
              3이닝 (수업용)
            </Chip>
            <Chip active={mode === GAME_MODE.AT_BAT} onClick={() => setMode(GAME_MODE.AT_BAT)}>
              10타석 (빠른 플레이)
            </Chip>
          </div>
        </Card>

        <Button
          className="w-full text-lg py-4"
          onClick={() => onStart({ subject, grade, difficulty, mode })}
        >
          ⚾ 경기 시작
        </Button>
      </main>
      <Footer />
    </div>
  )
}
