'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { SLIThresholds } from '@/types'

export function useSPScore(providerId: bigint | undefined, required: SLIThresholds | undefined) {
  const client = usePublicClient()
  const [{ SLI_SCORER }, { SLIScorerAbi }] = useContracts()

  return useQuery({
    queryKey: ['spScore', providerId?.toString(), SLI_SCORER, required],
    queryFn: () =>
      client!.readContract({
        address: SLI_SCORER,
        abi: SLIScorerAbi,
        functionName: 'calculateScore',
        args: [providerId!, required!],
      }) as Promise<bigint>,
    enabled: !!client && providerId !== undefined && required !== undefined,
    retry: false,
  })
}
