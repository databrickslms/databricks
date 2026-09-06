'use client'

import { useEffect, useRef, useState } from 'react'

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
  const resultsRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedBest, setSavedBest] = useState<number | null>(bestScore ?? null)
  const [error, setError] = useState<string | null>(null)

  const answered = picked.filter((p) => p !== null).length
  const score = picked.reduce<number>((n, p, i) => (p === questions[i].answer ? n + 1 : n), 0)
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= 70
  const wrong = picked
    .map((p, i) => (p === questions[i].answer ? null : i + 1))
    .filter((n): n is number => n !== null)

  // Submit sits at the foot of a long card, so the score would otherwise render
  // off-screen above the reader.
  useEffect(() => {
    if (submitted) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [submitted])

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
      setSavedBest((b) => (b === null || score > b ? score : b))
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
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section ref={sectionRef} id="knowledge-check" className="mt-16 scroll-mt-24">
      <div className="card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-[1.4rem] leading-none">Knowledge check</h2>
            <p className="mt-1.5 text-[0.8rem] text-muted">
              {questions.length} questions · 70% to pass
              {typeof savedBest === 'number' && (
                <> · best so far <span className="font-medium text-ink">{savedBest}/{questions.length}</span></>
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

        {submitted && (
          <div
            ref={resultsRef}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-5 py-4 sm:px-6"
            style={{ background: passed ? 'rgb(var(--teal) / .07)' : 'rgb(var(--rose) / .06)' }}
            role="status"
          >
            <span
              className="font-display text-[2rem] leading-none tabular-nums"
              style={{ color: passed ? 'rgb(var(--teal))' : 'rgb(var(--rose))' }}
            >
              {score}/{questions.length}
            </span>
            <span className="text-[0.875rem] leading-snug">
              <span className="font-semibold">
                {pct}% — {passed ? 'passed' : 'not passed yet'}
              </span>
              <br />
              {wrong.length === 0
                ? 'Every answer correct.'
                : `Review question${wrong.length > 1 ? 's' : ''} ${wrong.join(', ')} below.`}
            </span>
          </div>
        )}

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
                  <span>
                    {question.q}
                    {submitted && (
                      <span
                        className="ml-2 whitespace-nowrap align-[0.09em] text-[0.68rem] font-semibold uppercase tracking-[0.07em]"
                        style={{
                          color:
                            choice === correct ? 'rgb(var(--teal))' : 'rgb(var(--rose))',
                        }}
                      >
                        {choice === correct ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </span>
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
                      style = {
                        borderColor: 'rgb(var(--teal))',
                        background: 'rgb(var(--teal) / .16)',
                        color: 'rgb(var(--ink))',
                      }
                    } else if (isPicked) {
                      style = {
                        borderColor: 'rgb(var(--rose))',
                        background: 'rgb(var(--rose) / .13)',
                        color: 'rgb(var(--ink))',
                      }
                    } else {
                      // Still legible: these are the options the reader is
                      // comparing against, not decoration.
                      style = { color: 'rgb(var(--muted))', borderColor: 'rgb(var(--line))' }
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
                        <span className="flex-1">{option}</span>
                        {submitted && (isRight || isPicked) && (
                          <span
                            className="mt-px shrink-0 text-[0.66rem] font-semibold uppercase tracking-[0.06em]"
                            style={{
                              color: isRight ? 'rgb(var(--teal))' : 'rgb(var(--rose))',
                            }}
                          >
                            {isRight ? 'Correct answer' : 'Your answer'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {submitted && (
                  <div
                    className="mt-3 rounded-lg px-3 py-2.5 text-[0.83rem] leading-relaxed sm:ml-7"
                    style={{ background: 'rgb(var(--ink) / .05)', color: 'rgb(var(--ink))' }}
                  >
                    <p>
                      <strong className="font-semibold" style={{ color: 'rgb(var(--teal))' }}>
                        Correct answer:{' '}
                      </strong>
                      {question.options[correct]}
                    </p>
                    <p className="mt-1.5">
                      <strong className="font-semibold">Why: </strong>
                      {question.why}
                    </p>
                  </div>
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
