import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '@rainbow-me/rainbowkit/styles.css'

import { Nav } from '@/components/nav'
import { Providers } from '@/components/providers'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Porep Market',
  description: 'Filecoin Storage Provider Reputation Market',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}
