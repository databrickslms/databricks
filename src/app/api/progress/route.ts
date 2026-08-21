import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { saveAttempt, setCompleted, setTrack } from '@/lib/progress'
import { getCourse, isOpen, isValidTrack } from '@/lib/courses'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  const userId = session.user.id

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = String(body.action ?? '')
  const courseId = String(body.courseId ?? '')
  const course = getCourse(courseId)
  if (!isOpen(course)) {
    return NextResponse.json({ error: `Unknown or unopened course: ${courseId}` }, { status: 400 })
  }

  try {
    switch (action) {
      case 'set-track': {
        const track = String(body.track ?? '')
        if (!isValidTrack(course, track)) {
          return NextResponse.json(
            { error: `"${track}" is not a track in ${course.title}` },
            { status: 400 },
          )
        }
        await setTrack(userId, courseId, track)
        return NextResponse.json({ ok: true, track })
      }

      case 'set-completed': {
        const slug = String(body.slug ?? '')
        if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
        await setCompleted(userId, courseId, slug, body.completed !== false)
        return NextResponse.json({ ok: true })
      }

      case 'submit-quiz': {
        const slug = String(body.slug ?? '')
        const answers = Array.isArray(body.answers) ? (body.answers as number[]) : null
        const score = Number(body.score)
        const total = Number(body.total)
        if (!slug || !answers || !Number.isFinite(score) || !Number.isFinite(total)) {
          return NextResponse.json({ error: 'Missing quiz fields' }, { status: 400 })
        }
        await saveAttempt(userId, courseId, slug, score, total, answers)
        return NextResponse.json({ ok: true, passed: total > 0 && score / total >= 0.7 })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('[api/progress]', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
