'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Health = {
  ok: boolean
  missingEnv?: string[]
  database?: { reachable?: boolean; migrated?: boolean; code?: string; missingTables?: string[] }
}

const CAUSES: Record<string, { title: string; fix: string }> = {
  DATABASE_URL_NOT_SET: {
    title: 'DATABASE_URL is not set on the server',
    fix: 'Add it in Render → your service → Environment, using the Neon pooled connection string, then redeploy.',
  },
  TABLES_MISSING: {
    title: 'The database is reachable but has no tables',
    fix: 'Run `DATABASE_URL="…" npm run db:push`, or paste drizzle/0000_*.sql into Neon’s SQL editor.',
  },
  DB_CREDENTIALS_REJECTED: {
    title: 'The database rejected the credentials',
    fix: 'Re-copy the Neon connection string — the password may have been rotated or truncated.',
  },
  DB_HOST_NOT_FOUND: {
    title: 'The database host could not be resolved',
    fix: 'Check the host in DATABASE_URL. It should contain “-pooler” for the pooled endpoint.',
  },
  DB_UNREACHABLE: {
    title: 'The database refused the connection',
    fix: 'Confirm the Neon project is not suspended and that sslmode=require is present.',
  },
  DB_FETCH_FAILED: {
    title: 'The database request failed at the network layer',
    fix: 'Usually a malformed DATABASE_URL. Confirm it is the pooled string and includes sslmode=require.',
  },
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [health, setHealth] = useState<Health | null>(null)
  const [checked, setChecked] = useState(false)

  // Production strips error.message, so ask the server what is actually wrong.
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [])

  const code = health?.database?.code
  const cause = code ? CAUSES[code] : undefined
  const missingEnv = health?.missingEnv ?? []

  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em]" style={{ color: 'rgb(var(--rose))' }}>
        Error
      </p>
      <h1 className="mt-3 font-display text-[2rem] leading-tight">Something broke</h1>

      {!checked && <p className="mt-4 text-[0.9rem] text-muted">Checking the server…</p>}

      {checked && cause && (
        <div className="card mt-6 p-5">
          <h2 className="text-[0.95rem] font-semibold">{cause.title}</h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{cause.fix}</p>
          {!!health?.database?.missingTables?.length && (
            <p className="mt-3 font-mono text-[0.76rem] text-faint">
              missing tables: {health.database.missingTables.join(', ')}
            </p>
          )}
        </div>
      )}

      {checked && !cause && missingEnv.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="text-[0.95rem] font-semibold">Environment variables are missing</h2>
          <p className="mt-2 font-mono text-[0.8rem] leading-relaxed" style={{ color: 'rgb(var(--rose))' }}>
            {missingEnv.join(', ')}
          </p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
            Set these in Render → your service → Environment, then redeploy.
          </p>
        </div>
      )}

      {checked && !cause && missingEnv.length === 0 && (
        <div className="card mt-6 p-5">
          <h2 className="text-[0.95rem] font-semibold">Configuration looks correct</h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
            The database is reachable and migrated, and no environment variables are missing —
            so this is a bug rather than a setup problem. The server log holds the real message;
            match the digest below in Render → Logs.
          </p>
        </div>
      )}

      {error.digest && (
        <p className="mt-5 font-mono text-[0.76rem] text-faint">digest: {error.digest}</p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Back to courses</Link>
        <a href="/api/health" className="btn-ghost" target="_blank" rel="noreferrer">
          Full diagnostics
        </a>
      </div>
    </div>
  )
}
