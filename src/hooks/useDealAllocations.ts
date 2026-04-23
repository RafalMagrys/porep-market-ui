'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'

export interface AllocationStatus {
  id: bigint
  terminated: boolean
}

export function useDealAllocations(dealId: bigint | undefined) {
  const client = usePublicClient()
  const [{ CLIENT_CONTRACT }, { ClientAbi }] = useContracts()

  return useQuery({
    queryKey: ['dealAllocations', dealId?.toString(), CLIENT_CONTRACT],
    queryFn: async (): Promise<AllocationStatus[]> => {
      const ids = (await client!.readContract({
        address: CLIENT_CONTRACT,
        abi: ClientAbi,
        functionName: 'getClientAllocationIdsPerDeal',
        args: [dealId!],
      })) as bigint[]

      const statuses = await Promise.all(
        ids.map(async (id) => {
          const terminated = (await client!.readContract({
            address: CLIENT_CONTRACT,
            abi: ClientAbi,
            functionName: 'terminatedClaims',
            args: [id],
          })) as boolean
          return { id, terminated }
        })
      )

      return statuses
    },
    enabled: !!client && dealId !== undefined,
    retry: false,
  })
}
