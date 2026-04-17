import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'

import '@rainbow-me/rainbowkit/styles.css'

import { Nav } from '@/components/nav'
import { Providers } from '@/components/providers'

import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}
