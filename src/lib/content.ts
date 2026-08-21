import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/common'

export { TRACKS, STAGE_ORDER } from './tracks'
export type { Track } from './tracks'
import { STAGE_ORDER, type Track } from './tracks'

export type Heading = { id: string; text: string; depth: number }

export type Doc = {
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
  tracks?: Track[]
  level?: string
  duration?: string
  audience?: string
  // reference only
  part?: string
}

const CONTENT_DIR = join(process.cwd(), 'content', 'modules')

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

let cache: Doc[] | null = null

export function allDocs(): Doc[] {
  if (cache) return cache
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  const docs = files.map((file) => {
    const { data, content } = matter(readFileSync(join(CONTENT_DIR, file), 'utf8'))
    const words = content.split(/\s+/).length
    return {
      ...(data as Omit<Doc, 'html' | 'headings' | 'readingMinutes'>),
      html: md.render(content),
      headings: extractHeadings(content),
      readingMinutes: Math.max(2, Math.round(words / 220)),
    } as Doc
  })
  cache = docs.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'module' ? -1 : 1
    if (a.kind === 'module') return (a.num ?? 0) - (b.num ?? 0)
    return (a.part ?? '').localeCompare(b.part ?? '')
  })
  return cache
}

export const allModules = () => allDocs().filter((d) => d.kind === 'module')
export const allReferences = () => allDocs().filter((d) => d.kind === 'reference')
export const getDoc = (slug: string) => allDocs().find((d) => d.slug === slug)

export const modulesForTrack = (track: Track) =>
  allModules().filter((m) => m.tracks?.includes(track))

export function byStage(mods: Doc[]) {
  return STAGE_ORDER
    .map((stage) => ({ stage, modules: mods.filter((m) => m.stage === stage) }))
    .filter((g) => g.modules.length > 0)
}
