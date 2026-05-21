import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-coral text-white hover:brightness-105',
  secondary: 'bg-mint text-text hover:brightness-105',
  ghost: 'bg-white text-text border border-text/10 hover:bg-bg',
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.96 }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={disabled ? undefined : onClick}
      className={[
        'px-5 py-3 rounded-button font-semibold shadow-sm select-none',
        variants[variant],
        disabled ? 'opacity-50 pointer-events-none' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}
