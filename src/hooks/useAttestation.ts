'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { Attestation } from '@/types'

export function useAttestation(providerId: bigint | undefined) {
  const client = usePublicClient()
  const [{ SLI_ORACLE }, { SLIOracleAbi }] = useContracts()

  return useQuery({
    queryKey: ['attestation', providerId?.toString(), SLI_ORACLE],
    queryFn: () =>
      client!.readContract({
        address: SLI_ORACLE,
        abi: SLIOracleAbi,
        functionName: 'getAttestation',
        args: [providerId!],
      }) as Promise<Attestation>,
    enabled: !!client && providerId !== undefined,
    retry: false,
  })
}
