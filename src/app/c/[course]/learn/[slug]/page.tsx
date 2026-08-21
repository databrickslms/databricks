import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Quiz, type Question } from '@/components/quiz'
import { CompleteToggle } from '@/components/complete-toggle'
import { getCourse, isOpen } from '@/lib/courses'
import { allModules, getDoc, modulesForTrack } from '@/lib/content'
import { loadQuiz } from '@/lib/quizzes'
import { getProgress, getTrack, markViewed } from '@/lib/progress'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; slug: string }>
}) {
  const { course, slug } = await params
  const doc = getDoc(course, slug)
  return { title: doc ? `${String(doc.num).padStart(2, '0')} · ${doc.title}` : 'Module' }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ course: string; slug: string }>
}) {
  const { course: id, slug } = await params
  const course = getCourse(id)
  if (!isOpen(course)) notFound()

  const session = await auth()
  if (!session?.user?.id) redirect(`/login?next=/c/${id}/learn/${slug}`)

  const doc = getDoc(id, slug)
  if (!doc || doc.kind !== 'module') notFound()

  await markViewed(session.user.id, id, slug).catch(() => {})

  const track = await getTrack(session.user.id, id)
  const progress = await getProgress(session.user.id, id)
  const inTrack = modulesForTrack(id, track)
  // Navigate within the track if this module belongs to it, otherwise across all modules.
  const seq = inTrack.some((m) => m.slug === slug) ? inTrack : allModules(id)
  const idx = seq.findIndex((m) => m.slug === slug)
  const prev = idx > 0 ? seq[idx - 1] : null
  const next = idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : null

  const questions: Question[] = loadQuiz(id, doc.num!)
  const p = progress[slug]

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-10">
      <article className="min-w-0">
        <header className="mb-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip !border-accent/40 !text-accent">{doc.stage}</span>
            {doc.level && <span className="chip">{doc.level}</span>}
            {doc.duration && <span className="chip">{doc.duration}</span>}
            <span className="chip">{doc.readingMinutes} min read</span>
          </div>

          <h1 className="mt-4 flex items-baseline gap-3 font-display text-[2.15rem] leading-[1.12] tracking-[-0.015em] sm:text-[2.55rem]">
            <span className="font-mono text-[1.05rem] text-accent">
              {String(doc.num).padStart(2, '0')}
            </span>
            {doc.title}
          </h1>

          {doc.audience && (
            <p className="mt-3 text-[0.83rem] text-faint">Audience: {doc.audience}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-b pb-6">
            <CompleteToggle courseId={id} slug={slug} completed={!!p?.completed} />
            {questions.length > 0 && (
              <a href="#knowledge-check" className="btn-ghost">
                Knowledge check
                <span className="font-mono text-[0.72rem] text-faint">{questions.length}</span>
              </a>
            )}
            {p?.bestScore !== null && p?.total ? (
              <span className="text-[0.78rem] text-faint">
                Best score {p.bestScore}/{p.total}
              </span>
            ) : null}
          </div>
        </header>

        <div className="prose-course" dangerouslySetInnerHTML={{ __html: doc.html }} />

        {questions.length > 0 && (
          <Quiz
            courseId={id}
            slug={slug}
            questions={questions}
            signedIn
            bestScore={p?.bestScore ?? null}
          />
        )}

        <nav className="mt-14 grid gap-3 border-t pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/c/${id}/learn/${prev.slug}`} className="card card-hover p-4">
              <div className="text-[0.68rem] uppercase tracking-wider text-faint">Previous</div>
              <div className="mt-1.5 text-[0.875rem] font-medium leading-snug">
                <span className="font-mono text-[0.72rem] text-faint">
                  {String(prev.num).padStart(2, '0')}
                </span>{' '}
                {prev.title}
              </div>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/c/${id}/learn/${next.slug}`} className="card card-hover p-4 sm:text-right">
              <div className="text-[0.68rem] uppercase tracking-wider text-faint">Next</div>
              <div className="mt-1.5 text-[0.875rem] font-medium leading-snug">
                <span className="font-mono text-[0.72rem] text-faint">
                  {String(next.num).padStart(2, '0')}
                </span>{' '}
                {next.title}
              </div>
            </Link>
          )}
        </nav>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-[4.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar py-1">
          <h2 className="mb-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.09em] text-faint">
            On this page
          </h2>
          <ul className="space-y-1 border-l">
            {doc.headings.filter((h) => h.depth === 2).map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-[0.775rem] leading-snug text-muted transition-colors hover:border-accent hover:text-ink"
                >
                  {h.text}
                </a>
              </li>
            ))}
            {questions.length > 0 && (
              <li>
                <a
                  href="#knowledge-check"
                  className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-[0.775rem] font-medium leading-snug text-accent"
                >
                  Knowledge check
                </a>
              </li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  )
}
