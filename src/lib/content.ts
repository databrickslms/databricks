import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/common'

import { getCourse, resolveTrack, trackNames, type Course } from './courses'

export type Heading = { id: string; text: string; depth: number }

export type Doc = {
  course: string
  kind: 'module' | 'reference'
  slug: string
  title: string
  summary: string
  html: string
  headings: Heading[]
  readingMinutes: number
  // modules only
  num?: number
  stage?: string
  tracks?: string[]
  level?: string
  duration?: string
  audience?: string
  // reference only
  part?: string
}

const contentDir = (courseId: string) =>
  join(process.cwd(), 'content', 'courses', courseId, 'modules')

const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(code, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : undefined
    const out = language
      ? hljs.highlight(code, { language, ignoreIllegals: true }).value
      : md.utils.escapeHtml(code)
    return `<pre class="hljs"><code${language ? ` class="language-${language}"` : ''}>${out}</code></pre>`
  },
}).use(anchor, {
  level: [2, 3],
  slugify: (s: string) =>
    s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60),
  permalink: anchor.permalink.linkInsideHeader({ symbol: '#', placement: 'after' }),
})

// Wrap every table so wide content scrolls inside its own box, never the page.
const defaultTableOpen = md.renderer.rules.table_open
md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
  const inner = defaultTableOpen
    ? defaultTableOpen(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options)
  return `<div class="table-scroll">${inner}`
}
const defaultTableClose = md.renderer.rules.table_close
md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
  const inner = defaultTableClose
    ? defaultTableClose(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options)
  return `${inner}</div>`
}

function extractHeadings(source: string): Heading[] {
  const out: Heading[] = []
  let inFence = false
  for (const line of source.split('\n')) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!m) continue
    const text = m[2].replace(/[*`_]/g, '').trim()
    out.push({
      depth: m[1].length,
      text,
      id: text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60),
    })
  }
  return out
}

const cache = new Map<string, Doc[]>()

export function allDocs(courseId: string): Doc[] {
  const hit = cache.get(courseId)
  if (hit) return hit

  const dir = contentDir(courseId)
  if (!existsSync(dir)) return []

  const docs = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(readFileSync(join(dir, file), 'utf8'))
      const words = content.split(/\s+/).length
      return {
        ...(data as Omit<Doc, 'html' | 'headings' | 'readingMinutes'>),
        html: md.render(content),
        headings: extractHeadings(content),
        readingMinutes: Math.max(2, Math.round(words / 220)),
      } as Doc
    })
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'module' ? -1 : 1
      if (a.kind === 'module') return (a.num ?? 0) - (b.num ?? 0)
      return (a.part ?? '').localeCompare(b.part ?? '')
    })

  cache.set(courseId, docs)
  return docs
}

export const allModules = (courseId: string) =>
  allDocs(courseId).filter((d) => d.kind === 'module')

export const allReferences = (courseId: string) =>
  allDocs(courseId).filter((d) => d.kind === 'reference')

export const getDoc = (courseId: string, slug: string) =>
  allDocs(courseId).find((d) => d.slug === slug)

/** Modules in one track, or every module when the track has no explicit list. */
export function modulesForTrack(courseId: string, track: string): Doc[] {
  const mods = allModules(courseId)
  const course = getCourse(courseId)
  if (!course) return mods
  const resolved = resolveTrack(course, track)
  if (!trackNames(course).length) return mods
  return mods.filter((m) => m.tracks?.includes(resolved))
}

/** Groups modules using the course's declared stage order. */
export function byStage(course: Course | undefined, mods: Doc[]) {
  const order = course?.stages ?? []
  const seen = new Set<string>()
  const groups: { stage: string; modules: Doc[] }[] = []

  for (const stage of order) {
    const inStage = mods.filter((m) => m.stage === stage)
    if (inStage.length) { groups.push({ stage, modules: inStage }); seen.add(stage) }
  }
  // Anything with a stage the course did not declare still gets shown.
  for (const m of mods) {
    const stage = m.stage ?? 'Modules'
    if (seen.has(stage)) continue
    const existing = groups.find((g) => g.stage === stage)
    if (existing) existing.modules.push(m)
    else groups.push({ stage, modules: [m] })
  }
  return groups
}
