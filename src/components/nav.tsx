'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Database, Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function Nav() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <nav className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Database className="text-primary size-5" />
        <span>PoRep Market</span>
      </Link>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <ConnectButton />
      </div>
    </nav>
  )
}
