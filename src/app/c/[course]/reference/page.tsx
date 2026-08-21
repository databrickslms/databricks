import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCourse, isOpen } from '@/lib/courses'
import { allReferences } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params
  return { title: `Reference · ${getCourse(course)?.title ?? ''}` }
}

export default async function ReferenceIndex({ params }: { params: Promise<{ course: string }> }) {
  const { course: id } = await params
  const course = getCourse(id)
  if (!isOpen(course)) notFound()

  const refs = allReferences(id)
  if (!refs.length) notFound()

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link href={`/c/${id}/learn`} className="text-[0.8rem] text-muted transition-colors hover:text-ink">
        ← {course.title}
      </Link>
      <h1 className="mt-5 font-display text-[2.3rem] leading-tight tracking-tight">Reference</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
        The course design itself — audience and tracks, the assets to produce, how to keep the
        material current, and every source.
      </p>
      <ul className="mt-9 grid gap-3">
        {refs.map((r) => (
          <li key={r.slug}>
            <Link href={`/c/${id}/reference/${r.slug}`} className="card card-hover block p-5">
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
