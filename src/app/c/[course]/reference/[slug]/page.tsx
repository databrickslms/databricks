import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCourse, isOpen, openCourses } from '@/lib/courses'
import { allReferences, getDoc } from '@/lib/content'

export function generateStaticParams() {
  return openCourses().flatMap((c) =>
    allReferences(c.id).map((r) => ({ course: c.id, slug: r.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; slug: string }>
}) {
  const { course, slug } = await params
  return { title: getDoc(course, slug)?.title ?? 'Reference' }
}

export default async function ReferencePage({
  params,
}: {
  params: Promise<{ course: string; slug: string }>
}) {
  const { course: id, slug } = await params
  const course = getCourse(id)
  if (!isOpen(course)) notFound()

  const doc = getDoc(id, slug)
  if (!doc || doc.kind !== 'reference') notFound()

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href={`/c/${id}/reference`}
        className="text-[0.8rem] text-muted transition-colors hover:text-ink"
      >
        ← Reference
      </Link>
      <header className="mt-5 border-b pb-6">
        <div className="font-mono text-[0.7rem] uppercase tracking-wider text-accent">{doc.part}</div>
        <h1 className="mt-2 font-display text-[2.2rem] leading-tight tracking-[-0.015em]">{doc.title}</h1>
      </header>
      <div className="prose-course mt-8" dangerouslySetInnerHTML={{ __html: doc.html }} />
        {doc.appendixHtml && (
          <div
            className="prose-course"
            dangerouslySetInnerHTML={{ __html: doc.appendixHtml }}
          />
        )}
    </div>
  )
}
