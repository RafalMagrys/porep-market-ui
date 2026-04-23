'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { useChainId } from 'wagmi'

import {
  NETWORKS,
  CHAIN_ID_TO_NETWORK,
  ABIS,
  type NetworkKey,
  type ContractAddresses,
  type NetworkAbis,
} from '@/lib/network-config'
import {
  loadDevnetSettings,
  saveDevnetSettings,
  clearDevnetSettings,
  type DevnetSettings,
} from '@/lib/devnet-settings'

interface NetworkContextValue {
  activeNetwork: NetworkKey
  contracts: ContractAddresses
  networks: typeof NETWORKS
  abis: NetworkAbis
  devnetSettings: DevnetSettings
  saveDevnetOverrides: (settings: DevnetSettings) => void
  resetDevnetOverrides: () => void
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const chainId = useChainId()
  const activeNetwork: NetworkKey = CHAIN_ID_TO_NETWORK[chainId] ?? 'devnet'
  const [devnetSettings, setDevnetSettings] = useState<DevnetSettings>(loadDevnetSettings)
  const abis = ABIS[activeNetwork]

  const baseContracts = NETWORKS[activeNetwork].contracts
  const contracts: ContractAddresses =
    activeNetwork === 'devnet'
      ? {
          ...baseContracts,
          ...Object.fromEntries(
            Object.entries(devnetSettings.contracts).filter(([, v]) => v)
          ),
        }
      : baseContracts

  function saveDevnetOverrides(settings: DevnetSettings) {
    const prevRpc = devnetSettings.rpcUrl
    saveDevnetSettings(settings)
    setDevnetSettings(settings)
    if (settings.rpcUrl !== prevRpc) window.location.reload()
  }

  function resetDevnetOverrides() {
    clearDevnetSettings()
    setDevnetSettings({ rpcUrl: '', contracts: {} })
    window.location.reload()
  }

  return (
    <NetworkContext.Provider
      value={{ activeNetwork, contracts, networks: NETWORKS, abis, devnetSettings, saveDevnetOverrides, resetDevnetOverrides }}
    >
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used inside NetworkProvider')
  return ctx
}

export function useContracts() {
  const network = useNetwork()
  return [network.contracts, network.abis] as const
}
