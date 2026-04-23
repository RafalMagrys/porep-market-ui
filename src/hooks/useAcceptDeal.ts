'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { useContracts } from '@/contexts/network-context'

export function useAcceptDeal(dealId: bigint) {
  const queryClient = useQueryClient()
  const [contracts, abis] = useContracts()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  async function acceptDeal() {
    return writeContractAsync({
      address: contracts.POREP_MARKET,
      abi: abis.PoRepMarketAbi,
      functionName: 'acceptDeal',
      args: [dealId],
    })
  }

  function onSuccess() {
    queryClient.invalidateQueries({ queryKey: ['deal', dealId.toString()] })
    queryClient.invalidateQueries({ queryKey: ['deals'] })
  }

  return { acceptDeal, hash, isPending, isConfirming, isSuccess, onSuccess }
}
