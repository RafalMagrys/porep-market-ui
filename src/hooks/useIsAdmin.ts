'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'

export function useIsAdmin() {
  const { address } = useAccount()
  const client = usePublicClient()
  const [{ SP_REGISTRY, POREP_MARKET }, { SpRegistryAbi, PoRepMarketAbi }] = useContracts()

  const adminRoleQuery = useQuery({
    queryKey: ['adminRole', SP_REGISTRY],
    queryFn: () =>
      client!.readContract({ address: SP_REGISTRY, abi: SpRegistryAbi, functionName: 'DEFAULT_ADMIN_ROLE' }) as Promise<`0x${string}`>,
    enabled: !!client,
  })

  const operatorRoleQuery = useQuery({
    queryKey: ['operatorRole', SP_REGISTRY],
    queryFn: () =>
      client!.readContract({ address: SP_REGISTRY, abi: SpRegistryAbi, functionName: 'OPERATOR_ROLE' }) as Promise<`0x${string}`>,
    enabled: !!client,
  })

  const isAdminOnRegistryQuery = useQuery({
    queryKey: ['isAdminOnRegistry', SP_REGISTRY, address, adminRoleQuery.data],
    queryFn: () =>
      client!.readContract({ address: SP_REGISTRY, abi: SpRegistryAbi, functionName: 'hasRole', args: [adminRoleQuery.data!, address!] }) as Promise<boolean>,
    enabled: !!client && !!address && !!adminRoleQuery.data,
  })

  const isOperatorOnRegistryQuery = useQuery({
    queryKey: ['isOperatorOnRegistry', SP_REGISTRY, address, operatorRoleQuery.data],
    queryFn: () =>
      client!.readContract({ address: SP_REGISTRY, abi: SpRegistryAbi, functionName: 'hasRole', args: [operatorRoleQuery.data!, address!] }) as Promise<boolean>,
    enabled: !!client && !!address && !!operatorRoleQuery.data,
  })

  const isAdminOnMarketQuery = useQuery({
    queryKey: ['isAdminOnMarket', POREP_MARKET, address, adminRoleQuery.data],
    queryFn: () =>
      client!.readContract({ address: POREP_MARKET, abi: PoRepMarketAbi, functionName: 'hasRole', args: [adminRoleQuery.data!, address!] }) as Promise<boolean>,
    enabled: !!client && !!address && !!adminRoleQuery.data,
  })

  return {
    isAdminOnRegistry: isAdminOnRegistryQuery.data ?? false,
    isOperatorOnRegistry: isOperatorOnRegistryQuery.data ?? false,
    isAdminOnMarket: isAdminOnMarketQuery.data ?? false,
    isAnyAdmin: (isAdminOnRegistryQuery.data || isOperatorOnRegistryQuery.data || isAdminOnMarketQuery.data) ?? false,
    adminRole: adminRoleQuery.data,
    operatorRole: operatorRoleQuery.data,
    isLoading: adminRoleQuery.isLoading || operatorRoleQuery.isLoading || isAdminOnRegistryQuery.isLoading || isAdminOnMarketQuery.isLoading,
  }
}
