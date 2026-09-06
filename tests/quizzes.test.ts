/**
 * Quiz quality checks.
 *
 *   npm run test:quizzes
 *
 * These guard against failures that make a quiz look fine while measuring
 * nothing. All three below were real: every one of the 65 questions had its
 * answer at index 0, the correct option was the longest in 75% of questions,
 * and the quizzes still described a retail bank after the course had been
 * rewritten for asset management.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Q = { q: string; options: string[]; answer: number; why: string }

const file = join(process.cwd(), 'content/courses/genie-agents/quizzes.json')
const byModule: Record<string, Q[]> = JSON.parse(readFileSync(file, 'utf8'))
const all: { mod: string; q: Q }[] = Object.entries(byModule).flatMap(([mod, qs]) =>
  qs.map((q) => ({ mod, q })),
)

let passed = 0
const failures: string[] = []
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) passed++
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

// ── structure ───────────────────────────────────────────────────────────────
for (const { mod, q } of all) {
  const at = `M${mod} "${q.q.slice(0, 40)}…"`
  check(`${at}: has options`, q.options.length >= 3)
  check(`${at}: answer in range`, q.answer >= 0 && q.answer < q.options.length)
  check(`${at}: options are distinct`,
    new Set(q.options.map((o) => o.toLowerCase().trim())).size === q.options.length)
  check(`${at}: has an explanation`, q.why.trim().length > 20)
}

// ── answer position ─────────────────────────────────────────────────────────
// Every answer sat at index 0, so "always click the first option" scored 100%.
{
  const counts = [0, 0, 0, 0]
  for (const { q } of all) counts[q.answer]++
  const worst = Math.max(...counts) / all.length
  check('no position bias', worst <= 0.4,
    `most common index holds ${(worst * 100).toFixed(0)}% of answers (want <=40%)`)
}

// ── length ──────────────────────────────────────────────────────────────────
// The correct answer being reliably the longest is the same free signal in
// another form. Questions whose options are all short (a number, a permission
// level, a product name) are excluded: length cannot carry a signal there, and
// padding them out would make them worse.
{
  const prose = all.filter(({ q }) => Math.max(...q.options.map((o) => o.length)) >= 25)

  const longest = prose.filter(
    ({ q }) => q.options[q.answer].length === Math.max(...q.options.map((o) => o.length)),
  ).length
  const rate = longest / prose.length
  check('correct option is not reliably the longest', rate <= 0.45,
    `${(rate * 100).toFixed(0)}% of ${prose.length} prose questions (chance is ~25%)`)

  // A single blatant question matters more than the aggregate: if one answer is
  // twice the length of every distractor, that question is free regardless of
  // how the rest score.
  const blatant = prose.filter(({ q }) => {
    const right = q.options[q.answer].length
    const other = Math.max(...q.options.filter((_, i) => i !== q.answer).map((o) => o.length))
    return right / other >= 1.8
  })
  check('no single question gives itself away by length', blatant.length === 0,
    blatant.map((b) => `M${b.mod}: ${b.q.q.slice(0, 40)}`).join('; '))
}

// ── domain ──────────────────────────────────────────────────────────────────
// The course was rewritten from retail banking to asset management; the
// quizzes were missed entirely the first time.
{
  const banking =
    /\bdeposits?\b|\blending\b|\bloans?\b|delinquen|\bDPD\b|charge-?off|\bbranch\b|\bfraud\b|chargeback|fee revenue|Retail Bank|past due/i
  const hits = all.filter(({ q }) => banking.test([q.q, q.why, ...q.options].join(' ')))
  check('no retail-banking content', hits.length === 0,
    hits.map((h) => `M${h.mod}: ${h.q.q.slice(0, 45)}`).join('; '))
}

// ── report ──────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n${failures.length} quiz check(s) failed:`)
  for (const f of failures) console.error(`  ✗ ${f}`)
  process.exit(1)
}
console.log(`✓ ${passed} quiz checks passed across ${all.length} questions`)
