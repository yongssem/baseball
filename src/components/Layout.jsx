import Footer from './Footer'

export default function Layout({ children, className = '' }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <main className={['flex-1 w-full max-w-5xl mx-auto px-4 py-6', className].join(' ')}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
