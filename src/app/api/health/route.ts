import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { COURSES } from '@/lib/courses'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Deployment diagnostics. Reports whether each piece of configuration is
 * present and whether the database is reachable and migrated.
 *
 * Deliberately leaks nothing: environment variables are reported as booleans,
 * never values, and database errors are reduced to a short code. The full error
 * text is included only outside production.
 */
const EXPECTED_TABLES = [
  'user', 'account', 'session', 'verificationToken',
  'enrollment', 'module_progress', 'quiz_attempt',
]

function classify(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('database_url')) return 'DATABASE_URL_NOT_SET'
  if (m.includes('does not exist') && m.includes('relation')) return 'TABLES_MISSING'
  if (m.includes('password authentication') || m.includes('auth')) return 'DB_CREDENTIALS_REJECTED'
  if (m.includes('enotfound') || m.includes('getaddrinfo')) return 'DB_HOST_NOT_FOUND'
  if (m.includes('econnrefused') || m.includes('timeout') || m.includes('etimedout')) {
    return 'DB_UNREACHABLE'
  }
  if (m.includes('fetch failed')) return 'DB_FETCH_FAILED'
  return 'DB_ERROR'
}

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production'
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL_is_pooled: (process.env.DATABASE_URL ?? '').includes('-pooler'),
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_URL: !!process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === 'true',
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    INSTRUCTOR_EMAILS: !!process.env.INSTRUCTOR_EMAILS,
  }

  const database: Record<string, unknown> = { reachable: false, tables: null, missingTables: null }
  try {
    const db = getDb()
    const result = (await db.execute(sql`
      select table_name from information_schema.tables where table_schema = 'public'
    `)) as unknown
    const rows = (Array.isArray(result) ? result : (result as { rows: unknown[] }).rows) as {
      table_name: string
    }[]
    const found = rows.map((r) => r.table_name)
    const missing = EXPECTED_TABLES.filter((t) => !found.includes(t))
    database.reachable = true
    database.tables = found.length
    database.missingTables = missing
    database.migrated = missing.length === 0
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    database.code = classify(message)
    if (!isProd) database.detail = message
  }

  const content = {
    courses: COURSES.length,
    live: COURSES.filter((c) => c.status === 'live').map((c) => c.id),
    modules: COURSES.reduce((n, c) => n + c.moduleCount, 0),
  }

  const missingEnv = Object.entries(env)
    .filter(([k, v]) => !v && k !== 'DATABASE_URL_is_pooled')
    .map(([k]) => k)

  const ok = database.reachable === true && database.migrated === true && missingEnv.length === 0

  return NextResponse.json(
    { ok, env, missingEnv, database, content, nodeVersion: process.version },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
