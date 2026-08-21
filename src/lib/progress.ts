import 'server-only'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import type { Track } from './tracks'

export type ProgressRow = { completed: boolean; bestScore: number | null; total: number | null }
export type ProgressMap = Record<string, ProgressRow>

export async function getTrack(userId: string): Promise<Track> {
  const db = getDb()
  const [row] = await db
    .select({ track: schema.enrollments.track })
    .from(schema.enrollments)
    .where(eq(schema.enrollments.userId, userId))
    .limit(1)
  if (row) return row.track as Track
  await db.insert(schema.enrollments).values({ userId }).onConflictDoNothing()
  return 'author'
}

export async function setTrack(userId: string, track: Track) {
  const db = getDb()
  await db
    .insert(schema.enrollments)
    .values({ userId, track, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.enrollments.userId,
      set: { track, updatedAt: new Date() },
    })
}

export async function getProgress(userId: string): Promise<ProgressMap> {
  const db = getDb()
  const [progress, best] = await Promise.all([
    db
      .select({
        moduleSlug: schema.moduleProgress.moduleSlug,
        completed: schema.moduleProgress.completed,
      })
      .from(schema.moduleProgress)
      .where(eq(schema.moduleProgress.userId, userId)),
    db
      .select({
        moduleSlug: schema.quizAttempts.moduleSlug,
        score: sql<number>`max(${schema.quizAttempts.score})`.as('score'),
        total: sql<number>`max(${schema.quizAttempts.total})`.as('total'),
      })
      .from(schema.quizAttempts)
      .where(eq(schema.quizAttempts.userId, userId))
      .groupBy(schema.quizAttempts.moduleSlug),
  ])

  const map: ProgressMap = {}
  for (const p of progress) {
    map[p.moduleSlug] = { completed: p.completed, bestScore: null, total: null }
  }
  for (const b of best) {
    map[b.moduleSlug] = {
      completed: map[b.moduleSlug]?.completed ?? false,
      bestScore: b.score,
      total: b.total,
    }
  }
  return map
}

export async function markViewed(userId: string, moduleSlug: string) {
  const db = getDb()
  await db
    .insert(schema.moduleProgress)
    .values({ userId, moduleSlug, lastViewedAt: new Date() })
    .onConflictDoUpdate({
      target: [schema.moduleProgress.userId, schema.moduleProgress.moduleSlug],
      set: { lastViewedAt: new Date() },
    })
}

export async function setCompleted(userId: string, moduleSlug: string, completed: boolean) {
  const db = getDb()
  await db
    .insert(schema.moduleProgress)
    .values({
      userId,
      moduleSlug,
      completed,
      completedAt: completed ? new Date() : null,
      lastViewedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [schema.moduleProgress.userId, schema.moduleProgress.moduleSlug],
      set: { completed, completedAt: completed ? new Date() : null, lastViewedAt: new Date() },
    })
}

export async function saveAttempt(
  userId: string,
  moduleSlug: string,
  score: number,
  total: number,
  answers: number[],
) {
  const db = getDb()
  await db.insert(schema.quizAttempts).values({ userId, moduleSlug, score, total, answers })
  // Passing the knowledge check (>= 70%) also marks the module complete.
  if (total > 0 && score / total >= 0.7) await setCompleted(userId, moduleSlug, true)
}

export async function getAttempts(userId: string, moduleSlug: string) {
  const db = getDb()
  return db
    .select()
    .from(schema.quizAttempts)
    .where(and(eq(schema.quizAttempts.userId, userId), eq(schema.quizAttempts.moduleSlug, moduleSlug)))
    .orderBy(desc(schema.quizAttempts.attemptedAt))
    .limit(5)
}

export type CohortRow = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  track: string | null
  completed: number
  quizzesTaken: number
  avgScore: number | null
  lastActive: Date | null
}

export async function getCohort(): Promise<CohortRow[]> {
  const db = getDb()
  const rows = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      image: schema.users.image,
      track: schema.enrollments.track,
      completed: sql<number>`(
        select count(*) from ${schema.moduleProgress} mp
        where mp.user_id = ${schema.users.id} and mp.completed = true
      )`.as('completed'),
      quizzesTaken: sql<number>`(
        select count(distinct qa.module_slug) from ${schema.quizAttempts} qa
        where qa.user_id = ${schema.users.id}
      )`.as('quizzes_taken'),
      avgScore: sql<number | null>`(
        select round(avg(qa.score::numeric / nullif(qa.total, 0)) * 100)
        from ${schema.quizAttempts} qa where qa.user_id = ${schema.users.id}
      )`.as('avg_score'),
      lastActive: sql<Date | null>`(
        select max(mp.last_viewed_at) from ${schema.moduleProgress} mp
        where mp.user_id = ${schema.users.id}
      )`.as('last_active'),
    })
    .from(schema.users)
    .leftJoin(schema.enrollments, eq(schema.enrollments.userId, schema.users.id))

  return rows.sort((a, b) => Number(b.completed) - Number(a.completed))
}
