'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { ThemeToggle } from './theme-toggle'
import { SITE, openCourses } from '@/lib/courses'

export function SiteHeader({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const user = session?.user
  const courses = openCourses()
  // With a single course, link straight into it rather than via the catalog.
  const nav = [
    { href: '/', label: 'Courses' },
    ...(courses.length === 1
      ? [{ href: `/c/${courses[0].id}/learn`, label: courses[0].title }]
      : []),
    ...(user?.isInstructor ? [{ href: '/instructor', label: 'Cohort' }] : []),
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-[1.06rem] leading-none tracking-tight">
            {SITE.shortName}<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((n) => {
            const active =
              n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3 py-1.5 text-[0.82rem] font-medium transition-colors ${
                  active ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-[0.78rem] font-medium">{user.name?.split(' ')[0]}</div>
                {user.isInstructor && (
                  <div className="text-[0.66rem] uppercase tracking-wider text-accent">Instructor</div>
                )}
              </div>
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={30}
                  height={30}
                  className="rounded-full ring-1 ring-line"
                />
              ) : (
                <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-accent-soft text-[0.7rem] font-semibold text-accent">
                  {user.name?.[0] ?? '?'}
                </div>
              )}
              {user.email !== 'preview@localhost' && (
                <button
                  onClick={() => signOut({ redirectTo: '/' })}
                  className="text-[0.78rem] text-faint transition-colors hover:text-ink"
                >
                  Sign out
                </button>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary !py-1.5 !text-[0.82rem]">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="gm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent))" />
          <stop offset="100%" stopColor="rgb(var(--amber))" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 29 9.2v13.6L16 29.5 3 22.8V9.2Z"
        fill="none"
        stroke="url(#gm)"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.4" fill="url(#gm)" />
    </svg>
  )
}
