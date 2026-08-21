import 'server-only'
import type { Session } from 'next-auth'
import { auth } from '@/auth'
import { isPreview, previewSession } from './preview'

/**
 * The single place pages ask "who is signed in?". Returns a stand-in user in
 * local preview mode, otherwise delegates to Auth.js.
 *
 * The explicit return type matters: NextAuth v5's `auth` is overloaded (it also
 * works as a route wrapper), so its inferred return is a union that pages
 * cannot destructure.
 *
 * Never throws — a missing database or misconfigured OAuth client resolves to
 * "signed out" rather than crashing the page.
 */
export async function getSession(): Promise<Session | null> {
  if (isPreview()) return previewSession() as unknown as Session
  try {
    return (await auth()) as Session | null
  } catch {
    return null
  }
}
