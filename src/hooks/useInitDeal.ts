'use client'

import { useState, useCallback } from 'react'
import { usePublicClient, useWriteContract, useReadContract, useSignTypedData, useAccount, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { maxUint256, zeroAddress } from 'viem'
import type { Address } from 'viem'

import { useContracts } from '@/contexts/network-context'
import type { DealProposal } from '@/types'

export type InitStep = 'deploy-validator' | 'deposit-approve' | 'init-rail'

export type InitPhase =
  | { type: 'idle' }
  | { type: 'signing' }
  | { type: 'running'; step: InitStep }
  | { type: 'confirming'; step: InitStep; txHash: `0x${string}` }
  | { type: 'error'; step: InitStep; message: string }

const BYTES_PER_SECTOR = 32n * 1024n * 1024n * 1024n

function ceilDiv(a: bigint, b: bigint): bigint {
  return (a + b - 1n) / b
}

export function calculateDepositAmount(deal: DealProposal, months = 1n): bigint {
  const sectors = ceilDiv(deal.terms.dealSizeBytes, BYTES_PER_SECTOR)
  return sectors * deal.terms.pricePerSectorPerMonth * months
}

export function useInitDeal(deal: DealProposal) {
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()
  const [contracts, abis] = useContracts()
  const { address: clientAddress } = useAccount()
  const chainId = useChainId()
  const { writeContractAsync } = useWriteContract()
  const { signTypedDataAsync } = useSignTypedData()

  const [phase, setPhase] = useState<InitPhase>({ type: 'idle' })

  const validatorDeployed = deal.validator !== zeroAddress

  const { data: operatorApprovalData, refetch: refetchApproval } = useReadContract({
    address: contracts.FILECOIN_PAY,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: abis.FileCoinPayAbi as any,
    functionName: 'operatorApprovals',
    args: [contracts.USDC_TOKEN, clientAddress as Address, deal.validator],
    query: { enabled: validatorDeployed && !!clientAddress },
  })

  const operatorApproved = (operatorApprovalData as { isApproved?: boolean } | undefined)?.isApproved === true
  const railCreated = deal.railId !== 0n

  const nextStep: InitStep | 'complete' = !validatorDeployed
    ? 'deploy-validator'
    : !operatorApproved
      ? 'deposit-approve'
      : !railCreated
        ? 'init-rail'
        : 'complete'

  const { data: usdcName } = useReadContract({
    address: contracts.USDC_TOKEN,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: abis.UsdcAbi as any,
    functionName: 'name',
  })

  const { data: usdcBalance } = useReadContract({
    address: contracts.USDC_TOKEN,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: abis.UsdcAbi as any,
    functionName: 'balanceOf',
    args: [clientAddress as Address],
    query: { enabled: !!clientAddress },
  })

  const { refetch: refetchNonce } = useReadContract({
    address: contracts.USDC_TOKEN,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: abis.UsdcAbi as any,
    functionName: 'nonces',
    args: [clientAddress as Address],
    query: { enabled: !!clientAddress },
  })

  const depositAmount = calculateDepositAmount(deal)

  const execute = useCallback(async () => {
    if (!publicClient || !clientAddress) return

    try {
      if (nextStep === 'deploy-validator') {
        setPhase({ type: 'running', step: 'deploy-validator' })
        const hash = await writeContractAsync({
          address: contracts.VALIDATOR_FACTORY,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          abi: abis.ValidatorFactoryAbi as any,
          functionName: 'create',
          args: [deal.dealId],
        })
        setPhase({ type: 'confirming', step: 'deploy-validator', txHash: hash })
        await publicClient.waitForTransactionReceipt({ hash })
        queryClient.invalidateQueries({ queryKey: ['deal', deal.dealId.toString()] })
        queryClient.invalidateQueries({ queryKey: ['deals'] })
        setPhase({ type: 'idle' })
      } else if (nextStep === 'deposit-approve') {
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
        const { data: currentNonce } = await refetchNonce()

        setPhase({ type: 'signing' })
        const sig = await signTypedDataAsync({
          domain: {
            name: usdcName as string,
            version: '1',
            chainId,
            verifyingContract: contracts.USDC_TOKEN,
          },
          types: {
            Permit: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'nonce', type: 'uint256' },
              { name: 'deadline', type: 'uint256' },
            ],
          },
          primaryType: 'Permit',
          message: {
            owner: clientAddress,
            spender: contracts.FILECOIN_PAY,
            value: depositAmount,
            nonce: currentNonce as bigint,
            deadline,
          },
        })

        // Parse r, s, v from 65-byte compact signature: 0x + r(32 bytes) + s(32 bytes) + v(1 byte)
        const r = sig.slice(0, 66) as `0x${string}`
        const s = `0x${sig.slice(66, 130)}` as `0x${string}`
        const v = parseInt(sig.slice(130, 132), 16)

        setPhase({ type: 'running', step: 'deposit-approve' })
        const hash = await writeContractAsync({
          address: contracts.FILECOIN_PAY,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          abi: abis.FileCoinPayAbi as any,
          functionName: 'depositWithPermitAndApproveOperator',
          args: [
            contracts.USDC_TOKEN,
            clientAddress,
            depositAmount,
            deadline,
            v,
            r,
            s,
            deal.validator,
            maxUint256,
            maxUint256,
            maxUint256,
          ],
        })
        setPhase({ type: 'confirming', step: 'deposit-approve', txHash: hash })
        await publicClient.waitForTransactionReceipt({ hash })
        await refetchApproval()
        setPhase({ type: 'idle' })
      } else if (nextStep === 'init-rail') {
        setPhase({ type: 'running', step: 'init-rail' })
        const hash = await writeContractAsync({
          address: deal.validator,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          abi: abis.ValidatorAbi as any,
          functionName: 'createRail',
          args: [contracts.USDC_TOKEN],
        })
        setPhase({ type: 'confirming', step: 'init-rail', txHash: hash })
        await publicClient.waitForTransactionReceipt({ hash })
        queryClient.invalidateQueries({ queryKey: ['deal', deal.dealId.toString()] })
        queryClient.invalidateQueries({ queryKey: ['deals'] })
        setPhase({ type: 'idle' })
      }
    } catch (err) {
      setPhase({
        type: 'error',
        step: nextStep as InitStep,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }, [
    nextStep,
    publicClient,
    clientAddress,
    chainId,
    deal,
    contracts,
    abis,
    depositAmount,
    usdcName,
    writeContractAsync,
    signTypedDataAsync,
    queryClient,
    refetchApproval,
    refetchNonce,
  ])

  return {
    phase,
    nextStep,
    validatorDeployed,
    operatorApproved,
    railCreated,
    depositAmount,
    usdcBalance: usdcBalance as bigint | undefined,
    execute,
  }
}
