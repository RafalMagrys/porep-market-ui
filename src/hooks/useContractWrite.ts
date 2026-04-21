'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { ProviderCapabilities } from '@/types'

export type SpRegistryWriteArgs = {
  pauseProvider: [id: bigint]
  unpauseProvider: [id: bigint]
  blockProvider: [id: bigint]
  unblockProvider: [id: bigint]
  setToleranceBps: [bps: bigint]
  setCapabilities: [spId: bigint, caps: ProviderCapabilities]
  setPrice: [spId: bigint, priceAttoFil: bigint]
  updateAvailableSpace: [spId: bigint, bytes: bigint]
  setPayee: [spId: bigint, payee: `0x${string}`]
  setDealDurationLimits: [spId: bigint, min: number, max: number]
  commitCapacity: [spId: bigint, bytes: bigint, dealId: bigint]
  releaseCapacity: [spId: bigint, bytes: bigint]
  registerProviderFor: [actorId: bigint, organization: `0x${string}`, capabilities: ProviderCapabilities, pricePerSectorPerMonth: bigint, availableBytes: bigint, payee: `0x${string}`, minDealDurationDays: number, maxDealDurationDays: number]
}

export type PoRepMarketWriteArgs = {
  rejectDeal: [dealId: bigint]
  terminateDeal: [dealId: bigint, terminator: `0x${string}`, endEpoch: bigint]
  updateValidator: [dealId: bigint]
  updateRailId: [dealId: bigint, railId: bigint]
  updateManifestLocation: [dealId: bigint, location: string]
  setClientSmartContract: [addr: `0x${string}`]
}

type Args<TMap, TFn extends keyof TMap> = TMap[TFn] extends unknown[] ? TMap[TFn] : never

export function useSpRegistryWrite<TFn extends keyof SpRegistryWriteArgs>(
  functionName: TFn,
  onSubmit?: () => void,
) {
  const queryClient = useQueryClient()
  const [{ SP_REGISTRY }, { SpRegistryAbi }] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = (...args: Args<SpRegistryWriteArgs, TFn>) =>
    writeContractAsync({ address: SP_REGISTRY, abi: SpRegistryAbi as any, functionName, args: args as any })
      .then(() => {
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
  onSubmit?: () => void,
) {
  const queryClient = useQueryClient()
  const [{ POREP_MARKET }, { PoRepMarketAbi }] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = (...args: Args<PoRepMarketWriteArgs, TFn>) =>
    writeContractAsync({ address: POREP_MARKET, abi: PoRepMarketAbi as any, functionName, args: args as any })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
        queryClient.invalidateQueries({ queryKey: ['completedDeals'] })
        queryClient.invalidateQueries({ queryKey: ['deal'] })
        onSubmit?.()
      })

  return { execute, isPending, isConfirming, isSuccess }
}
