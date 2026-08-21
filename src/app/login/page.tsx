import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { getSession } from '@/lib/session'
import { openCourses } from '@/lib/courses'

export const metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const session = await getSession()
  const home = openCourses()[0] ? `/c/${openCourses()[0].id}/learn` : '/'
  if (session?.user) redirect(next ?? home)

  return (
    <div className="grain flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-16">
      <div className="card w-full max-w-[26rem] p-8">
        <h1 className="font-display text-[1.8rem] leading-tight tracking-tight">Sign in</h1>
        <p className="mt-2.5 text-[0.885rem] leading-relaxed text-muted">
          Your progress, knowledge-check scores and chosen track are saved to your Google account.
        </p>

        {error && (
          <p
            className="mt-5 rounded-lg px-3 py-2.5 text-[0.82rem]"
            style={{ background: 'rgb(var(--rose) / .1)', color: 'rgb(var(--rose))' }}
          >
            {error === 'AccessDenied'
              ? 'That account is not permitted. Check ALLOWED_EMAIL_DOMAINS.'
              : `Sign-in failed (${error}). Check the Google OAuth redirect URI and AUTH_URL.`}
          </p>
        )}

        <form
          className="mt-7"
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: next ?? home })
          }}
        >
          <button type="submit" className="btn-ghost w-full !py-2.5 !text-[0.9rem] font-medium">
            <GoogleMark />
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-[0.75rem] leading-relaxed text-faint">
          We store only your name, email and avatar from Google, plus your course progress.
        </p>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.8 2.6 13.6l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.3h12.5c-.3 2.1-1.6 5.2-4.6 7.3l7.7 6c4.5-4.2 6.5-10.2 6.5-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.3A14.4 14.4 0 0 1 9.7 24c0-1.5.3-2.9.7-4.3l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.4l7.9-6.1z" />
      <path fill="#34A853" d="M24 47.5c6.5 0 11.9-2.1 15.6-5.8l-7.7-6c-2.1 1.4-4.8 2.4-7.9 2.4-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.5 42.2 14.6 47.5 24 47.5z" />
    </svg>
  )
}
