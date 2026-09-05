/**
 * Unit tests for the lesson diagram renderers.
 *
 *   npm run test:diagrams
 *
 * These exist because the failures are silent: a diagram that renders with the
 * wrong markup still renders *something*, and the page looks plausible until
 * someone looks closely. Each case below is a bug that was actually shipped or
 * nearly shipped.
 */
import { renderFlow, renderLadder } from '../src/lib/diagrams'
import { renderVideo } from '../src/lib/media'

let passed = 0
const failures: string[] = []

function check(name: string, cond: boolean, detail = '') {
  if (cond) passed++
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

// ── flow ────────────────────────────────────────────────────────────────────
{
  const html = renderFlow('Question → Analyst → Answer', [])
  check('flow: one group', (html.match(/flow-group/g) ?? []).length === 1)
  check('flow: three steps', (html.match(/class="flow-step[" ]/g) ?? []).length === 3)
  check('flow: two connectors', (html.match(/flow-arrow/g) ?? []).length === 2)
  check('flow: terminal step accented', (html.match(/flow-step-end/g) ?? []).length === 1)
  check('flow: single group is not a compare grid', !html.includes('flow-compare'))
  check('flow: no numbers unless asked', !html.includes('flow-n'))
}

{
  // Two groups must lay out side by side — the whole point of a before/after.
  const html = renderFlow('Before\nA → B\n\nAfter\nA → ↻', ['numbered'])
  check('flow: two groups', (html.match(/flow-group/g) ?? []).length === 2)
  check('flow: compare grid applied', html.includes('flow-compare'))
  check('flow: data-groups reported', html.includes('data-groups="2"'))
  check('flow: captions kept', html.includes('>Before<') && html.includes('>After<'))
  check('flow: numbered when asked', html.includes('flow-n'))
  check(
    'flow: loop marker consumed, not drawn as a step',
    !html.includes('flow-label">↻'),
    'the glyph belongs in the loop note, never in a step pill',
  )
  check('flow: loop note rendered', html.includes('flow-loop'))
  check(
    'flow: a looping chain has no terminal accent',
    (html.match(/flow-step-end/g) ?? []).length === 1,
    'only the non-looping group should get one',
  )
}

{
  const html = renderFlow('A -> B', [])
  check('flow: ascii arrows accepted', (html.match(/class="flow-step[" ]/g) ?? []).length === 2)
}

{
  const html = renderFlow('', [])
  check('flow: empty body renders nothing', html === '')
}

{
  const html = renderFlow('**Bold** → `code` → *italic*', [])
  check('flow: bold', html.includes('<strong>Bold</strong>'))
  check('flow: code', html.includes('<code>code</code>'))
  check('flow: italic', html.includes('<em>italic</em>'))
}

{
  const html = renderFlow('<script>x</script> → B', [])
  check('flow: html escaped', !html.includes('<script>'), 'author content must not inject markup')
}

// ── ladder ──────────────────────────────────────────────────────────────────
{
  const html = renderLadder(
    'strongest: Trusted assets — *"use this exact logic"*\n' +
      'Example SQL — a worked answer\n' +
      'weakest: Instructions — please remember',
    [],
  )
  check('ladder: three rungs', (html.match(/class="ladder-rung[" ]/g) ?? []).length === 3)
  check('ladder: top marked', html.includes('ladder-rung-top'))
  check('ladder: bottom marked', html.includes('ladder-rung-bottom'))
  check('ladder: rank word not left in the label', !html.includes('>strongest: '))
  check('ladder: glosses split off', (html.match(/ladder-gloss/g) ?? []).length === 3)
  check('ladder: italic inside a gloss', html.includes('<em>'))
  check('ladder: quotes curled', html.includes('“') && html.includes('”'))
  check('ladder: axis drawn', html.includes('ladder-axis'))

  // Regression: the bar was emitted after the rank/body and positioned with a
  // negative z-index, which painted it behind the rung's own background — an
  // invisible bar on every rung. It must come first in source order instead.
  const barIdx = html.indexOf('ladder-bar')
  const bodyIdx = html.indexOf('ladder-body')
  check('ladder: bar precedes its content', barIdx > -1 && barIdx < bodyIdx)
  check('ladder: no negative z-index needed', !html.includes('-z-['))

  // Bar widths must descend, or the shape says nothing.
  const widths = [...html.matchAll(/width:(\d+)%/g)].map((m) => Number(m[1]))
  check('ladder: widths descend', widths.length === 3 && widths[0] > widths[1] && widths[1] > widths[2],
    `got ${widths.join(', ')}`)
}

{
  const html = renderLadder('Only one rung', [])
  check('ladder: single rung does not divide by zero', html.includes('width:100%'))
  check('ladder: no-axis flag honoured', !renderLadder('a\nb', ['no-axis']).includes('ladder-axis'))
}

// ── video ───────────────────────────────────────────────────────────────────
{
  const html = renderVideo('title: Provisioning walkthrough\nduration: 6 min\nsrc: tbd', [])
  check('video: pending state when src is a placeholder', html.includes('video-pending'))
  check('video: title kept', html.includes('Provisioning walkthrough'))
  check('video: duration kept', html.includes('6 min'))
  check('video: reserves the player box', html.includes('video-frame'))
  check('video: no empty media element emitted', !html.includes('<video') && !html.includes('<iframe'))
}

{
  const html = renderVideo('title: T\nsrc: /media/x.mp4\nposter: /media/x.jpg', [])
  check('video: local file becomes a <video>', html.includes('<video') && html.includes('/media/x.mp4'))
  check('video: poster applied', html.includes('poster="/media/x.jpg"'))
  check('video: not pending once src is set', !html.includes('video-pending'))
}

{
  const yt = renderVideo('title: T\nsrc: https://www.youtube.com/watch?v=dQw4w9WgXcQ', [])
  check('video: youtube uses the no-cookie host',
    yt.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'))
  const vm = renderVideo('title: T\nsrc: https://vimeo.com/76979871', [])
  check('video: vimeo embed', vm.includes('player.vimeo.com/video/76979871'))
}

{
  const html = renderVideo('title: <script>x</script>\nsrc: tbd', [])
  check('video: title escaped', !html.includes('<script>'))
}

// ── report ──────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n${failures.length} diagram test(s) failed:`)
  for (const f of failures) console.error(`  ✗ ${f}`)
  console.error(`\n${passed} passed, ${failures.length} failed`)
  process.exit(1)
}
console.log(`✓ ${passed} diagram tests passed`)
