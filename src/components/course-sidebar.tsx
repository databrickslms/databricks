'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ProgressRing } from './progress-ring'
import type { ProgressMap } from '@/lib/progress'

export type NavModule = { slug: string; num: number; title: string; stage: string; duration: string }

export function CourseSidebar({
  modules,
  progress,
  trackName,
}: {
  modules: NavModule[]
  progress: ProgressMap
  trackName: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const done = modules.filter((m) => progress[m.slug]?.completed).length

  const stages: { stage: string; items: NavModule[] }[] = []
  for (const m of modules) {
    const last = stages[stages.length - 1]
    if (last && last.stage === m.stage) last.items.push(m)
    else stages.push({ stage: m.stage, items: [m] })
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost sticky top-16 z-30 mb-4 w-full lg:hidden"
        aria-expanded={open}
      >
        {open ? 'Hide' : 'Show'} course outline · {done}/{modules.length} done
      </button>

      <nav
        className={`${open ? 'block' : 'hidden'} lg:block lg:sticky lg:top-[3.9rem] lg:max-h-[calc(100vh-3.9rem)] lg:overflow-y-auto no-scrollbar lg:py-6 lg:pr-5`}
        aria-label="Course outline"
      >
        <div className="mb-5 flex items-center gap-3 rounded-xl border p-3">
          <ProgressRing value={done} total={modules.length} size={40} />
          <div className="min-w-0">
            <div className="truncate text-[0.8rem] font-medium">{trackName} track</div>
            <div className="text-[0.72rem] text-faint">
              {done} of {modules.length} modules complete
            </div>
          </div>
        </div>

        {stages.map(({ stage, items }) => (
          <div key={stage} className="mb-5">
            <h3 className="mb-1.5 px-2 text-[0.66rem] font-semibold uppercase tracking-[0.09em] text-faint">
              {stage}
            </h3>
            <ul className="space-y-px">
              {items.map((m) => {
                const active = pathname === `/learn/${m.slug}`
                const p = progress[m.slug]
                return (
                  <li key={m.slug}>
                    <Link
                      href={`/learn/${m.slug}`}
                      onClick={() => setOpen(false)}
                      className={`group flex items-start gap-2.5 rounded-lg px-2 py-[0.42rem] text-[0.815rem] leading-snug transition-colors ${
                        active ? 'bg-accent-soft font-medium text-ink' : 'text-muted hover:bg-ink/[0.035] hover:text-ink'
                      }`}
                    >
                      <StatusDot completed={!!p?.completed} started={!!p} active={active} />
                      <span className="min-w-0">
                        <span className="font-mono text-[0.68rem] text-faint">
                          {String(m.num).padStart(2, '0')}
                        </span>{' '}
                        {m.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )
}

function StatusDot({
  completed, started, active,
}: { completed: boolean; started: boolean; active: boolean }) {
  if (completed) {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" className="mt-[0.18rem] shrink-0" aria-label="Complete">
        <circle cx="8" cy="8" r="7" fill="rgb(var(--teal) / .16)" />
        <path d="M4.8 8.2l2 2 4.4-4.4" fill="none" stroke="rgb(var(--teal))" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <span
      className="mt-[0.42rem] h-[6px] w-[6px] shrink-0 rounded-full border"
      style={{
        borderColor: active || started ? 'rgb(var(--accent))' : 'rgb(var(--line))',
        background: active ? 'rgb(var(--accent))' : 'transparent',
      }}
      aria-hidden
    />
  )
}
