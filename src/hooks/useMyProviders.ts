'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { ProviderInfo } from '@/types'

export function useMyProviders() {
  const { address } = useAccount()
  const client = usePublicClient()
  const [{ SP_REGISTRY }, { SpRegistryAbi }] = useContracts()

  const idsQuery = useQuery({
    queryKey: ['myProviderIds', SP_REGISTRY, address],
    queryFn: () =>
      client!.readContract({
        address: SP_REGISTRY,
        abi: SpRegistryAbi,
        functionName: 'getProvidersByOrganization',
        args: [address!],
      }) as Promise<bigint[]>,
    enabled: !!client && !!address,
  })

  const infosQuery = useQuery({
    queryKey: ['myProviderInfos', SP_REGISTRY, idsQuery.data?.map(String)],
    queryFn: async () => {
      const ids = idsQuery.data!
      const infos = await Promise.all(
        ids.map((id) =>
          client!.readContract({
            address: SP_REGISTRY,
            abi: SpRegistryAbi,
            functionName: 'getProviderInfo',
            args: [id],
          }) as Promise<ProviderInfo>,
        ),
      )
      return ids.map((id, i) => ({ id, info: infos[i] }))
    },
    enabled: !!client && !!idsQuery.data?.length,
  })

  return {
    providers: infosQuery.data ?? [],
    isLoading: idsQuery.isLoading || infosQuery.isLoading,
    error: idsQuery.error || infosQuery.error,
    refetch: () => { idsQuery.refetch(); infosQuery.refetch() },
  }
}
