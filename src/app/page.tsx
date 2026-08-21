import Link from 'next/link'
import { auth } from '@/auth'
import { TRACKS, allModules, byStage, type Track } from '@/lib/content'
import quizzes from '../../content/quizzes.json'

export default async function Home() {
  const session = await auth().catch(() => null)
  const modules = allModules()
  const stages = byStage(modules)
  const questionCount = Object.values(quizzes as Record<string, unknown[]>)
    .reduce((n, q) => n + q.length, 0)

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grain border-b">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:py-28">
          <p className="mb-5 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
            Databricks · Financial Services
          </p>
          <h1 className="max-w-4xl font-display text-[2.6rem] leading-[1.07] tracking-[-0.02em] sm:text-[3.9rem]">
            Build a Genie Agent your business team{' '}
            <span className="text-accent">actually trusts</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
            Eighteen units, from asking a first question to running an agent in production —
            on one bank&rsquo;s data with nine flaws planted on purpose. You will be able to prove
            it&rsquo;s right, explain why it&rsquo;s slow, and know which problems were never yours to fix.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={session ? '/learn' : '/login'} className="btn-primary !px-6 !py-2.5">
              {session ? 'Continue course' : 'Start with Google'}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/reference" className="btn-ghost !px-5 !py-2.5">Course design &amp; rationale</Link>
          </div>

          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              ['18', 'units'],
              [String(questionCount), 'quiz questions'],
              ['9', 'planted data flaws'],
              ['3', 'learner tracks'],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-[2rem] leading-none">{n}</dt>
                <dd className="mt-1 text-[0.76rem] uppercase tracking-wider text-faint">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Tracks ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 py-16">
        <h2 className="font-display text-[1.9rem] tracking-tight">Three tracks, one course</h2>
        <p className="mt-2 max-w-2xl text-[0.925rem] text-muted">
          Pick a track after signing in — it filters the outline to what you need. You can switch
          any time without losing progress.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {(Object.keys(TRACKS) as Track[]).map((key) => {
            const t = TRACKS[key]
            const count = modules.filter((m) => m.tracks?.includes(key)).length
            return (
              <div key={key} className="card p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[0.95rem] font-semibold">{t.name}</h3>
                  <span className="font-mono text-[0.72rem] text-faint">{count} units</span>
                </div>
                <p className="mt-2 text-[0.855rem] leading-relaxed text-muted">{t.blurb}</p>
                <p className="mt-3 chip">{t.hours}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Outline ──────────────────────────────────────────────────────── */}
      <section className="border-t">
        <div className="mx-auto max-w-[1400px] px-5 py-16">
          <h2 className="font-display text-[1.9rem] tracking-tight">The full outline</h2>
          <div className="mt-8 space-y-10">
            {stages.map(({ stage, modules: mods }) => (
              <div key={stage} className="grid gap-5 lg:grid-cols-[13rem_1fr]">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-faint lg:pt-1">
                  {stage}
                </h3>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {mods.map((m) => (
                    <li key={m.slug}>
                      <Link href={`/learn/${m.slug}`} className="card card-hover block h-full p-4">
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

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-[0.78rem] text-faint">
          <p>
            Grounded in <code className="font-mono">docs.databricks.com</code> and the internal
            Genie Performance &amp; Issues Playbook.
          </p>
          <Link href="/reference" className="hover:text-ink">Sources &amp; maintenance →</Link>
        </div>
      </footer>
    </div>
  )
}
