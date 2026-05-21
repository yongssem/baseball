import { AnimatePresence, motion } from 'framer-motion'
import Button from './Button'
import { RESULT_LABEL } from '../game/constants'

export default function ResultModal({ open, result, detail, onNext }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-text/40 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="bg-white rounded-card p-6 w-full max-w-sm text-center shadow-xl"
          >
            <div className="text-3xl font-bold mb-2">{RESULT_LABEL[result] || result}</div>
            {detail && <div className="text-sm opacity-70 mb-4">{detail}</div>}
            <Button onClick={onNext} className="w-full mt-2">다음 타석 ▶</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
