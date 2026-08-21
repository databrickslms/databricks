/**
 * Integration test for the progress layer, run against an in-process Postgres
 * (PGlite) so the real query code is exercised — including the hand-written
 * cohort SQL, which is the highest-risk code in the app.
 *
 *   npm run test:db
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from '../src/db/schema'
import { __setTestDb } from '../src/db'
import {
  getCohort, getProgress, getTrack, markViewed, saveAttempt, setCompleted, setTrack,
} from '../src/lib/progress'

let passed = 0
const failures: string[] = []

function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) { passed++; console.log(`  ok    ${label}`) }
  else {
    failures.push(label)
    console.log(`  FAIL  ${label}${detail !== undefined ? ` — got ${JSON.stringify(detail)}` : ''}`)
  }
}
const eq = (label: string, actual: unknown, expected: unknown) =>
  check(`${label} = ${JSON.stringify(expected)}`, JSON.stringify(actual) === JSON.stringify(expected), actual)

async function main() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  __setTestDb(db)

  // Apply the same DDL that `npm run db:push` produces.
  const dir = join(process.cwd(), 'drizzle')
  const sqlFile = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()[0]
  const ddl = readFileSync(join(dir, sqlFile), 'utf8')
  for (const stmt of ddl.split('--> statement-breakpoint')) {
    const trimmed = stmt.trim()
    if (trimmed) await client.exec(trimmed)
  }
  console.log(`\nschema applied from drizzle/${sqlFile}\n`)

  // Two learners.
  await db.insert(schema.users).values([
    { id: 'u-priya',  name: 'Priya Raman', email: 'priya@example.com' },
    { id: 'u-marcus', name: 'Marcus Chen', email: 'marcus@example.com' },
  ])

  console.log('--- enrollment and track ---')
  eq('new learner gets the course default track', await getTrack('u-priya', 'genie-agents'), 'author')
  await setTrack('u-priya', 'genie-agents', 'business')
  eq('track switch persists', await getTrack('u-priya', 'genie-agents'), 'business')
  await setTrack('u-priya', 'genie-agents', 'author')
  eq('switching back persists', await getTrack('u-priya', 'genie-agents'), 'author')

  const rows = await db.select().from(schema.enrollments)
  eq('repeated setTrack upserts rather than duplicating', rows.length, 1)

  console.log('\n--- course isolation (the reason for this refactor) ---')
  await setTrack('u-priya', 'agent-bricks', 'author')
  eq('a second course is a separate enrolment', (await db.select().from(schema.enrollments)).length, 2)

  // Same slug in both courses — this is what would have collided before course_id.
  await setCompleted('u-priya', 'genie-agents', '00-build-the-meridian-dataset', true)
  await setCompleted('u-priya', 'agent-bricks', '00-build-the-meridian-dataset', true)
  const mp = await db.select().from(schema.moduleProgress)
  eq('identical slugs coexist across courses', mp.length, 2)

  const gaProgress = await getProgress('u-priya', 'genie-agents')
  const abProgress = await getProgress('u-priya', 'agent-bricks')
  check('progress is scoped per course',
    Object.keys(gaProgress).length === 1 && Object.keys(abProgress).length === 1)

  console.log('\n--- viewing and completion ---')
  await markViewed('u-priya', 'genie-agents', '01-what-genie-is')
  let p = await getProgress('u-priya', 'genie-agents')
  eq('viewing records the module without completing it', p['01-what-genie-is']?.completed, false)

  await markViewed('u-priya', 'genie-agents', '01-what-genie-is')
  eq('re-viewing does not duplicate the row',
    (await db.select().from(schema.moduleProgress)).length, 3)

  await setCompleted('u-priya', 'genie-agents', '01-what-genie-is', true)
  p = await getProgress('u-priya', 'genie-agents')
  eq('marking complete works', p['01-what-genie-is']?.completed, true)
  await setCompleted('u-priya', 'genie-agents', '01-what-genie-is', false)
  p = await getProgress('u-priya', 'genie-agents')
  eq('un-marking complete works', p['01-what-genie-is']?.completed, false)

  console.log('\n--- quiz attempts ---')
  await saveAttempt('u-priya', 'genie-agents', '09-knowledge-store', 2, 4, [0, 1, 2, 3])
  p = await getProgress('u-priya', 'genie-agents')
  eq('a failing score (50%) does not complete the module',
    p['09-knowledge-store']?.completed, false)
  eq('failing score is recorded', p['09-knowledge-store']?.bestScore, 2)

  await saveAttempt('u-priya', 'genie-agents', '09-knowledge-store', 4, 4, [0, 0, 0, 0])
  p = await getProgress('u-priya', 'genie-agents')
  eq('a passing score auto-completes the module', p['09-knowledge-store']?.completed, true)
  eq('best score is the max across attempts, not the latest', p['09-knowledge-store']?.bestScore, 4)

  await saveAttempt('u-priya', 'genie-agents', '09-knowledge-store', 1, 4, [1, 1, 1, 1])
  p = await getProgress('u-priya', 'genie-agents')
  eq('a later worse attempt does not lower the best score', p['09-knowledge-store']?.bestScore, 4)
  eq('a later worse attempt does not un-complete the module',
    p['09-knowledge-store']?.completed, true)
  eq('every attempt is kept as history',
    (await db.select().from(schema.quizAttempts)).length, 3)

  eq('70% exactly should pass', await (async () => {
    await saveAttempt('u-marcus', 'genie-agents', '13-performance', 7, 10, [])
    const q = await getProgress('u-marcus', 'genie-agents')
    return q['13-performance']?.completed
  })(), true)

  console.log('\n--- cohort query (hand-written SQL) ---')
  // Marcus has quiz activity but no enrolment row on purpose: he must still appear.
  const cohort = await getCohort()
  eq('one row per learner per course with any activity', cohort.length, 3)
  check('a learner with activity but no enrolment still appears',
    cohort.some((r) => r.id === 'u-marcus'))

  const priyaGa = cohort.find((r) => r.id === 'u-priya' && r.courseId === 'genie-agents')!
  const priyaAb = cohort.find((r) => r.id === 'u-priya' && r.courseId === 'agent-bricks')!
  const marcus  = cohort.find((r) => r.id === 'u-marcus')!

  eq('completed count is course-scoped (genie-agents)', Number(priyaGa.completed), 2)
  eq('completed count is course-scoped (agent-bricks)', Number(priyaAb.completed), 1)
  eq('quizzes taken counts distinct modules, not attempts',
    Number(priyaGa.quizzesTaken), 1)
  eq('quizzes taken is 0 for a course with no attempts', Number(priyaAb.quizzesTaken), 0)
  eq('avg score averages across attempts of that course only',
    Number(priyaGa.avgScore), 58) // (2/4 + 4/4 + 1/4)/3 = 0.5833 -> 58
  check('avg score is null when no attempts exist', priyaAb.avgScore === null, priyaAb.avgScore)
  eq('marcus is scoped to his own row', Number(marcus.completed), 1)
  check('missing enrolment shows a null track rather than hiding the learner',
    marcus.track === null, marcus.track)
  eq('marcus avg score', Number(marcus.avgScore), 70)
  check('lastActive is populated where progress exists', priyaGa.lastActive instanceof Date
    || typeof priyaGa.lastActive === 'string', priyaGa.lastActive)
  check('cohort is sorted by completion desc', Number(cohort[0].completed) >= Number(cohort[cohort.length - 1].completed))

  console.log('\n--- cascade delete ---')
  await db.delete(schema.users).where(
    // deleting a learner must remove their progress, not orphan it
    (await import('drizzle-orm')).eq(schema.users.id, 'u-priya'),
  )
  eq('progress rows cascade', (await db.select().from(schema.moduleProgress)).length, 1)
  eq('attempts cascade', (await db.select().from(schema.quizAttempts)).length, 1)
  // Both enrolments belonged to Priya (Marcus never had one), so none remain.
  eq('enrolments cascade', (await db.select().from(schema.enrollments)).length, 0)

  await client.close()

  console.log(`\n${passed} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
  console.log('DB INTEGRATION TESTS PASSED')
}

main().catch((err) => { console.error(err); process.exit(1) })
