import { redirect } from 'next/navigation'
import { openCourses } from '@/lib/courses'

// Kept so links written before the site became multi-course still resolve.
export default function LegacyLearnRedirect() {
  const first = openCourses()[0]
  redirect(first ? `/c/${first.id}/learn` : '/')
}
