'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import type { DealRequirements, DealTerms } from '@/types'

export function useProposeDeal() {
  const queryClient = useQueryClient()
  const [{ POREP_MARKET }, {PoRepMarketAbi}] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  async function proposeDeal(requirements: DealRequirements, terms: DealTerms, manifestLocation: string) {
    return writeContractAsync({
      address: POREP_MARKET,
      abi: PoRepMarketAbi,
      functionName: 'proposeDeal',
      args: [requirements, terms, manifestLocation],
    })
  }

  function onSuccess() {
    queryClient.invalidateQueries({ queryKey: ['deals'] })
  }

  return { proposeDeal, hash, isPending, isConfirming, isSuccess, onSuccess }
}
