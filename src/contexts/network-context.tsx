'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useChainId } from 'wagmi'

import {
  NETWORKS,
  CHAIN_ID_TO_NETWORK,
  ABIS,
  type NetworkKey,
  type ContractAddresses,
  type NetworkAbis
} from '@/lib/network-config'

interface NetworkContextValue {
  activeNetwork: NetworkKey
  contracts: ContractAddresses
  networks: typeof NETWORKS
  abis: NetworkAbis
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const chainId = useChainId()
  const activeNetwork: NetworkKey = CHAIN_ID_TO_NETWORK[chainId] ?? 'devnet'
  const contracts = NETWORKS[activeNetwork].contracts
  const abis = ABIS[activeNetwork]

  return (
    <NetworkContext.Provider value={{ activeNetwork, contracts, networks: NETWORKS, abis }}>
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

