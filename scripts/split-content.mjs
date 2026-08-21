// Splits content/course-plan.md into per-module + per-reference markdown files
// with frontmatter. Re-run any time the plan changes: `npm run content`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'content', 'course-plan.md')
const outDir = join(root, 'content', 'modules')
mkdirSync(outDir, { recursive: true })
for (const f of readdirSync(outDir)) if (f.endsWith('.md')) unlinkSync(join(outDir, f))

const TRACKS = {
  business: [1, 2, 3],
  author: Array.from({ length: 18 }, (_, i) => i),
  platform: [0, 1, 4, 6, 13, 14, 15, 16],
}
const STAGES = [
  { name: 'Lab Setup',            modules: [0] },
  { name: 'Foundations',          modules: [1, 2, 3] },
  { name: 'How It Works',         modules: [4, 5, 6] },
  { name: 'Building',             modules: [7, 8, 9, 10] },
  { name: 'Quality & Operations', modules: [11, 12, 13, 14, 15] },
  { name: 'Advanced / Extend',    modules: [16] },
  { name: 'Capstone',             modules: [17] },
]
const stageOf = (n) => STAGES.find((s) => s.modules.includes(n))?.name ?? 'Other'
const tracksOf = (n) => Object.entries(TRACKS).filter(([, ns]) => ns.includes(n)).map(([t]) => t)

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD')
    .replace(/[’'"]/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)

const raw = readFileSync(src, 'utf8')
const lines = raw.split('\n')

const marks = []
lines.forEach((line, i) => {
  let m = /^## Module (\d+) — (.+)$/.exec(line)
  if (m) { marks.push({ i, kind: 'module', num: Number(m[1]), title: m[2].trim() }); return }
  m = /^## (Part [A-E]) — (.+)$/.exec(line)
  if (m) marks.push({ i, kind: 'reference', part: m[1], title: m[2].trim() })
})
if (!marks.length) throw new Error('No sections found in course-plan.md')

const yaml = (v) => JSON.stringify(v)
const written = []

marks.forEach((mark, idx) => {
  const end = idx + 1 < marks.length ? marks[idx + 1].i : lines.length
  let body = lines.slice(mark.i + 1, end).join('\n')
  // Drop the `### LEVEL n` divider and trailing rule that belong to the next section.
  body = body.replace(/\n+###\s+LEVEL[\s\S]*$/, '\n').replace(/\n+---\s*$/, '\n').trim()

  const meta = {}
  const lvl = /\*\*Level:\*\*\s*([^·\n]+)/.exec(body)
  const dur = /\*\*Duration:\*\*\s*([^·\n]+)/.exec(body)
  const aud = /\*\*Audience:\*\*\s*([^·\n]+)/.exec(body)
  if (lvl) meta.level = lvl[1].trim()
  if (dur) meta.duration = dur[1].trim()
  if (aud) meta.audience = aud[1].trim()
  // The meta line renders as chips in the UI, so strip it from the prose.
  body = body.replace(/^\*\*Level:\*\*.*\n/m, '').trim()

  const summary =
    (body.split('\n').find((l) => l.trim() && !/^[#>|*\-`]/.test(l.trim())) || '')
      .replace(/\*\*/g, '').replace(/`/g, '').trim().slice(0, 260)

  const isModule = mark.kind === 'module'
  const slug = isModule
    ? `${String(mark.num).padStart(2, '0')}-${slugify(mark.title)}`
    : `ref-${slugify(mark.part + ' ' + mark.title)}`

  const fm = [
    '---',
    `kind: ${mark.kind}`,
    `slug: ${slug}`,
    `title: ${yaml(mark.title)}`,
    ...(isModule
      ? [
          `num: ${mark.num}`,
          `stage: ${yaml(stageOf(mark.num))}`,
          `tracks: ${yaml(tracksOf(mark.num))}`,
          `level: ${yaml(meta.level ?? '')}`,
          `duration: ${yaml(meta.duration ?? '')}`,
          `audience: ${yaml(meta.audience ?? '')}`,
        ]
      : [`part: ${yaml(mark.part)}`]),
    `summary: ${yaml(summary)}`,
    '---',
    '',
  ].join('\n')

  writeFileSync(join(outDir, `${slug}.md`), fm + body + '\n', 'utf8')
  written.push({ slug, kind: mark.kind })
})

const modules = written.filter((w) => w.kind === 'module').length
console.log(`content: ${modules} modules + ${written.length - modules} reference pages -> content/modules/`)
