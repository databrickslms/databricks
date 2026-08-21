import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">404</p>
      <h1 className="mt-3 font-display text-[2.1rem] leading-tight">Nothing here</h1>
      <p className="mt-3 text-[0.9rem] text-muted">
        That page does not exist, or the course is not open yet.
      </p>
      <Link href="/" className="btn-primary mt-7">Browse courses</Link>
    </div>
  )
}
