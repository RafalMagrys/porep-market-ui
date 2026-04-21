'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { ProviderInfo } from '@/types'

export function useSPs() {
  const client = usePublicClient()
  const [{ SP_REGISTRY }, {SpRegistryAbi}] = useContracts()

  const providerIdsQuery = useQuery({
    queryKey: ['spIds', SP_REGISTRY],
    queryFn: () =>
      client!.readContract({
        address: SP_REGISTRY,
        abi: SpRegistryAbi,
        functionName: 'getProviders',
      }) as Promise<bigint[]>,
    enabled: !!client,
  })

  const providerInfosQuery = useQuery({
    queryKey: ['spInfos', SP_REGISTRY, providerIdsQuery.data?.map(String)],
    queryFn: async () => {
      const ids = providerIdsQuery.data!
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
    enabled: !!client && !!providerIdsQuery.data?.length,
  })

  return {
    providers: providerInfosQuery.data ?? [],
    isLoading: providerIdsQuery.isLoading || providerInfosQuery.isLoading,
    error: providerIdsQuery.error || providerInfosQuery.error,
  }
}
