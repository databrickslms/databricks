'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type Question = { q: string; options: string[]; answer: number; why: string }

export function Quiz({
  courseId,
  slug,
  questions,
  signedIn,
  bestScore,
}: {
  courseId: string
  slug: string
  questions: Question[]
  signedIn: boolean
  bestScore?: number | null
}) {
  const router = useRouter()
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const answered = picked.filter((p) => p !== null).length
  const score = picked.reduce<number>((n, p, i) => (p === questions[i].answer ? n + 1 : n), 0)
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= 70

  async function submit() {
    setSubmitted(true)
    setError(null)
    if (!signedIn) return
    setSaving(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-quiz',
          courseId,
          slug,
          answers: picked.map((p) => p ?? -1),
          score,
          total: questions.length,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Could not save your score')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your score')
    } finally {
      setSaving(false)
    }
  }

  function retry() {
    setPicked(questions.map(() => null))
    setSubmitted(false)
    setError(null)
    window.scrollTo({ top: window.scrollY - 40, behavior: 'smooth' })
  }

  return (
    <section id="knowledge-check" className="mt-16 scroll-mt-24">
      <div className="card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-[1.4rem] leading-none">Knowledge check</h2>
            <p className="mt-1.5 text-[0.8rem] text-muted">
              {questions.length} questions · 70% to pass
              {typeof bestScore === 'number' && (
                <> · best so far <span className="font-medium text-ink">{bestScore}/{questions.length}</span></>
              )}
            </p>
          </div>
          {!submitted && (
            <span className="chip font-mono tabular-nums">{answered}/{questions.length}</span>
          )}
          {submitted && (
            <span
              className="chip !px-3 !py-1.5 !text-[0.78rem] font-semibold"
              style={{
                color: passed ? 'rgb(var(--teal))' : 'rgb(var(--rose))',
                borderColor: passed ? 'rgb(var(--teal) / .4)' : 'rgb(var(--rose) / .4)',
              }}
            >
              {score}/{questions.length} — {pct}% {passed ? 'passed' : 'not yet'}
            </span>
          )}
        </header>

        <ol className="divide-y">
          {questions.map((question, qi) => {
            const choice = picked[qi]
            const correct = question.answer
            return (
              <li key={qi} className="px-5 py-5 sm:px-6">
                <p className="mb-3.5 flex gap-2.5 text-[0.925rem] font-medium leading-snug">
                  <span className="mt-px font-mono text-[0.72rem] text-faint">
                    {String(qi + 1).padStart(2, '0')}
                  </span>
                  <span>{question.q}</span>
                </p>

                <div className="grid gap-1.5 sm:pl-7">
                  {question.options.map((option, oi) => {
                    const isPicked = choice === oi
                    const isRight = oi === correct
                    let cls =
                      'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[0.865rem] leading-snug transition-colors'
                    let style: React.CSSProperties = {}

                    if (!submitted) {
                      cls += isPicked
                        ? ' border-accent bg-accent-soft/60'
                        : ' hover:bg-ink/[0.035]'
                    } else if (isRight) {
                      cls += ' font-medium'
                      style = { borderColor: 'rgb(var(--teal))', background: 'rgb(var(--teal) / .09)' }
                    } else if (isPicked) {
                      style = { borderColor: 'rgb(var(--rose))', background: 'rgb(var(--rose) / .07)' }
                    } else {
                      cls += ' opacity-55'
                    }

                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setPicked((prev) => prev.map((v, i) => (i === qi ? oi : v)))
                        }
                        className={cls}
                        style={style}
                        aria-pressed={isPicked}
                      >
                        <span className="mt-[0.15rem] grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.6rem]">
                          {submitted && isRight ? '✓' : submitted && isPicked ? '✕' : isPicked ? '●' : ''}
                        </span>
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>

                {submitted && (
                  <p
                    className="mt-3 rounded-lg px-3 py-2.5 text-[0.83rem] leading-relaxed sm:ml-7"
                    style={{ background: 'rgb(var(--ink) / .04)', color: 'rgb(var(--muted))' }}
                  >
                    <strong className="font-semibold text-ink">Why: </strong>
                    {question.why}
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        <footer className="flex flex-wrap items-center gap-3 border-t px-5 py-4 sm:px-6">
          {!submitted ? (
            <>
              <button
                className="btn-primary"
                disabled={answered < questions.length}
                onClick={submit}
              >
                {answered < questions.length
                  ? `Answer ${questions.length - answered} more`
                  : 'Submit answers'}
              </button>
              {!signedIn && (
                <span className="text-[0.78rem] text-faint">
                  Sign in to save your score and progress.
                </span>
              )}
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={retry}>Try again</button>
              {saving && <span className="text-[0.78rem] text-faint">Saving…</span>}
              {!saving && signedIn && !error && (
                <span className="text-[0.78rem]" style={{ color: 'rgb(var(--teal))' }}>
                  {passed ? 'Saved — module marked complete.' : 'Score saved.'}
                </span>
              )}
              {error && (
                <span className="text-[0.78rem]" style={{ color: 'rgb(var(--rose))' }}>{error}</span>
              )}
            </>
          )}
        </footer>
      </div>
    </section>
  )
}
