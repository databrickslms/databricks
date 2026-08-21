import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { saveAttempt, setCompleted, setTrack } from '@/lib/progress'
import { TRACKS, type Track } from '@/lib/tracks'

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

  try {
    switch (action) {
      case 'set-track': {
        const track = String(body.track ?? '')
        if (!(track in TRACKS)) {
          return NextResponse.json({ error: 'Unknown track' }, { status: 400 })
        }
        await setTrack(userId, track as Track)
        return NextResponse.json({ ok: true, track })
      }

      case 'set-completed': {
        const slug = String(body.slug ?? '')
        if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
        await setCompleted(userId, slug, body.completed !== false)
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
        await saveAttempt(userId, slug, score, total, answers)
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
