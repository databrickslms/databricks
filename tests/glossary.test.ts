/**
 * Glossary and per-module appendix checks.
 *
 *   npm run test:glossary
 *
 * The appendix is generated, so the failure mode is silent: a bad pattern puts
 * an irrelevant term in front of learners, and a dead entry looks like coverage
 * while defining nothing anyone reads.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const courseDir = join(process.cwd(), 'content/courses/genie-agents')
const raw: Record<string, { match?: string; def: string }> = JSON.parse(
  readFileSync(join(courseDir, 'glossary.json'), 'utf8'),
)
const terms = Object.entries(raw).filter(([t]) => !t.startsWith('_'))

const modules = readdirSync(join(courseDir, 'modules')).filter((f) => f.endsWith('.md'))
const bodies = modules.map((f) => ({
  file: f,
  text: readFileSync(join(courseDir, 'modules', f), 'utf8'),
}))

let passed = 0
const failures: string[] = []
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) passed++
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

for (const [term, v] of terms) {
  check(`${term}: has a definition`, typeof v.def === 'string' && v.def.trim().length > 30)
  check(`${term}: definition is a sentence`, /[.?!]$/.test(v.def.trim()))
  if (v.match) {
    let ok = true
    try { new RegExp(v.match, 'i') } catch { ok = false }
    check(`${term}: pattern compiles`, ok, v.match)
  }
  // An em dash in a definition would reintroduce the tell the prose was cleaned of.
  check(`${term}: no em dash`, !v.def.includes('—'))
}

// A term nobody uses is dead weight that still has to be maintained.
{
  const prose = bodies.map((b) => b.text.split('### Appendix')[0].replace(/```[\s\S]*?```/g, ''))
  const unused = terms.filter(([term, v]) => {
    const re = new RegExp(v.match ?? `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return !prose.some((p) => re.test(p))
  })
  check('every term is used somewhere', unused.length === 0, unused.map(([t]) => t).join(', '))
}

// Every module gets one, and it goes last.
for (const { file, text } of bodies) {
  const i = text.indexOf('### Appendix: terms used in this module')
  check(`${file}: has an appendix`, i > -1)
  if (i > -1) {
    check(`${file}: appendix is last`, !text.slice(i + 10).includes('\n### '))
    const rows = text.slice(i).split('\n').filter((l) => l.startsWith('| **')).length
    check(`${file}: appendix has rows`, rows > 0, `${rows} rows`)
  }
}

if (failures.length) {
  console.error(`\n${failures.length} glossary check(s) failed:`)
  for (const f of failures) console.error(`  ✗ ${f}`)
  process.exit(1)
}
console.log(`✓ ${passed} glossary checks passed (${terms.length} terms, ${bodies.length} pages)`)
