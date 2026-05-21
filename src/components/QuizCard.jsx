import { motion } from 'framer-motion'

export default function QuizCard({ question, options = [], onAnswer, selected = null, locked = false, remainMs }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="bg-white rounded-card p-5 shadow-[0_4px_16px_rgba(139,111,71,0.08)]"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="text-[11px] text-coral font-bold">문제</div>
        {remainMs != null && (
          <div className="font-score text-sm" style={{ color: remainMs < 1500 ? '#FF6B6B' : '#8B6F47' }}>
            ⏱ {Math.max(0, Math.ceil(remainMs / 1000))}s
          </div>
        )}
      </div>
      <div className="text-lg font-semibold mb-4 leading-snug">{question}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          const isSel = selected === i
          return (
            <button
              key={i}
              onClick={() => !locked && onAnswer?.(i)}
              className={[
                'rounded-button px-3 py-3 text-left text-sm font-medium border transition',
                isSel ? 'bg-coral text-white border-coral' : 'bg-bg text-text border-text/10 hover:bg-mint/30',
                locked && !isSel ? 'opacity-50' : '',
              ].join(' ')}
            >
              <span className="font-score mr-2 opacity-70">{['①','②','③','④'][i]}</span>
              {opt}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
