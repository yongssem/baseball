import Card from './Card'

export default function QuizCard({ question, onAnswer, selected, disabled, compact = false }) {
  if (!question) return null
  return (
    <Card className={compact ? 'p-3' : ''}>
      <p className={`font-semibold ${compact ? 'text-base mb-2' : 'text-lg mb-3'}`}>
        {question.q}
      </p>
      <div className={`grid grid-cols-2 gap-2`}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isAnswer = disabled && i === question.answer
          const isWrongSelected = disabled && isSelected && i !== question.answer
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onAnswer?.(i)}
              className={[
                'rounded-button px-3 py-2 text-left transition border',
                'disabled:cursor-not-allowed',
                isAnswer
                  ? 'bg-mint border-mint text-text'
                  : isWrongSelected
                  ? 'bg-coral/30 border-coral text-text'
                  : isSelected
                  ? 'bg-coral text-white border-coral'
                  : 'bg-white border-black/10 hover:bg-black/5',
              ].join(' ')}
            >
              <span className="font-score text-xs mr-2 opacity-70">{['A','B','C','D'][i]}</span>
              {opt}
            </button>
          )
        })}
      </div>
      {disabled && question.explanation && (
        <p className="text-xs text-text/70 mt-3 leading-relaxed">💡 {question.explanation}</p>
      )}
    </Card>
  )
}
