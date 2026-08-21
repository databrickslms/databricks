'use client'

import { useEffect, useState } from 'react'

type Mode = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setMode(saved === 'dark' || saved === 'light' ? saved : 'system')
  }, [])

  function apply(next: Mode) {
    setMode(next)
    if (next === 'system') {
      localStorage.removeItem('theme')
      document.documentElement.removeAttribute('data-theme')
    } else {
      localStorage.setItem('theme', next)
      document.documentElement.setAttribute('data-theme', next)
    }
  }

  const cycle = () => apply(mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system')
  const label = mode === 'system' ? 'System theme' : mode === 'light' ? 'Light theme' : 'Dark theme'

  return (
    <button
      onClick={cycle}
      title={`${label} — click to change`}
      aria-label={`${label}. Click to change theme.`}
      className="grid h-9 w-9 place-items-center rounded-full border text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
    >
      {mode === 'system' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        </svg>
      ) : mode === 'light' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  )
}
