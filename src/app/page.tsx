import Link from 'next/link'
import { COURSES, SITE, coursesByArea, type Course } from '@/lib/courses'

export default function Home() {
  const groups = coursesByArea()
  const live = COURSES.filter((c) => c.status === 'live')
  const totalUnits = live.reduce((n, c) => n + c.moduleCount, 0)
  const totalQuestions = live.reduce((n, c) => n + c.questionCount, 0)

  return (
    <div>
      <section className="grain border-b">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:py-28">
          <p className="mb-5 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
            {SITE.tagline}
          </p>
          <h1 className="max-w-4xl font-display text-[2.6rem] leading-[1.07] tracking-[-0.02em] sm:text-[3.9rem]">
            Learn the Databricks platform{' '}
            <span className="text-accent">one feature at a time</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
            {SITE.description}
          </p>

          {live.length > 0 && (
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={`/c/${live[0].id}/learn`} className="btn-primary !px-6 !py-2.5">
                {live.length === 1 ? `Start ${live[0].title}` : 'Start learning'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" />
                </svg>
              </Link>
              <a href="#catalog" className="btn-ghost !px-5 !py-2.5">Browse the catalog</a>
            </div>
          )}

          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              [String(live.length), live.length === 1 ? 'course live' : 'courses live'],
              [String(totalUnits), 'units'],
              [String(totalQuestions), 'quiz questions'],
              [String(COURSES.length - live.length), 'in the pipeline'],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-[2rem] leading-none">{n}</dt>
                <dd className="mt-1 text-[0.76rem] uppercase tracking-wider text-faint">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-[1400px] scroll-mt-20 px-5 py-16">
        <h2 className="font-display text-[1.9rem] tracking-tight">Catalog</h2>
        <p className="mt-2 max-w-2xl text-[0.925rem] text-muted">
          Grouped by Databricks capability area. Every course is built on a real dataset with the
          traps left in on purpose.
        </p>

        <div className="mt-9 space-y-11">
          {groups.map(({ area, courses }) => (
            <div key={area.id} className="grid gap-5 lg:grid-cols-[14rem_1fr]">
              <div className="lg:pt-1">
                <h3 className="text-[0.9rem] font-semibold">{area.name}</h3>
                <p className="mt-1 text-[0.78rem] leading-snug text-faint">{area.blurb}</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {courses.map((c) => <li key={c.id}><CourseCard course={c} /></li>)}
              </ul>
            </div>
          ))}
        </div>

        {groups.length < SITE.areas.length && (
          <div className="mt-14 rounded-2xl border border-dashed p-6">
            <h3 className="text-[0.9rem] font-semibold">Areas with no courses yet</h3>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
              {SITE.areas
                .filter((a) => !groups.some((g) => g.area.id === a.id))
                .map((a) => a.name)
                .join(' · ')}
            </p>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-faint">
              Add a course by creating <code className="font-mono">content/courses/&lt;id&gt;/course.json</code>{' '}
              with an <code className="font-mono">area</code> and a{' '}
              <code className="font-mono">plan.md</code>. See the README.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-[0.78rem] text-faint">
          <p>
            {SITE.name} — an internal learning site. Content is grounded in{' '}
            <code className="font-mono">docs.databricks.com</code>; not affiliated with Databricks.
          </p>
        </div>
      </footer>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const planned = course.status === 'planned'

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-[1.35rem] leading-tight">{course.title}</div>
          {course.subtitle && (
            <div className="mt-0.5 text-[0.8rem] text-faint">{course.subtitle}</div>
          )}
        </div>
        {planned ? (
          <span className="chip shrink-0 !text-faint">Planned</span>
        ) : course.status === 'draft' ? (
          <span className="chip shrink-0" style={{ color: 'rgb(var(--amber))', borderColor: 'rgb(var(--amber) / .4)' }}>
            Draft
          </span>
        ) : (
          <span className="chip shrink-0 !border-accent/45 !text-accent">Live</span>
        )}
      </div>

      <p className="mt-2.5 text-[0.855rem] leading-relaxed text-muted">
        {course.promise ?? course.description}
      </p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {course.domain && <span className="chip">{course.domain}</span>}
        {!planned && <span className="chip">{course.moduleCount} units</span>}
        {!planned && course.questionCount > 0 && (
          <span className="chip">{course.questionCount} questions</span>
        )}
      </div>
    </>
  )

  if (planned) {
    return (
      <div className="card h-full border-dashed p-5 opacity-80">
        {body}
        {course.notes && (
          <p className="mt-3 border-t pt-3 text-[0.775rem] leading-relaxed text-faint">
            <span className="font-medium text-muted">Scoping note: </span>
            {course.notes}
          </p>
        )}
      </div>
    )
  }

  return (
    <Link href={`/c/${course.id}`} className="card card-hover block h-full p-5">
      {body}
    </Link>
  )
}
