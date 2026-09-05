import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { TrackPicker } from '@/components/track-picker'
import { ProgressRing } from '@/components/progress-ring'
import { getCourse, isOpen, trackLabel, trackNames } from '@/lib/courses'
import { byStage, modulesForTrack } from '@/lib/content'
import { getProgress, getTrack } from '@/lib/progress'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params
  return { title: getCourse(course)?.title ?? 'Course' }
}

export default async function LearnHome({ params }: { params: Promise<{ course: string }> }) {
  const { course: id } = await params
  const course = getCourse(id)
  if (!isOpen(course)) notFound()

  const session = await getSession()
  if (!session?.user?.id) redirect(`/login?next=/c/${id}/learn`)

  const track = await getTrack(session.user.id, id)
  const progress = await getProgress(session.user.id, id)
  const modules = modulesForTrack(id, track)
  const done = modules.filter((m) => progress[m.slug]?.completed).length
  const next = modules.find((m) => !progress[m.slug]?.completed) ?? modules[0]

  const scored = modules
    .map((m) => progress[m.slug])
    .filter((p): p is NonNullable<typeof p> => !!p && p.bestScore !== null && p.total !== null)
  const avg = scored.length
    ? Math.round((scored.reduce((n, p) => n + p.bestScore! / p.total!, 0) / scored.length) * 100)
    : null

  return (
    <div className="max-w-4xl">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-accent">
            {course.title} · {trackLabel(course, track)} track
          </p>
          <h1 className="mt-2 font-display text-[2.2rem] leading-tight tracking-tight">
            Welcome back{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}.
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <ProgressRing value={done} total={modules.length} size={52} />
            <div className="text-[0.78rem] leading-tight">
              <div className="font-medium">{done}/{modules.length}</div>
              <div className="text-faint">complete</div>
            </div>
          </div>
          {avg !== null && (
            <div className="text-[0.78rem] leading-tight">
              <div className="font-display text-[1.5rem] leading-none">{avg}%</div>
              <div className="mt-1 text-faint">avg score</div>
            </div>
          )}
        </div>
      </header>

      {next && (
        <Link href={`/c/${id}/learn/${next.slug}`} className="card card-hover mt-8 block p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-faint">
            {done === 0 ? 'Start here' : done === modules.length ? 'Revisit' : 'Up next'}
          </p>
          <p className="mt-2 flex items-baseline gap-2.5 font-display text-[1.45rem] leading-tight">
            <span className="font-mono text-[0.85rem] text-accent">
              {String(next.num).padStart(2, '0')}
            </span>
            {next.title}
          </p>
          <p className="mt-2 line-clamp-2 text-[0.865rem] leading-relaxed text-muted">{next.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {next.duration && <span className="chip">{next.duration}</span>}
            {next.level && <span className="chip">{next.level}</span>}
          </div>
        </Link>
      )}

      {trackNames(course).length > 1 && (
        <section className="mt-12">
          <h2 className="font-display text-[1.5rem] tracking-tight">Your track</h2>
          <p className="mt-1.5 text-[0.875rem] text-muted">
            Switching filters the outline. Progress is kept for every module either way.
          </p>
          <div className="mt-4">
            <TrackPicker courseId={id} tracks={course.tracks!} current={track} />
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-[1.5rem] tracking-tight">All modules</h2>
        <div className="mt-5 space-y-8">
          {byStage(course, modules).map(({ stage, modules: mods }) => (
            <div key={stage}>
              <h3 className="mb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-faint">
                {stage}
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {mods.map((m) => {
                  const p = progress[m.slug]
                  return (
                    <li key={m.slug}>
                      <Link
                        href={`/c/${id}/learn/${m.slug}`}
                        className="card card-hover flex h-full items-start gap-3 p-3.5"
                      >
                        <span className="mt-px font-mono text-[0.72rem] text-accent">
                          {String(m.num).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.865rem] font-medium leading-snug">{m.title}</span>
                          <span className="mt-1.5 line-clamp-2 block text-[0.775rem] leading-snug text-muted">
                            {m.summary}
                          </span>
                          <span className="mt-1.5 block text-[0.72rem] text-faint">
                            {m.duration}
                            {p?.bestScore !== null && p?.total ? ` · best ${p.bestScore}/${p.total}` : ''}
                          </span>
                        </span>
                        {p?.completed && (
                          <svg width="15" height="15" viewBox="0 0 16 16" className="mt-0.5 shrink-0">
                            <circle cx="8" cy="8" r="7" fill="rgb(var(--teal) / .16)" />
                            <path d="M4.8 8.2l2 2 4.4-4.4" fill="none" stroke="rgb(var(--teal))" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
