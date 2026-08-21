import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb, schema } from '@/db'

const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS ?? '')
  .split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)

export const instructorEmails = (process.env.INSTRUCTOR_EMAILS ?? '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)

export const isInstructor = (email?: string | null) =>
  !!email && instructorEmails.includes(email.toLowerCase())

/**
 * Config is a function so the Drizzle adapter (and therefore the database
 * connection) is constructed per-request rather than at build time.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [Google],
  pages: { signIn: '/login' },
  callbacks: {
    signIn({ profile }) {
      if (!allowedDomains.length) return true
      const domain = profile?.email?.split('@')[1]?.toLowerCase()
      return !!domain && allowedDomains.includes(domain)
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.isInstructor = isInstructor(user.email)
      }
      return session
    },
  },
}))
