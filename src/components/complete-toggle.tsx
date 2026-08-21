'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function CompleteToggle({
  courseId, slug, completed,
}: { courseId: string; slug: string; completed: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-completed', courseId, slug, completed: !completed }),
      })
      startTransition(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || pending}
      className={completed ? 'btn-ghost' : 'btn-primary'}
      style={completed ? { color: 'rgb(var(--teal))', borderColor: 'rgb(var(--teal) / .45)' } : undefined}
    >
      {completed ? '✓ Completed' : 'Mark complete'}
    </button>
  )
}
