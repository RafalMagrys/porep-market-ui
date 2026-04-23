'use client'

import { useQuery } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'

export function useToleranceBps() {
  const client = usePublicClient()
  const [{ SP_REGISTRY }, { SpRegistryAbi }] = useContracts()
  return useQuery({
    queryKey: ['toleranceBps', SP_REGISTRY],
    queryFn: () =>
      client!.readContract({
        address: SP_REGISTRY,
        abi: SpRegistryAbi,
        functionName: 'getToleranceBps',
      }) as Promise<bigint>,
    enabled: !!client,
  })
}

export function useGrantRevokeRole() {
  const [{ SP_REGISTRY, POREP_MARKET }, { SpRegistryAbi, PoRepMarketAbi }] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const write = (
    action: 'grant' | 'revoke',
    target: 'registry' | 'market',
    role: `0x${string}`,
    account: `0x${string}`
  ) =>
    writeContractAsync({
      address: target === 'registry' ? SP_REGISTRY : POREP_MARKET,
      abi: target === 'registry' ? SpRegistryAbi : PoRepMarketAbi,
      functionName: action === 'grant' ? 'grantRole' : 'revokeRole',
      args: [role, account],
    })

  return {
    grantRole: write.bind(null, 'grant'),
    revokeRole: write.bind(null, 'revoke'),
    isPending,
    isConfirming,
    isSuccess,
  }
}
