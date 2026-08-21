import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { CourseSidebar } from '@/components/course-sidebar'
import { getCourse, isOpen, trackLabel } from '@/lib/courses'
import { modulesForTrack } from '@/lib/content'
import { getProgress, getTrack } from '@/lib/progress'

export const dynamic = 'force-dynamic'

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ course: string }>
}) {
  const { course: id } = await params
  const course = getCourse(id)
  if (!isOpen(course)) notFound()

  const session = await getSession()
  if (!session?.user?.id) redirect(`/login?next=/c/${id}/learn`)

  const track = await getTrack(session.user.id, id)
  const progress = await getProgress(session.user.id, id)
  const modules = modulesForTrack(id, track).map((m) => ({
    slug: m.slug,
    num: m.num!,
    title: m.title,
    stage: m.stage!,
    duration: m.duration ?? '',
  }))

  return (
    <div className="mx-auto max-w-[1400px] px-5">
      <div className="lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-8">
        <CourseSidebar
          courseId={id}
          courseTitle={course.title}
          modules={modules}
          progress={progress}
          trackName={trackLabel(course, track)}
        />
        <div className="min-w-0 py-8">{children}</div>
      </div>
    </div>
  )
}
