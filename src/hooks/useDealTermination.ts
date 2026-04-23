'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'

import { useContracts } from '@/contexts/network-context'
import type { DealTermination } from '@/types'

const DEAL_TERMINATED_EVENT = parseAbiItem(
  'event DealTerminated(uint256 indexed dealId, address indexed terminator, uint256 indexed endEpoch)'
)

export function useDealTermination(dealId: bigint | undefined) {
  const client = usePublicClient()
  const [{ POREP_MARKET }] = useContracts()

  return useQuery({
    queryKey: ['dealTermination', dealId?.toString(), POREP_MARKET],
    queryFn: async (): Promise<DealTermination | null> => {
      const logs = await client!.getLogs({
        address: POREP_MARKET,
        event: DEAL_TERMINATED_EVENT,
        args: { dealId: dealId! },
        fromBlock: 0n,
        toBlock: 'latest',
      })
      if (logs.length === 0) return null
      const { terminator, endEpoch } = logs[0].args
      return { terminator: terminator!, endEpoch: endEpoch! }
    },
    enabled: !!client && dealId !== undefined,
    retry: false,
  })
}
