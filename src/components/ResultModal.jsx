import { motion, AnimatePresence } from 'framer-motion'
import { RESULT_LABEL } from '../game/constants'
import { isHit } from '../game/resultCalculator'
import Button from './Button'

export default function ResultModal({ open, result, score, onNext }) {
  const label = RESULT_LABEL[result] || ''
  const hit = result && isHit(result)
  const tone = result === 'HOME_RUN' ? '🎉 홈런!' : hit ? '👍 안타!' : '😢 아쉽다'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-card p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <div className="font-score text-sm opacity-60 mb-1">{tone}</div>
            <div
              className={`font-score text-5xl mb-2 ${
                result === 'HOME_RUN' ? 'text-coral' : hit ? 'text-mint' : 'text-text/60'
              }`}
            >
              {label}
            </div>
            {typeof score === 'number' && score > 0 && (
              <div className="text-sm mb-4">+{score}점</div>
            )}
            <Button onClick={onNext} className="w-full mt-2">
              다음 타석
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
