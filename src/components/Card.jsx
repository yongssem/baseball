import { motion } from 'framer-motion'

export default function Card({ children, className = '', delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12, delay }}
      onClick={onClick}
      className={[
        'bg-white rounded-card p-5 shadow-[0_4px_16px_rgba(139,111,71,0.08)]',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
