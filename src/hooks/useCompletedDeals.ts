'use client'

import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'

import getCompletedDealsAbi from '@/abis/porep-market/getCompletedDeals.json'

const POREP_MARKET_ADDRESS = '0xBa41A6CD7845045aa4cA2B395EB569C24CB4812D'

export interface DealRequirements {
  retrievabilityBps: number
  bandwidthMbps: number
  latencyMs: number
  indexingPct: number
}

export interface DealTerms {
  dealSizeBytes: bigint
  pricePerSectorPerMonth: bigint
  durationDays: number
}

export interface DealProposal {
  dealId: bigint
  client: Address
  provider: bigint
  requirements: DealRequirements
  terms: DealTerms
  validator: Address
  state: number
  railId: bigint
  manifestLocation: string
}

export function useCompletedDeals() {
  const client = usePublicClient()

  return useQuery({
    queryKey: ['completedDeals'],
    queryFn: () =>
      client!.readContract({
        address: POREP_MARKET_ADDRESS,
        abi: getCompletedDealsAbi,
        functionName: 'getCompletedDeals',
      }) as Promise<DealProposal[]>,
    enabled: !!client,
  })
}
