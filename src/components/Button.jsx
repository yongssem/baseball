export default function Button({ children, variant = 'primary', className = '', ...rest }) {
  const base =
    'inline-flex items-center justify-center font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none px-5 py-3'
  const variants = {
    primary: 'bg-coral text-white shadow-md hover:brightness-105',
    mint: 'bg-mint text-text shadow-md hover:brightness-105',
    ghost: 'bg-white text-text border border-black/10 hover:bg-black/5',
    dark: 'bg-text text-white hover:brightness-110',
  }
  return (
    <button
      className={`rounded-button ${base} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
