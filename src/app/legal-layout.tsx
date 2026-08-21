import Link from 'next/link'
import { SITE } from '@/lib/courses'

/** Shared shell for the privacy and terms pages. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link href="/" className="text-[0.8rem] text-muted transition-colors hover:text-ink">
        ← {SITE.name}
      </Link>
      <header className="mt-5 border-b pb-6">
        <h1 className="font-display text-[2.2rem] leading-tight tracking-[-0.015em]">{title}</h1>
        <p className="mt-2 text-[0.8rem] text-faint">Last updated {updated}</p>
      </header>
      <div className="prose-course mt-8">{children}</div>
      <footer className="mt-14 border-t pt-6 text-[0.8rem] text-faint">
        <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-ink">Terms</Link>
        <span className="mx-2">·</span>
        <Link href="/" className="hover:text-ink">Courses</Link>
      </footer>
    </div>
  )
}
