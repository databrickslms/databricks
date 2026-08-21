import 'server-only'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { getCourse, resolveTrack } from './courses'

export type ProgressRow = { completed: boolean; bestScore: number | null; total: number | null }
export type ProgressMap = Record<string, ProgressRow>

export async function getTrack(userId: string, courseId: string): Promise<string> {
  const course = getCourse(courseId)
  const db = getDb()
  const [row] = await db
    .select({ track: schema.enrollments.track })
    .from(schema.enrollments)
    .where(and(eq(schema.enrollments.userId, userId), eq(schema.enrollments.courseId, courseId)))
    .limit(1)

  if (row) return resolveTrack(course!, row.track)

  const initial = resolveTrack(course!, null)
  await db
    .insert(schema.enrollments)
    .values({ userId, courseId, track: initial })
    .onConflictDoNothing()
  return initial
}

export async function setTrack(userId: string, courseId: string, track: string) {
  const db = getDb()
  await db
    .insert(schema.enrollments)
    .values({ userId, courseId, track, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [schema.enrollments.userId, schema.enrollments.courseId],
      set: { track, updatedAt: new Date() },
    })
}

export async function getProgress(userId: string, courseId: string): Promise<ProgressMap> {
  const db = getDb()
  const scope = (table: typeof schema.moduleProgress | typeof schema.quizAttempts) =>
    and(eq(table.userId, userId), eq(table.courseId, courseId))

  const [progress, best] = await Promise.all([
    db
      .select({
        moduleSlug: schema.moduleProgress.moduleSlug,
        completed: schema.moduleProgress.completed,
      })
      .from(schema.moduleProgress)
      .where(scope(schema.moduleProgress)),
    db
      .select({
        moduleSlug: schema.quizAttempts.moduleSlug,
        score: sql<number>`max(${schema.quizAttempts.score})`.as('score'),
        total: sql<number>`max(${schema.quizAttempts.total})`.as('total'),
      })
      .from(schema.quizAttempts)
      .where(scope(schema.quizAttempts))
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

export async function markViewed(userId: string, courseId: string, moduleSlug: string) {
  const db = getDb()
  await db
    .insert(schema.moduleProgress)
    .values({ userId, courseId, moduleSlug, lastViewedAt: new Date() })
    .onConflictDoUpdate({
      target: [
        schema.moduleProgress.userId,
        schema.moduleProgress.courseId,
        schema.moduleProgress.moduleSlug,
      ],
      set: { lastViewedAt: new Date() },
    })
}

export async function setCompleted(
  userId: string, courseId: string, moduleSlug: string, completed: boolean,
) {
  const db = getDb()
  await db
    .insert(schema.moduleProgress)
    .values({
      userId, courseId, moduleSlug, completed,
      completedAt: completed ? new Date() : null,
      lastViewedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        schema.moduleProgress.userId,
        schema.moduleProgress.courseId,
        schema.moduleProgress.moduleSlug,
      ],
      set: { completed, completedAt: completed ? new Date() : null, lastViewedAt: new Date() },
    })
}

export async function saveAttempt(
  userId: string, courseId: string, moduleSlug: string,
  score: number, total: number, answers: number[],
) {
  const db = getDb()
  await db.insert(schema.quizAttempts).values({ userId, courseId, moduleSlug, score, total, answers })
  // Passing the knowledge check (>= 70%) also marks the module complete.
  if (total > 0 && score / total >= 0.7) await setCompleted(userId, courseId, moduleSlug, true)
}

export async function getAttempts(userId: string, courseId: string, moduleSlug: string) {
  const db = getDb()
  return db
    .select()
    .from(schema.quizAttempts)
    .where(
      and(
        eq(schema.quizAttempts.userId, userId),
        eq(schema.quizAttempts.courseId, courseId),
        eq(schema.quizAttempts.moduleSlug, moduleSlug),
      ),
    )
    .orderBy(desc(schema.quizAttempts.attemptedAt))
    .limit(5)
}

export type CohortRow = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  courseId: string | null
  track: string | null
  completed: number
  quizzesTaken: number
  avgScore: number | null
  lastActive: Date | null
}

/**
 * One row per learner per course they have any activity in.
 *
 * Derived from the union of enrolments, module progress and quiz attempts —
 * not from enrolments alone. A learner with progress but no enrolment row
 * (imported data, a deleted enrolment) must still appear: silently omitting
 * someone from an instructor report is worse than showing an incomplete row.
 */
export async function getCohort(): Promise<CohortRow[]> {
  const db = getDb()
  const { users, enrollments, moduleProgress, quizAttempts } = schema

  const query = sql`
    with activity as (
          select ${enrollments.userId}    as user_id, ${enrollments.courseId}    as course_id from ${enrollments}
      union select ${moduleProgress.userId} as user_id, ${moduleProgress.courseId} as course_id from ${moduleProgress}
      union select ${quizAttempts.userId}   as user_id, ${quizAttempts.courseId}   as course_id from ${quizAttempts}
    )
    select
      u.id, u.name, u.email, u.image,
      a.course_id as "courseId",
      e.track,
      (select count(*) from ${moduleProgress} mp
        where mp.user_id = a.user_id and mp.course_id = a.course_id and mp.completed) as completed,
      (select count(distinct qa.module_slug) from ${quizAttempts} qa
        where qa.user_id = a.user_id and qa.course_id = a.course_id) as "quizzesTaken",
      (select round(avg(qa.score::numeric / nullif(qa.total, 0)) * 100) from ${quizAttempts} qa
        where qa.user_id = a.user_id and qa.course_id = a.course_id) as "avgScore",
      (select max(mp.last_viewed_at) from ${moduleProgress} mp
        where mp.user_id = a.user_id and mp.course_id = a.course_id) as "lastActive"
    from activity a
    join ${users} u on u.id = a.user_id
    left join ${enrollments} e on e.user_id = a.user_id and e.course_id = a.course_id
    order by completed desc, u.name asc
  `

  const result = (await db.execute(query)) as unknown
  // neon-http and pglite both return { rows }, but be tolerant of a bare array.
  const rows = (Array.isArray(result) ? result : (result as { rows: unknown[] }).rows) as CohortRow[]
  return rows
}
