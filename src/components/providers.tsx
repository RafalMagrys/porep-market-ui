'use client'

import { useState } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { createWagmiConfig } from '@/lib/wagmi'
import { loadDevnetSettings } from '@/lib/devnet-settings'
import { NetworkProvider } from '@/contexts/network-context'

function RainbowKitWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <RainbowKitProvider
      appInfo={{ appName: 'PoRep Market' }}
      theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [wagmiConfig] = useState(() => createWagmiConfig(loadDevnetSettings().rpcUrl || undefined))

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitWithTheme>
            <NetworkProvider>{children}</NetworkProvider>
          </RainbowKitWithTheme>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
