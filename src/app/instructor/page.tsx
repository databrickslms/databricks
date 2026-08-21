import { redirect } from 'next/navigation'
import { Avatar } from '@/components/avatar'
import { getSession } from '@/lib/session'
import { COURSES, getCourse, trackLabel } from '@/lib/courses'
import { modulesForTrack } from '@/lib/content'
import { getCohort, type CohortRow } from '@/lib/progress'

export const metadata = { title: 'Cohort' }
export const dynamic = 'force-dynamic'

const fmt = (d: Date | string | null) => {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function InstructorPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login?next=/instructor')
  if (!session.user.isInstructor) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-[1.9rem]">Instructors only</h1>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
          Add your email to <code className="font-mono">INSTRUCTOR_EMAILS</code> and redeploy to see
          the cohort dashboard.
        </p>
      </div>
    )
  }

  const cohort = await getCohort()
  // One section per course that anyone has actually enrolled in.
  const enrolledCourseIds = [...new Set(cohort.map((r) => r.courseId).filter(Boolean))] as string[]
  const sections = COURSES.filter((c) => enrolledCourseIds.includes(c.id))
  const learners = new Set(cohort.map((r) => r.id)).size

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12">
      <h1 className="font-display text-[2.2rem] leading-tight tracking-tight">Cohort</h1>
      <p className="mt-2 text-[0.9rem] text-muted">
        Completion and knowledge-check scores, per course.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ['Learners', String(learners)],
          ['Enrolments', String(cohort.length)],
          ['Courses in use', String(sections.length)],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <div className="text-[0.7rem] uppercase tracking-wider text-faint">{label}</div>
            <div className="mt-1.5 font-display text-[1.9rem] leading-none">{value}</div>
          </div>
        ))}
      </div>

      {sections.length === 0 ? (
        <p className="mt-10 text-[0.9rem] text-muted">
          Nobody has enrolled yet. Share the site and ask people to sign in with Google.
        </p>
      ) : (
        sections.map((course) => {
          const rows = cohort.filter((r) => r.courseId === course.id)
          const active = rows.filter((r) => Number(r.completed) > 0 || Number(r.quizzesTaken) > 0)
          const avg = active.length
            ? Math.round(active.reduce((n, r) => n + Number(r.avgScore ?? 0), 0) / active.length)
            : null

          return (
            <section key={course.id} className="mt-12">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-[1.5rem] tracking-tight">{course.title}</h2>
                <p className="text-[0.8rem] text-faint">
                  {rows.length} enrolled · {active.length} active
                  {avg !== null && ` · ${avg}% avg score`}
                </p>
              </div>
              <CohortTable courseId={course.id} rows={rows} />
            </section>
          )
        })
      )}
    </div>
  )
}

function CohortTable({ courseId, rows }: { courseId: string; rows: CohortRow[] }) {
  const course = getCourse(courseId)
  const totalFor = (track: string | null) =>
    modulesForTrack(courseId, track ?? course?.defaultTrack ?? '').length

  return (
    <div className="table-scroll mt-4">
      <table className="w-full text-[0.855rem]">
        <thead>
          <tr className="border-b">
            {['Learner', 'Track', 'Complete', 'Checks taken', 'Avg score', 'Last active'].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const total = totalFor(r.track)
            const pct = total ? Math.round((Number(r.completed) / total) * 100) : 0
            return (
              <tr key={`${r.id}-${r.courseId}`} className="border-b last:border-0">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={r.image} name={r.name} size={24} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.name ?? 'Unnamed'}</div>
                      <div className="truncate text-[0.72rem] text-faint">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                  {course ? trackLabel(course, r.track ?? '') : r.track}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-16 overflow-hidden rounded-full"
                      style={{ background: 'rgb(var(--line))' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100 ? 'rgb(var(--teal))' : 'rgb(var(--accent))',
                        }}
                      />
                    </div>
                    <span className="font-mono text-[0.75rem] tabular-nums text-muted">
                      {Number(r.completed)}/{total}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-muted">{Number(r.quizzesTaken)}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums">
                  {r.avgScore === null ? '—' : `${Number(r.avgScore)}%`}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{fmt(r.lastActive)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
