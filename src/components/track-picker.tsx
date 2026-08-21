'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TRACKS, type Track } from '@/lib/tracks'

export function TrackPicker({ current }: { current: Track }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saving, setSaving] = useState<Track | null>(null)

  async function choose(track: Track) {
    if (track === current) return
    setSaving(track)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-track', track }),
      })
      startTransition(() => router.refresh())
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(Object.keys(TRACKS) as Track[]).map((key) => {
        const t = TRACKS[key]
        const active = key === current
        return (
          <button
            key={key}
            onClick={() => choose(key)}
            disabled={pending || saving !== null}
            className={`card card-hover p-4 text-left disabled:opacity-70 ${
              active ? '!border-accent' : ''
            }`}
            style={active ? { background: 'rgb(var(--accent-soft) / .5)' } : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.875rem] font-semibold">{t.name}</span>
              {active ? (
                <span className="chip !border-accent/50 !text-accent">Current</span>
              ) : saving === key ? (
                <span className="text-[0.7rem] text-faint">Saving…</span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[0.79rem] leading-snug text-muted">{t.blurb}</p>
            <p className="mt-2 font-mono text-[0.7rem] text-faint">{t.hours}</p>
          </button>
        )
      })}
    </div>
  )
}
