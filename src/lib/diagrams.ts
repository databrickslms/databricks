/**
 * Diagram rendering for lesson content.
 *
 * Course authors were drawing flows as ASCII inside plain code fences:
 *
 *     Traditional analytics
 *       Question → Analyst → SQL → Dashboard → Answer
 *
 * That renders as a monospace panel — visually identical to a SQL listing, so a
 * conceptual diagram arrived looking like something to copy and run. These
 * renderers turn the same authoring syntax into real layout: labelled steps,
 * drawn connectors, and semantics the theme can style.
 *
 * Two fence languages, both readable as plain text in the source:
 *
 *   ```flow                        ```ladder
 *   Traditional analytics          strongest: Trusted assets — "use this logic"
 *   Question → Analyst → Answer    Example SQL — "here's a worked answer"
 *                                  weakest: Instructions — "please remember to..."
 *   Genie
 *   Question → Answer → ↻
 *   ```
 *
 * `flow` groups are separated by blank lines. Within a group, the line holding
 * arrows is the chain; any other line is the caption. Two groups render side by
 * side, which is what makes a before/after comparison read as a comparison.
 */

const ARROW = /\s*(?:→|->|➔)\s*/

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Inline emphasis authors already use in prose: **bold**, *italic* and `code`. */
function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Single asterisks only after the double pass, so **bold** is not re-matched.
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Match the typographer the rest of the prose goes through, so a quoted
    // phrase inside a diagram doesn't sit next to curly quotes in the paragraph
    // above it.
    .replace(/&quot;([^&]*?)&quot;/g, '\u201c$1\u201d')
    .replace(/(\w)'(\w)/g, '$1\u2019$2')
}

type FlowGroup = { caption: string | null; steps: string[]; loops: boolean }

function parseFlow(body: string): FlowGroup[] {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
    .map((lines) => {
      const chainIdx = lines.findIndex((l) => ARROW.test(l))
      // A group with no arrow at all is a single step — still worth drawing.
      const chainLine = chainIdx === -1 ? lines[lines.length - 1] : lines[chainIdx]
      const caption =
        chainIdx === -1
          ? lines.length > 1
            ? lines.slice(0, -1).join(' ')
            : null
          : lines.filter((_, i) => i !== chainIdx).join(' ') || null

      const steps = chainLine.split(ARROW).map((s) => s.trim()).filter(Boolean)
      // A trailing loop marker means the chain cycles rather than terminates.
      const loops = /^(↻|loop|repeat)$/i.test(steps[steps.length - 1] ?? '')
      if (loops) steps.pop()
      return { caption, steps, loops }
    })
    .filter((g) => g.steps.length > 0)
}

export function renderFlow(body: string, flags: string[]): string {
  const groups = parseFlow(body)
  if (groups.length === 0) return ''
  const numbered = flags.includes('numbered')

  const cards = groups
    .map((g) => {
      const last = g.steps.length - 1
      const steps = g.steps
        .map((step, i) => {
          const isEnd = i === last && !g.loops
          const n = numbered ? `<span class="flow-n">${i + 1}</span>` : ''
          return (
            `<li class="flow-step${isEnd ? ' flow-step-end' : ''}">` +
            `${n}<span class="flow-label">${inline(step)}</span></li>`
          )
        })
        .join('<li class="flow-arrow" aria-hidden="true"></li>')

      const loop = g.loops
        ? '<p class="flow-loop"><span aria-hidden="true">↻</span> and round again — each answer' +
          ' suggests the next question</p>'
        : ''
      const caption = g.caption
        ? `<p class="flow-caption">${inline(g.caption)}</p>`
        : ''

      return `<div class="flow-group">${caption}<ol class="flow-steps">${steps}</ol>${loop}</div>`
    })
    .join('')

  const cols = groups.length > 1 ? ' flow-compare' : ''
  return `<figure class="flow${cols}" data-groups="${groups.length}">${cards}</figure>`
}

/**
 * A ranked list where position carries the meaning. Authors mark the ends with
 * `strongest:` / `weakest:` (or `most:` / `least:`); everything between keeps
 * its order. An optional `—` splits a rung into label and gloss.
 */
export function renderLadder(body: string, flags: string[]): string {
  const rungs = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = /^(strongest|weakest|most|least)\s*:\s*(.*)$/i.exec(line)
      const rank = m ? m[1].toLowerCase() : null
      const rest = m ? m[2] : line
      const [label, ...gloss] = rest.split(/\s+—\s+/)
      return { rank, label, gloss: gloss.join(' — ') }
    })

  if (rungs.length === 0) return ''

  const items = rungs
    .map(({ rank, label, gloss }, i) => {
      const end =
        rank === 'strongest' || rank === 'most'
          ? ' ladder-rung-top'
          : rank === 'weakest' || rank === 'least'
            ? ' ladder-rung-bottom'
            : ''
      const marker = rank
        ? `<span class="ladder-rank">${esc(rank)}</span>`
        : `<span class="ladder-rank" aria-hidden="true"></span>`
      // Bar length encodes position, so the shape is readable before the words.
      const pct = Math.round(100 - (i / Math.max(rungs.length - 1, 1)) * 68)
      // Bar first in DOM: it is absolutely positioned, so anything after it in
      // source order and given a stacking context paints on top of it.
      return (
        `<li class="ladder-rung${end}">` +
        `<span class="ladder-bar" aria-hidden="true" style="width:${pct}%"></span>` +
        `${marker}` +
        `<span class="ladder-body"><span class="ladder-label">${inline(label)}</span>` +
        (gloss ? `<span class="ladder-gloss">${inline(gloss)}</span>` : '') +
        `</span></li>`
      )
    })
    .join('')

  const axis = flags.includes('no-axis')
    ? ''
    : '<span class="ladder-axis" aria-hidden="true"></span>'
  return `<figure class="ladder">${axis}<ol class="ladder-rungs">${items}</ol></figure>`
}

export const DIAGRAM_LANGS = ['flow', 'ladder'] as const

export function renderDiagram(lang: string, body: string, flags: string[]): string | null {
  if (lang === 'flow') return renderFlow(body, flags)
  if (lang === 'ladder') return renderLadder(body, flags)
  return null
}
