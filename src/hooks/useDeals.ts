'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { DealProposal } from '@/types'

export function useDeals() {
  const client = usePublicClient()
  const [{ POREP_MARKET }, { PoRepMarketAbi }] = useContracts()

  console.log('address', POREP_MARKET)
  console.log('abi', PoRepMarketAbi)
  
  return useQuery({
    queryKey: ['deals', POREP_MARKET],
    queryFn: () =>
      client!.readContract({
        address: POREP_MARKET,
        abi: PoRepMarketAbi,
        functionName: 'getDeals',
      }) as Promise<DealProposal[]>,
    enabled: !!client,
  })
}
