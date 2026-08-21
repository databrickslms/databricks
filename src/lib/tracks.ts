// Client-safe constants. Kept separate from content.ts because that module
// reads the filesystem and can only run on the server.

export type Track = 'business' | 'author' | 'platform'

export const TRACKS: Record<Track, { name: string; blurb: string; hours: string }> = {
  business: {
    name: 'Business User',
    blurb: 'Ask better questions and read answers critically. No SQL.',
    hours: '~3 hours',
  },
  author: {
    name: 'Agent Author',
    blurb: 'Build, curate, tune, measure and own a Genie Agent end to end.',
    hours: '~20 hours',
  },
  platform: {
    name: 'Platform & Integration',
    blurb: 'Governance, latency, cost, escalation, API and multi-agent design.',
    hours: '~8 hours',
  },
}

export const STAGE_ORDER = [
  'Lab Setup', 'Foundations', 'How It Works', 'Building',
  'Quality & Operations', 'Advanced / Extend', 'Capstone',
]
