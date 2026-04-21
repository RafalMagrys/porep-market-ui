'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { DealProposal } from '@/types'

export function useDeal(dealId: bigint | undefined) {
  const client = usePublicClient()
  const [{ POREP_MARKET }, { PoRepMarketAbi }] = useContracts()

  return useQuery({
    queryKey: ['deal', dealId?.toString(), POREP_MARKET],
    queryFn: () =>
      client!.readContract({
        address: POREP_MARKET,
        abi: PoRepMarketAbi,
        functionName: 'getDealProposal',
        args: [dealId!],
      }) as Promise<DealProposal>,
    enabled: !!client && dealId !== undefined,
  })
}
