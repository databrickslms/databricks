import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>
let cached: Db | null = null

/**
 * Lazy so that `next build` succeeds without DATABASE_URL set — the connection
 * is only needed when a request actually touches the database.
 */
export function getDb(): Db {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.',
    )
  }
  cached = drizzle(neon(url), { schema })
  return cached
}

export { schema }
