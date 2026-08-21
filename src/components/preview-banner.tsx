import { isPreview } from '@/lib/preview'

/**
 * Deliberately loud. Preview mode fakes a signed-in user and keeps progress in
 * memory, so it must never be mistaken for the real thing.
 */
export function PreviewBanner() {
  if (!isPreview()) return null
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-1.5 text-center text-[0.74rem] font-medium"
      style={{ background: 'rgb(var(--amber) / .16)', color: 'rgb(var(--amber))' }}
    >
      <span>
        <strong className="font-semibold">Preview mode</strong> — signed in as a stand-in user,
        no database
      </span>
      <span className="opacity-70">progress resets when the dev server restarts</span>
    </div>
  )
}
