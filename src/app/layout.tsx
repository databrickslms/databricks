import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { getSession } from '@/lib/session'
import { SiteHeader } from '@/components/site-header'
import { PreviewBanner } from '@/components/preview-banner'
import { SITE } from '@/lib/courses'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = Instrument_Serif({
  subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap',
})
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfbf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0f12' },
  ],
}

// Applies the saved theme before first paint so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <PreviewBanner />
          <SiteHeader session={session} />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
