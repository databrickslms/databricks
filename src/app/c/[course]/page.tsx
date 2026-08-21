import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getCourse, isOpen, trackNames } from '@/lib/courses'
import { allModules, byStage } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params
  return { title: getCourse(course)?.title ?? 'Course' }
}

export default async function CourseHome({ params }: { params: Promise<{ course: string }> }) {
  const { course: id } = await params
  const course = getCourse(id)
  if (!isOpen(course)) notFound()

  const session = await auth().catch(() => null)
  if (session?.user) redirect(`/c/${id}/learn`)

  const modules = allModules(id)
  const stages = byStage(course, modules)

  return (
    <div>
      <section className="grain border-b">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:py-24">
          <Link href="/" className="text-[0.8rem] text-muted transition-colors hover:text-ink">
            ← All courses
          </Link>
          <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
            {course.domain ? `Databricks · ${course.domain}` : 'Databricks'}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[2.4rem] leading-[1.08] tracking-[-0.02em] sm:text-[3.4rem]">
            {course.promise ?? course.title}
          </h1>
          {course.description && (
            <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
              {course.description}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={`/login?next=/c/${id}/learn`} className="btn-primary !px-6 !py-2.5">
              Start with Google
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" />
              </svg>
            </Link>
            {course.referenceCount > 0 && (
              <Link href={`/c/${id}/reference`} className="btn-ghost !px-5 !py-2.5">
                Course design &amp; rationale
              </Link>
            )}
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              [String(course.moduleCount), 'units'],
              [String(course.questionCount), 'quiz questions'],
              [String(trackNames(course).length), 'learner tracks'],
              [String(stages.length), 'stages'],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-[2rem] leading-none">{n}</dt>
                <dd className="mt-1 text-[0.76rem] uppercase tracking-wider text-faint">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {trackNames(course).length > 1 && (
        <section className="mx-auto max-w-[1400px] px-5 py-14">
          <h2 className="font-display text-[1.8rem] tracking-tight">
            {trackNames(course).length} tracks, one course
          </h2>
          <p className="mt-2 max-w-2xl text-[0.925rem] text-muted">
            Pick a track after signing in — it filters the outline to what you need. Switching
            never loses progress.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {trackNames(course).map((key) => {
              const t = course.tracks![key]
              const count = modules.filter((m) => m.tracks?.includes(key)).length
              return (
                <div key={key} className="card p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[0.95rem] font-semibold">{t.name}</h3>
                    <span className="font-mono text-[0.72rem] text-faint">{count} units</span>
                  </div>
                  <p className="mt-2 text-[0.855rem] leading-relaxed text-muted">{t.blurb}</p>
                  <p className="chip mt-3">{t.hours}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="border-t">
        <div className="mx-auto max-w-[1400px] px-5 py-14">
          <h2 className="font-display text-[1.8rem] tracking-tight">The full outline</h2>
          <div className="mt-8 space-y-10">
            {stages.map(({ stage, modules: mods }) => (
              <div key={stage} className="grid gap-5 lg:grid-cols-[13rem_1fr]">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-faint lg:pt-1">
                  {stage}
                </h3>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {mods.map((m) => (
                    <li key={m.slug}>
                      <Link href={`/c/${id}/learn/${m.slug}`} className="card card-hover block h-full p-4">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-px font-mono text-[0.72rem] text-accent">
                            {String(m.num).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[0.885rem] font-medium leading-snug">{m.title}</div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[0.7rem] text-faint">
                              {m.duration && <span>{m.duration}</span>}
                              {m.level && <span>· {m.level}</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
