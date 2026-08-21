/**
 * Local preview mode — lets you browse the whole signed-in UI with no Google
 * OAuth client and no database.
 *
 * Enabled only when BOTH are true:
 *   1. PREVIEW=1 is set explicitly, and
 *   2. NODE_ENV is not "production".
 *
 * `next build` / `next start` set NODE_ENV=production, so a deployed app can
 * never enable this — the second condition is a hard guarantee, not a promise.
 *
 * Progress lives in a module-level Map and resets when the dev server
 * restarts. That is deliberate: this exists to look at the UI, not to test
 * persistence. Persistence is covered properly by tests/db.test.ts.
 */
import type { ProgressMap, ProgressRow, CohortRow } from './progress'

export const isPreview = () =>
  process.env.PREVIEW === '1' && process.env.NODE_ENV !== 'production'

export const PREVIEW_USER = {
  id: 'preview-user',
  name: 'Preview Learner',
  email: 'preview@localhost',
  image: null as string | null,
  isInstructor: true, // so /instructor is reachable without configuring emails
}

export const previewSession = () => ({
  user: { ...PREVIEW_USER },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
})

type Key = string
const key = (courseId: string, slug: string) => `${courseId}::${slug}`

const tracks = new Map<string, string>()
const progress = new Map<Key, { completed: boolean; lastViewedAt: Date }>()
const attempts: { courseId: string; slug: string; score: number; total: number }[] = []

export const store = {
  getTrack(courseId: string) {
    return tracks.get(courseId)
  },
  setTrack(courseId: string, track: string) {
    tracks.set(courseId, track)
  },
  markViewed(courseId: string, slug: string) {
    const k = key(courseId, slug)
    const existing = progress.get(k)
    progress.set(k, { completed: existing?.completed ?? false, lastViewedAt: new Date() })
  },
  setCompleted(courseId: string, slug: string, completed: boolean) {
    const k = key(courseId, slug)
    progress.set(k, { completed, lastViewedAt: new Date() })
  },
  saveAttempt(courseId: string, slug: string, score: number, total: number) {
    attempts.push({ courseId, slug, score, total })
    if (total > 0 && score / total >= 0.7) this.setCompleted(courseId, slug, true)
  },
  getProgress(courseId: string): ProgressMap {
    const map: ProgressMap = {}
    for (const [k, v] of progress) {
      const [course, slug] = k.split('::')
      if (course === courseId) map[slug] = { completed: v.completed, bestScore: null, total: null }
    }
    for (const a of attempts) {
      if (a.courseId !== courseId) continue
      const row: ProgressRow = map[a.slug] ?? { completed: false, bestScore: null, total: null }
      map[a.slug] = {
        completed: row.completed,
        bestScore: Math.max(row.bestScore ?? 0, a.score),
        total: a.total,
      }
    }
    return map
  },
  getCohort(): CohortRow[] {
    const courseIds = new Set<string>([
      ...tracks.keys(),
      ...[...progress.keys()].map((k) => k.split('::')[0]),
      ...attempts.map((a) => a.courseId),
    ])
    return [...courseIds].map((courseId) => {
      const mine = attempts.filter((a) => a.courseId === courseId)
      const completed = [...progress.entries()].filter(
        ([k, v]) => k.startsWith(`${courseId}::`) && v.completed,
      ).length
      const lastActive = [...progress.entries()]
        .filter(([k]) => k.startsWith(`${courseId}::`))
        .map(([, v]) => v.lastViewedAt)
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
      return {
        id: PREVIEW_USER.id,
        name: PREVIEW_USER.name,
        email: PREVIEW_USER.email,
        image: PREVIEW_USER.image,
        courseId,
        track: tracks.get(courseId) ?? null,
        completed,
        quizzesTaken: new Set(mine.map((a) => a.slug)).size,
        avgScore: mine.length
          ? Math.round((mine.reduce((n, a) => n + a.score / a.total, 0) / mine.length) * 100)
          : null,
        lastActive,
      }
    })
  },
}
