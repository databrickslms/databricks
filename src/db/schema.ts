import {
  boolean, index, integer, jsonb, pgTable, primaryKey,
  text, timestamp, uniqueIndex,
} from 'drizzle-orm/pg-core'
import { randomUUID } from 'node:crypto'
import type { AdapterAccountType } from 'next-auth/adapters'

/* ─── Auth.js tables (shape required by @auth/drizzle-adapter) ─────────────── */

export const users = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
)

/* ─── Course tables ────────────────────────────────────────────────────────── */

/** One row per learner per course: which track they picked in that course. */
export const enrollments = pgTable(
  'enrollment',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id').notNull(),
    track: text('track').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })],
)

/** One row per learner per module they have opened or finished. */
export const moduleProgress = pgTable(
  'module_progress',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id').notNull(),
    moduleSlug: text('module_slug').notNull(),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Module slugs are only unique within a course, so the course must be in the key.
    uniqueIndex('module_progress_user_course_module_idx').on(t.userId, t.courseId, t.moduleSlug),
    index('module_progress_user_course_idx').on(t.userId, t.courseId),
  ],
)

/** Every knowledge-check submission, kept as history so retakes are visible. */
export const quizAttempts = pgTable(
  'quiz_attempt',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id').notNull(),
    moduleSlug: text('module_slug').notNull(),
    score: integer('score').notNull(),
    total: integer('total').notNull(),
    answers: jsonb('answers').$type<number[]>().notNull(),
    attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('quiz_attempt_user_course_idx').on(t.userId, t.courseId, t.moduleSlug)],
)
