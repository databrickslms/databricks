import { LegalPage } from '../legal-layout'

export const metadata = { title: 'Terms of Service' }

const CONTACT = 'databrickslms@gmail.com'

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="21 August 2026">
      <p>
        By using this site you agree to these terms. They are short on purpose.
      </p>

      <h2>What this site is</h2>
      <p>
        An educational platform hosting courses about the Databricks data platform. Access is
        provided free of charge for learning purposes.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>
          You sign in with a Google account. You are responsible for keeping access to that account
          secure.
        </li>
        <li>
          Access may be limited to specific people or email domains at the operator&rsquo;s
          discretion.
        </li>
        <li>
          Do not attempt to access another learner&rsquo;s data, or to circumvent the access
          controls on instructor views.
        </li>
      </ul>

      <h2>Course content</h2>
      <p>
        Course material is provided for education and is offered <strong>as is</strong>. It
        describes third-party software that changes frequently: specifications, limits, pricing and
        product behaviour cited in the material may be out of date at the time you read it. Always
        verify against the official vendor documentation before relying on anything here for
        production work.
      </p>
      <p>
        Nothing here is professional, legal, financial or architectural advice. Example datasets and
        scenarios in the courses are fictional and contain deliberate flaws for teaching purposes —
        they are not reference implementations and should not be copied into production systems.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attempt to disrupt, overload, or gain unauthorised access to the service.</li>
        <li>Do not scrape or bulk-download course content for redistribution.</li>
        <li>Do not upload or submit unlawful content.</li>
      </ul>

      <h2>Availability</h2>
      <p>
        The service is provided without any uptime guarantee. It runs on infrastructure that may
        sleep when idle, so a first request after a period of inactivity can be slow. Courses,
        content and access may be changed, suspended or withdrawn at any time without notice.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Course material on this site belongs to its authors. &ldquo;Databricks&rdquo; and other
        product names referenced in the courses are trademarks of their respective owners.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, the operator is not liable for any loss or damage
        arising from use of this site or reliance on its content.
      </p>

      <h2>Affiliation</h2>
      <p>
        This site is an independent learning resource. It is <strong>not affiliated with, endorsed
        by, or sponsored by Databricks, Inc.</strong>
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  )
}
