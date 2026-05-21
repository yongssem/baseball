export default function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`bg-white rounded-card shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
