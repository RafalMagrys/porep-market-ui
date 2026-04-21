import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import '@rainbow-me/rainbowkit/styles.css'

import { Nav } from '@/components/nav'
import { Sidebar } from '@/components/sidebar'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'

import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'PoRep Market',
  description: 'Filecoin Storage Provider Reputation Market',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex h-screen flex-col">
            <Nav />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
