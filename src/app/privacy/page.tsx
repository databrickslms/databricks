import { LegalPage } from '../legal-layout'

export const metadata = { title: 'Privacy Policy' }

const CONTACT = 'databrickslms@gmail.com'

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="21 August 2026">
      <p>
        This site is a learning platform for courses about the Databricks data platform. This
        page describes exactly what it stores about you, why, and how to have it removed. It is
        deliberately specific rather than generic — everything listed below corresponds to a real
        field in the application&rsquo;s database.
      </p>

      <h2>What we collect</h2>

      <h3>From your Google account, when you sign in</h3>
      <p>
        Signing in uses Google OAuth. We request only the <code>openid</code>, <code>email</code>{' '}
        and <code>profile</code> scopes — the minimum needed to identify you. We receive and store:
      </p>
      <ul>
        <li>your name</li>
        <li>your email address</li>
        <li>your profile picture URL</li>
        <li>an OAuth token issued by Google, used only to complete sign-in</li>
        <li>a session identifier and its expiry</li>
      </ul>
      <p>
        We never receive your Google password. We do not request access to your Gmail, Drive,
        Calendar, Contacts, or any other Google service, and we cannot read them.
      </p>

      <h3>From your use of the courses</h3>
      <ul>
        <li>which learning track you selected, per course</li>
        <li>which modules you have opened, and when you last opened each one</li>
        <li>which modules you have marked or been marked complete</li>
        <li>every knowledge-check submission: your selected answers, your score, and the timestamp</li>
      </ul>

      <h3>What we do not collect</h3>
      <ul>
        <li>No analytics, advertising, or third-party tracking scripts</li>
        <li>No cookies beyond the one session cookie required to keep you signed in</li>
        <li>No IP address logging by the application itself</li>
        <li>No payment information — the site does not take payments</li>
      </ul>

      <h2>Why we collect it</h2>
      <p>
        To let you sign in, to show your progress and resume where you left off, and to let course
        instructors see completion and knowledge-check results for the cohort they are teaching.
        That is the whole purpose. We do not profile you, and we do not use your data to train
        machine-learning models.
      </p>

      <h2>Who can see it</h2>
      <ul>
        <li><strong>You</strong> — your own progress and scores.</li>
        <li>
          <strong>Course instructors</strong> — a designated list of instructor accounts can see a
          cohort view: learner name, email, chosen track, modules completed, number of knowledge
          checks taken, and average score.
        </li>
        <li>
          <strong>Nobody else.</strong> We do not sell, rent, or share your data with third parties.
          There are no advertising or data-broker relationships.
        </li>
      </ul>

      <h2>Where it is stored</h2>
      <p>
        Course data is held in a hosted PostgreSQL database (Neon) and the application runs on
        Render. Both are used purely as infrastructure providers. Data is transmitted over HTTPS.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Progress and knowledge-check history are kept while your account exists, so that your
        record remains meaningful across a course. Sign-in sessions expire automatically. When an
        account is deleted, all associated enrolments, progress rows and knowledge-check attempts
        are deleted with it automatically — this is enforced by the database itself through
        cascading deletes, not by a manual cleanup process.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>Access or export</strong> — email us and we will send you everything stored
          against your account.
        </li>
        <li>
          <strong>Deletion</strong> — email us and we will delete your account and all associated
          progress. This is irreversible.
        </li>
        <li>
          <strong>Revoke access</strong> — you can disconnect this app at any time from your Google
          account&rsquo;s{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
            third-party access settings
          </a>
          . That stops future sign-ins; email us if you also want existing data removed.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        This is a professional training site and is not directed at children. We do not knowingly
        collect data from anyone under 16.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes materially we will update the date at the top of this page. Course
        content changes frequently; this policy should not.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, access requests or deletion requests: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>Affiliation</h2>
      <p>
        This site is an independent learning resource. It is <strong>not affiliated with,
        endorsed by, or sponsored by Databricks, Inc.</strong> &ldquo;Databricks&rdquo; and related
        product names are trademarks of their respective owners and are used here only to describe
        the subject matter of the courses.
      </p>
    </LegalPage>
  )
}
