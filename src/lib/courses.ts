// Client-safe course registry. Reads the file the content script generates, so
// this module never touches the filesystem and can be imported anywhere.

import registry from '../../content/registry.generated.json'
import site from '../../content/site.json'

export type CourseStatus = 'live' | 'draft' | 'planned'

export type TrackDef = {
  name: string
  blurb: string
  hours: string
  modules?: number[] | 'all'
}

export type Course = {
  id: string
  order?: number
  status: CourseStatus
  area?: string
  title: string
  subtitle?: string
  domain?: string
  promise?: string
  description?: string
  notes?: string
  docs?: string[]
  defaultTrack?: string
  stages?: string[]
  tracks?: Record<string, TrackDef>
  stageMap?: Record<string, number[]>
  moduleCount: number
  referenceCount: number
  questionCount: number
}

export type Area = { id: string; name: string; blurb: string }

export const SITE = site as {
  name: string
  shortName: string
  tagline: string
  description: string
  areas: Area[]
}

export const COURSES = registry as unknown as Course[]

export const getCourse = (id: string): Course | undefined =>
  COURSES.find((c) => c.id === id)

/** Courses a learner can actually open. */
export const openCourses = () => COURSES.filter((c) => c.status !== 'planned')

export const plannedCourses = () => COURSES.filter((c) => c.status === 'planned')

export const isOpen = (c: Course | undefined): c is Course =>
  !!c && c.status !== 'planned'

/** Courses grouped by capability area, in the order site.json declares them. */
export function coursesByArea() {
  return SITE.areas
    .map((area) => ({ area, courses: COURSES.filter((c) => c.area === area.id) }))
    .filter((g) => g.courses.length > 0)
}

export function trackNames(course: Course): string[] {
  return Object.keys(course.tracks ?? {})
}

export function trackDef(course: Course, track: string): TrackDef | undefined {
  return course.tracks?.[track]
}

export function trackLabel(course: Course, track: string): string {
  return course.tracks?.[track]?.name ?? track
}

/** Falls back to the first declared track so a bad stored value never breaks a page. */
export function resolveTrack(course: Course, track?: string | null): string {
  const names = trackNames(course)
  if (track && names.includes(track)) return track
  if (course.defaultTrack && names.includes(course.defaultTrack)) return course.defaultTrack
  return names[0] ?? 'default'
}

export function isValidTrack(course: Course, track: string): boolean {
  return trackNames(course).includes(track)
}
