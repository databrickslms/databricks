/**
 * Video embeds for lesson content, authored as a ```video fence:
 *
 *   ```video
 *   title: Provisioning walkthrough
 *   duration: 6 min
 *   src: /media/genie-agents/00-provisioning.mp4
 *   poster: /media/genie-agents/00-provisioning.jpg
 *   ```
 *
 * `src` is the only field that changes behaviour. Without it (or with a
 * placeholder value like `tbd`), the block renders as a reserved slot showing
 * the title and duration, so the lesson reads correctly before the recording
 * exists and the layout does not shift when it arrives. Drop the file in and
 * set `src`; nothing else changes.
 *
 * A local file path renders a <video>. A YouTube or Vimeo URL renders their
 * privacy-preserving embed host instead.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const UNSET = new Set(['', 'tbd', 'todo', 'coming soon', 'placeholder', 'none'])

function parseFields(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of body.split('\n')) {
    const m = /^\s*([a-z_]+)\s*:\s*(.*)$/i.exec(line)
    if (m) out[m[1].toLowerCase()] = m[2].trim()
  }
  return out
}

/** Returns an embed URL for the hosts we support, or null for a direct file. */
function embedUrl(src: string): string | null {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(src)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(src)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

export function renderVideo(body: string, _flags: string[]): string {
  const f = parseFields(body)
  const title = f.title || 'Walkthrough'
  const duration = f.duration || ''
  const src = f.src ?? ''
  const meta =
    `<figcaption class="video-meta"><span class="video-title">${esc(title)}</span>` +
    (duration ? `<span class="video-duration">${esc(duration)}</span>` : '') +
    `</figcaption>`

  if (UNSET.has(src.toLowerCase())) {
    // Reserve the space rather than omitting the block, so the surrounding
    // prose is written against the final layout.
    return (
      `<figure class="video video-pending">` +
      `<div class="video-frame" role="img" aria-label="${esc(title)}: video not yet available">` +
      `<span class="video-play" aria-hidden="true"></span>` +
      `<span class="video-pending-note">Recording to follow</span>` +
      `</div>${meta}</figure>`
    )
  }

  const embed = embedUrl(src)
  const player = embed
    ? `<iframe class="video-frame" src="${esc(embed)}" title="${esc(title)}" loading="lazy"` +
      ` allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; fullscreen"` +
      ` allowfullscreen></iframe>`
    : `<video class="video-frame" controls preload="metadata"` +
      (f.poster ? ` poster="${esc(f.poster)}"` : '') +
      `><source src="${esc(src)}" />Your browser cannot play this video.</video>`

  return `<figure class="video">${player}${meta}</figure>`
}
