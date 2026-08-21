import { redirect } from 'next/navigation'
import { openCourses } from '@/lib/courses'

export default function LegacyReferenceRedirect() {
  const first = openCourses()[0]
  redirect(first ? `/c/${first.id}/reference` : '/')
}
