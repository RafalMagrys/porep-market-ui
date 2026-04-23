'use client'

import { useState, useCallback } from 'react'
import { usePublicClient, useWriteContract } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import {
  fetchManifest,
  batchPieces,
  buildTransferArgs,
  buildMockBatches,
  type Piece,
} from '@/lib/operator-data'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2_000

export type TransferStatus =
  | { phase: 'idle' }
  | { phase: 'loading-manifest' }
  | {
      phase: 'running'
      batchIndex: number
      totalBatches: number
      retryAttempt: number
      txHash?: `0x${string}`
    }
  | { phase: 'confirming'; batchIndex: number; totalBatches: number; txHash: `0x${string}` }
  | { phase: 'done'; totalBatches: number }
  | { phase: 'error'; batchIndex: number; totalBatches: number; message: string }

interface UseTransferDatacapOptions {
  dealId: bigint
  providerId: bigint
  durationDays: number
  dealSizeBytes: bigint
  manifestLocation: string
  mocked?: boolean
  mockPieceCount?: number
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function useTransferDatacap({
  dealId,
  providerId,
  durationDays,
  dealSizeBytes,
  manifestLocation,
  mocked = false,
  mockPieceCount = 1,
}: UseTransferDatacapOptions) {
  const publicClient = usePublicClient()
  const [{ CLIENT_CONTRACT }, { ClientAbi }] = useContracts()
  const { writeContractAsync } = useWriteContract()

  const [status, setStatus] = useState<TransferStatus>({ phase: 'idle' })
  const [batches, setBatches] = useState<Piece[][]>([])
  const [resumeFrom, setResumeFrom] = useState(0)

  const sendBatch = useCallback(
    async (
      getArgs: () => ReturnType<typeof buildTransferArgs>,
      batchIndex: number,
      totalBatches: number
    ) => {
      let lastError: Error | null = null
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          setStatus({ phase: 'running', batchIndex, totalBatches, retryAttempt: attempt })

          const hash = await writeContractAsync({
            address: CLIENT_CONTRACT,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            abi: ClientAbi as any,
            functionName: 'transfer',
            args: getArgs() as unknown as [unknown, bigint, boolean],
          })

          setStatus({ phase: 'confirming', batchIndex, totalBatches, txHash: hash })
          await publicClient!.waitForTransactionReceipt({ hash })
          return
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))
          if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
        }
      }
      throw lastError
    },
    [publicClient, CLIENT_CONTRACT, ClientAbi, writeContractAsync]
  )

  const executeBatches = useCallback(
    async (allBatches: Piece[][], startIndex: number) => {
      const block = await publicClient!.getBlockNumber()

      for (let i = startIndex; i < allBatches.length; i++) {
        const batch = allBatches[i]
        const isCompleted = i === allBatches.length - 1
        try {
          await sendBatch(
            () => buildTransferArgs(providerId, batch, dealId, durationDays, block, isCompleted),
            i,
            allBatches.length
          )
        } catch (err) {
          setResumeFrom(i)
          setStatus({
            phase: 'error',
            batchIndex: i,
            totalBatches: allBatches.length,
            message: err instanceof Error ? err.message : String(err),
          })
          return
        }
      }

      setStatus({ phase: 'done', totalBatches: allBatches.length })
    },
    [publicClient, sendBatch, dealId, providerId, durationDays]
  )

  const executeMock = useCallback(async () => {
    const mockBatches = buildMockBatches(providerId, dealSizeBytes, mockPieceCount, dealId)
    for (let i = 0; i < mockBatches.length; i++) {
      try {
        await sendBatch(() => mockBatches[i], i, mockBatches.length)
      } catch (err) {
        setResumeFrom(i)
        setStatus({
          phase: 'error',
          batchIndex: i,
          totalBatches: mockBatches.length,
          message: err instanceof Error ? err.message : String(err),
        })
        return
      }
    }
    setStatus({ phase: 'done', totalBatches: mockBatches.length })
  }, [sendBatch, providerId, dealSizeBytes, mockPieceCount, dealId])

  const start = useCallback(async () => {
    if (!publicClient) return
    if (mocked) {
      const total = Math.ceil(mockPieceCount / 10)
      setStatus({ phase: 'running', batchIndex: 0, totalBatches: total, retryAttempt: 0 })
      return executeMock()
    }
    setStatus({ phase: 'loading-manifest' })
    try {
      const pieces = await fetchManifest(manifestLocation)
      const allBatches = batchPieces(pieces)
      setBatches(allBatches)
      setResumeFrom(0)
      await executeBatches(allBatches, 0)
    } catch (err) {
      setStatus({
        phase: 'error',
        batchIndex: 0,
        totalBatches: 0,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }, [publicClient, mocked, mockPieceCount, manifestLocation, executeBatches, executeMock])

  const retry = useCallback(async () => {
    if (mocked) return executeMock()
    if (batches.length === 0) return start()
    await executeBatches(batches, resumeFrom)
  }, [mocked, batches, resumeFrom, start, executeBatches, executeMock])

  return { status, start, retry }
}
