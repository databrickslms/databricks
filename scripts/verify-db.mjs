// Checks a DATABASE_URL before you paste it into a hosting dashboard.
// Reports connectivity and whether all expected tables exist. Never prints the
// connection string, the password, or any row data.
//
//   DATABASE_URL="postgresql://..." npm run verify:db

import { neon } from '@neondatabase/serverless'

const EXPECTED = [
  'account', 'enrollment', 'module_progress', 'quiz_attempt',
  'session', 'user', 'verificationToken',
]

const url = process.env.DATABASE_URL
if (!url) {
  console.error('\n  ✗ DATABASE_URL is not set.\n')
  console.error('    DATABASE_URL="postgresql://..." npm run verify:db\n')
  process.exit(1)
}

// Report the shape without revealing credentials.
let host = '(unparseable)'
let db = '(unknown)'
try {
  const u = new URL(url)
  host = u.hostname
  db = u.pathname.replace(/^\//, '')
} catch {
  console.error('\n  ✗ DATABASE_URL is not a valid URL. Re-copy it from Neon.\n')
  process.exit(1)
}

console.log(`\n  host      ${host}`)
console.log(`  database  ${db}`)
console.log(`  pooled    ${host.includes('-pooler') ? 'yes' : 'NO — use the pooled connection string'}`)

try {
  const sql = neon(url)
  const rows = await sql`
    select table_name from information_schema.tables where table_schema = 'public'
  `
  const found = rows.map((r) => r.table_name)
  const missing = EXPECTED.filter((t) => !found.includes(t))
  const extra = found.filter((t) => !EXPECTED.includes(t))

  console.log(`\n  connected ✓`)
  console.log(`  tables    ${found.length} found`)
  for (const t of EXPECTED) {
    console.log(`    ${found.includes(t) ? '✓' : '✗'}  ${t}`)
  }
  if (extra.length) console.log(`  other     ${extra.join(', ')}`)

  if (missing.length) {
    console.error(`\n  ✗ Missing ${missing.length} table(s): ${missing.join(', ')}`)
    console.error(`    Run drizzle/0000_*.sql in Neon's SQL Editor, or: npm run db:push\n`)
    process.exit(1)
  }

  if (!host.includes('-pooler')) {
    console.warn(`\n  ⚠ Connected, but this is the NON-pooled host. It works now and fails`)
    console.warn(`    intermittently under load. Switch to the pooled string.\n`)
    process.exit(1)
  }

  console.log(`\n  ✓ Ready. Paste this DATABASE_URL into Render → Environment.\n`)
} catch (err) {
  const m = err instanceof Error ? err.message : String(err)
  console.error(`\n  ✗ Could not query the database.`)
  console.error(`    ${m}\n`)
  if (/password authentication/i.test(m)) {
    console.error(`    The password is wrong or was truncated on copy. Re-copy from Neon.\n`)
  } else if (/getaddrinfo|ENOTFOUND/i.test(m)) {
    console.error(`    The host does not resolve. Check for a typo in the hostname.\n`)
  } else if (/relation .* does not exist/i.test(m)) {
    console.error(`    Connected, but the schema is missing. Run drizzle/0000_*.sql in Neon.\n`)
  }
  process.exit(1)
}
