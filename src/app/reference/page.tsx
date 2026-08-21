import Link from 'next/link'
import { allReferences } from '@/lib/content'

export const metadata = { title: 'Reference' }

export default function ReferenceIndex() {
  const refs = allReferences()
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-[2.3rem] leading-tight tracking-tight">Reference</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
        The course design itself — audience and tracks, the assets to produce, how to keep the
        material current, the mapping back to the internal performance playbook, and every source.
      </p>
      <ul className="mt-9 grid gap-3">
        {refs.map((r) => (
          <li key={r.slug}>
            <Link href={`/reference/${r.slug}`} className="card card-hover block p-5">
              <div className="font-mono text-[0.7rem] uppercase tracking-wider text-accent">{r.part}</div>
              <div className="mt-1.5 font-display text-[1.3rem] leading-tight">{r.title}</div>
              <p className="mt-2 line-clamp-2 text-[0.855rem] leading-relaxed text-muted">{r.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
