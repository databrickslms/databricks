// Builds the course registry and splits each course's plan.md into per-module
// and per-reference markdown files with frontmatter.
//
// Layout expected:
//   content/site.json
//   content/courses/<id>/course.json     (required)
//   content/courses/<id>/plan.md         (required for status: live | draft)
//   content/courses/<id>/quizzes.json    (optional)
//   content/courses/<id>/modules/*.md    (generated — do not edit by hand)
//
// A course with status "planned" needs only course.json; it renders as a
// roadmap card and is never linkable, so nothing half-built reaches a learner.
//
// Emits content/registry.generated.json, which the app imports statically so
// course metadata is available to client components without touching the fs.

import {
  existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const coursesDir = join(root, 'content', 'courses')

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD')
    .replace(/[’'"]/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)

const jsonOf = (v) => JSON.stringify(v)

function readCourse(id) {
  const dir = join(coursesDir, id)
  const configPath = join(dir, 'course.json')
  if (!existsSync(configPath)) throw new Error(`${id}: course.json is missing`)
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  if (config.id !== id) {
    throw new Error(`${id}: course.json "id" is "${config.id}" — it must match the folder name`)
  }
  return { dir, config }
}

/** Resolve `modules: "all" | number[]` for one track against the module numbers present. */
function trackMembership(track, allNums) {
  if (!track.modules || track.modules === 'all') return allNums
  if (!Array.isArray(track.modules)) throw new Error('track.modules must be "all" or an array')
  return track.modules
}

function splitPlan(id, dir, config) {
  const planPath = join(dir, 'plan.md')
  if (!existsSync(planPath)) throw new Error(`${id}: plan.md is missing (status is "${config.status}")`)

  const outDir = join(dir, 'modules')
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const lines = readFileSync(planPath, 'utf8').split('\n')
  const marks = []
  lines.forEach((line, i) => {
    let m = /^## Module (\d+) — (.+)$/.exec(line)
    if (m) { marks.push({ i, kind: 'module', num: Number(m[1]), title: m[2].trim() }); return }
    m = /^## (Part [A-Z]) — (.+)$/.exec(line)
    if (m) marks.push({ i, kind: 'reference', part: m[1], title: m[2].trim() })
  })
  if (!marks.length) throw new Error(`${id}: plan.md has no "## Module N — Title" headings`)

  const moduleNums = marks.filter((m) => m.kind === 'module').map((m) => m.num)
  const stageMap = config.stageMap ?? {}
  const stageOf = (n) =>
    Object.entries(stageMap).find(([, nums]) => nums.includes(n))?.[0] ?? 'Modules'
  const trackNames = Object.keys(config.tracks ?? {})
  const tracksOf = (n) =>
    trackNames.filter((t) => trackMembership(config.tracks[t], moduleNums).includes(n))

  const docs = []

  const slugFor = (m) =>
    m.kind === 'module' ? `Module ${m.num}` : m.part

  marks.forEach((mark, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].i : lines.length
    let body = lines.slice(mark.i + 1, end).join('\n')
    // Drop the `### LEVEL n` divider and trailing rule belonging to the next section.
    body = body.replace(/\n+###\s+LEVEL[\s\S]*$/, '\n').replace(/\n+---\s*$/, '\n').trim()

    const pick = (label) => {
      const m = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^·\\n]+)`).exec(body)
      return m ? m[1].trim() : ''
    }
    const level = pick('Level')
    const duration = pick('Duration')
    const audience = pick('Audience')
    // The whole metadata line is removed, so anything on it beyond these three
    // fields would vanish silently. Warn rather than lose it.
    const metaLine = /^\*\*Level:\*\*.*$/m.exec(body)?.[0] ?? ''
    const extras = metaLine
      .split('·')
      .map((part) => part.trim())
      .filter((part) => part && !/^\*\*(Level|Duration|Audience):\*\*/.test(part))
    if (extras.length) {
      console.warn(
        `  ! ${slugFor(mark)}: content on the metadata line will not render — ${extras.join(' | ')}`,
      )
    }
    body = body.replace(/^\*\*Level:\*\*.*\n/m, '').trim()

    const summary = (body.split('\n')
      .find((l) => l.trim() && !/^[#>|*\-`]/.test(l.trim())) || '')
      .replace(/\*\*/g, '').replace(/`/g, '').trim().slice(0, 260)

    const isModule = mark.kind === 'module'
    const slug = isModule
      ? `${String(mark.num).padStart(2, '0')}-${slugify(mark.title)}`
      : `ref-${slugify(`${mark.part} ${mark.title}`)}`

    const front = [
      '---',
      `course: ${id}`,
      `kind: ${mark.kind}`,
      `slug: ${slug}`,
      `title: ${jsonOf(mark.title)}`,
      ...(isModule
        ? [
            `num: ${mark.num}`,
            `stage: ${jsonOf(stageOf(mark.num))}`,
            `tracks: ${jsonOf(tracksOf(mark.num))}`,
            `level: ${jsonOf(level)}`,
            `duration: ${jsonOf(duration)}`,
            `audience: ${jsonOf(audience)}`,
          ]
        : [`part: ${jsonOf(mark.part)}`]),
      `summary: ${jsonOf(summary)}`,
      '---',
      '',
    ].join('\n')

    writeFileSync(join(outDir, `${slug}.md`), front + body + '\n', 'utf8')
    docs.push({ slug, kind: mark.kind, num: mark.num })
  })

  return {
    moduleCount: docs.filter((d) => d.kind === 'module').length,
    referenceCount: docs.filter((d) => d.kind === 'reference').length,
    moduleNums,
  }
}

/* ── main ─────────────────────────────────────────────────────────────────── */

try {

const ids = readdirSync(coursesDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

const registry = []
let totalQuestions = 0

for (const id of ids) {
  const { dir, config } = readCourse(id)
  const status = config.status ?? 'planned'

  let stats = { moduleCount: 0, referenceCount: 0, moduleNums: [] }
  if (status !== 'planned') stats = splitPlan(id, dir, config)

  // Quiz totals per course, so pages don't have to import every quiz file.
  let questionCount = 0
  const quizPath = join(dir, 'quizzes.json')
  if (existsSync(quizPath)) {
    const quizzes = JSON.parse(readFileSync(quizPath, 'utf8'))
    for (const key of Object.keys(quizzes)) {
      questionCount += quizzes[key].length
      if (status !== 'planned' && !stats.moduleNums.includes(Number(key))) {
        console.warn(`  ! ${id}: quizzes.json has key "${key}" with no matching module`)
      }
    }
  }
  totalQuestions += questionCount

  registry.push({
    ...config,
    status,
    moduleCount: stats.moduleCount,
    referenceCount: stats.referenceCount,
    questionCount,
  })

  const label = status === 'planned' ? 'planned' : `${stats.moduleCount} modules, ${stats.referenceCount} refs, ${questionCount} questions`
  console.log(`  ${id.padEnd(16)} ${status.padEnd(8)} ${label}`)
}

registry.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

writeFileSync(
  join(root, 'content', 'registry.generated.json'),
  `${JSON.stringify(registry, null, 2)}\n`,
  'utf8',
)

const live = registry.filter((c) => c.status === 'live').length
console.log(`content: ${registry.length} courses (${live} live), ${totalQuestions} questions -> content/registry.generated.json`)

} catch (err) {
  // Course authors hit these, not Node developers — keep it to one clear line.
  console.error(`\n  ✗ content build failed\n    ${err.message}\n`)
  console.error('    Expected layout:')
  console.error('      content/courses/<id>/course.json   required; "id" must equal the folder name')
  console.error('      content/courses/<id>/plan.md       required unless status is "planned"')
  console.error('      content/courses/<id>/quizzes.json  optional, keyed by module number\n')
  process.exit(1)
}
