'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Profile picture with a graceful fallback.
 *
 * Google avatar URLs can 404 — the account may have no photo, or the URL stored
 * at sign-in can expire. Falling back to initials keeps a broken image icon off
 * the page. Needs the host allowlisted in next.config.mjs images.remotePatterns.
 */
export function Avatar({
  src,
  name,
  size = 30,
}: {
  src?: string | null
  name?: string | null
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase()

  if (!src || failed) {
    return (
      <div
        className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent"
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.42) }}
        aria-hidden
      >
        {initial}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full ring-1 ring-line"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      unoptimized
    />
  )
}
