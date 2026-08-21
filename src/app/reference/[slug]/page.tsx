import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allReferences, getDoc } from '@/lib/content'

export function generateStaticParams() {
  return allReferences().map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = getDoc(slug)
  return { title: doc?.title ?? 'Reference' }
}

export default async function ReferencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc || doc.kind !== 'reference') notFound()

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link href="/reference" className="text-[0.8rem] text-muted transition-colors hover:text-ink">
        ← Reference
      </Link>
      <header className="mt-5 border-b pb-6">
        <div className="font-mono text-[0.7rem] uppercase tracking-wider text-accent">{doc.part}</div>
        <h1 className="mt-2 font-display text-[2.2rem] leading-tight tracking-[-0.015em]">{doc.title}</h1>
      </header>
      <div className="prose-course mt-8" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  )
}
