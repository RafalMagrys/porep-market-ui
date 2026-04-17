'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import getDealsAbi from '@/abis/porep-market/getDeals.json'
import { DealProposal } from './useCompletedDeals'

const POREP_MARKET_ADDRESS = '0xBa41A6CD7845045aa4cA2B395EB569C24CB4812D'

export function useDeals() {
  const client = usePublicClient()

  return useQuery({
    queryKey: ['deals'],
    queryFn: () =>
      client!.readContract({
        address: POREP_MARKET_ADDRESS,
        abi: getDealsAbi,
        functionName: 'getDeals',
      }) as Promise<DealProposal[]>,
    enabled: !!client,
  })
}
