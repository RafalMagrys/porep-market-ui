'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { ProviderCapabilities } from '@/types'
import { Address } from 'viem'

export type SpRegistryWriteArgs = {
  pauseProvider: [id: bigint]
  unpauseProvider: [id: bigint]
  blockProvider: [id: bigint]
  unblockProvider: [id: bigint]
  setToleranceBps: [bps: bigint]
  setCapabilities: [spId: bigint, caps: ProviderCapabilities]
  setPrice: [spId: bigint, priceAttoFil: bigint]
  updateAvailableSpace: [spId: bigint, bytes: bigint]
  setPayee: [spId: bigint, payee: Address]
  setDealDurationLimits: [spId: bigint, min: number, max: number]
  commitCapacity: [spId: bigint, bytes: bigint, dealId: bigint]
  releaseCapacity: [spId: bigint, bytes: bigint]
  registerProviderFor: [
    actorId: bigint,
    organization: Address,
    capabilities: ProviderCapabilities,
    pricePerSectorPerMonth: bigint,
    availableBytes: bigint,
    payee: Address,
    minDealDurationDays: number,
    maxDealDurationDays: number,
  ]
}

export type PoRepMarketWriteArgs = {
  rejectDeal: [dealId: bigint]
  terminateDeal: [dealId: bigint, terminator: Address, endEpoch: bigint]
  updateValidator: [dealId: bigint]
  updateRailId: [dealId: bigint, railId: bigint]
  updateManifestLocation: [dealId: bigint, location: string]
  setClientSmartContract: [addr: Address]
}

type Args<TMap, TFn extends keyof TMap> = TMap[TFn] extends unknown[] ? TMap[TFn] : never

export function useSpRegistryWrite<TFn extends keyof SpRegistryWriteArgs>(
  functionName: TFn,
  onSubmit?: () => void
) {
  const queryClient = useQueryClient()
  const [{ SP_REGISTRY }, { SpRegistryAbi }] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const execute = (...args: Args<SpRegistryWriteArgs, TFn>) =>
    writeContractAsync({
      address: SP_REGISTRY,
      abi: SpRegistryAbi as Record<string, unknown>[],
      functionName,
      args: args as Record<string, unknown>[],
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['spIds'] })
      queryClient.invalidateQueries({ queryKey: ['spInfos'] })
      queryClient.invalidateQueries({ queryKey: ['myProviderIds'] })
      queryClient.invalidateQueries({ queryKey: ['myProviderInfos'] })
      onSubmit?.()
    })

  return { execute, isPending, isConfirming, isSuccess }
}

export function usePoRepMarketWrite<TFn extends keyof PoRepMarketWriteArgs>(
  functionName: TFn,
  onSubmit?: () => void
) {
  const queryClient = useQueryClient()
  const [{ POREP_MARKET }, { PoRepMarketAbi }] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const execute = (...args: Args<PoRepMarketWriteArgs, TFn>) =>
    writeContractAsync({
      address: POREP_MARKET,
      abi: PoRepMarketAbi as Record<string, unknown>[],
      functionName,
      args: args as Record<string, unknown>[],
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      queryClient.invalidateQueries({ queryKey: ['completedDeals'] })
      queryClient.invalidateQueries({ queryKey: ['deal'] })
      onSubmit?.()
    })

  return { execute, isPending, isConfirming, isSuccess }
}
