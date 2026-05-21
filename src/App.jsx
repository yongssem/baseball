import { useState } from 'react'
import Home from './pages/Home'
import Game from './pages/Game'
import Result from './pages/Result'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [settings, setSettings] = useState(null)
  const [lastGame, setLastGame] = useState(null)

  if (screen === 'home') {
    return (
      <Home
        onStart={(s) => {
          setSettings(s)
          setScreen('game')
        }}
      />
    )
  }

  if (screen === 'game') {
    return (
      <Game
        settings={settings}
        onFinish={(game) => {
          setLastGame(game)
          setScreen('result')
        }}
      />
    )
  }

  return (
    <Result
      game={lastGame}
      onRestart={() => setScreen('game')}
      onHome={() => setScreen('home')}
    />
  )
}
