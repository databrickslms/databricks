'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const isDbError = /DATABASE_URL|connect|ECONNREFUSED|neon/i.test(error.message)
  return (
    <div className="mx-auto max-w-xl px-5 py-28">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em]" style={{ color: 'rgb(var(--rose))' }}>
        Error
      </p>
      <h1 className="mt-3 font-display text-[2rem] leading-tight">Something broke</h1>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
        {isDbError
          ? 'The app could not reach the database. Check that DATABASE_URL points at your Neon pooled connection string and that the environment variable is set on Render.'
          : error.message}
      </p>
      <button onClick={reset} className="btn-ghost mt-7">Try again</button>
    </div>
  )
}
