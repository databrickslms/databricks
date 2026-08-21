import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CourseSidebar } from '@/components/course-sidebar'
import { TRACKS, modulesForTrack } from '@/lib/content'
import { getProgress, getTrack } from '@/lib/progress'

export const dynamic = 'force-dynamic'

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?next=/learn')

  const track = await getTrack(session.user.id)
  const progress = await getProgress(session.user.id)
  const modules = modulesForTrack(track).map((m) => ({
    slug: m.slug,
    num: m.num!,
    title: m.title,
    stage: m.stage!,
    duration: m.duration ?? '',
  }))

  return (
    <div className="mx-auto max-w-[1400px] px-5">
      <div className="lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-8">
        <CourseSidebar modules={modules} progress={progress} trackName={TRACKS[track].name} />
        <div className="min-w-0 py-8">{children}</div>
      </div>
    </div>
  )
}
