'use client'

import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

import { useContracts } from '@/contexts/network-context'
import { fetchManifest } from '@/lib/operator-data'
import type { DealProposal } from '@/types'

export type MatchStatus = 'matched' | 'missing-in-state' | 'missing-in-manifest'

export interface AllocationEntry {
  allocationId: bigint
  pieceCid: string | null
  matchStatus: MatchStatus
}

export interface AllocationVerification {
  contractCount: number
  manifestCount: number
  stateCount: number
  matched: number
  entries: AllocationEntry[]
}

interface StateAllocation {
  Data: { '/': string }
  Size: number
  TermMin: number
  TermMax: number
  Expiration: number
  Client: number
  Provider: number
}

async function stateGetAllocations(rpcUrl: string, actorId: string): Promise<Record<string, StateAllocation>> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'Filecoin.StateGetAllocations',
      params: [actorId, null],
    }),
  })
  const json = await res.json()
  if (json.error) throw new Error(`StateGetAllocations: ${JSON.stringify(json.error)}`)
  return json.result ?? {}
}

async function ethAddressToActorId(rpcUrl: string, ethAddress: string): Promise<string> {
  // EthAddressToFilecoinAddress → f4 address
  const f4Res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'Filecoin.EthAddressToFilecoinAddress',
      params: [ethAddress],
    }),
  })
  const f4Json = await f4Res.json()
  if (f4Json.error) throw new Error(`EthAddressToFilecoinAddress: ${JSON.stringify(f4Json.error)}`)
  const f4Address: string = f4Json.result

  // StateLookupID → f0 actor ID
  const idRes = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'Filecoin.StateLookupID',
      params: [f4Address, null],
    }),
  })
  const idJson = await idRes.json()
  if (idJson.error) throw new Error(`StateLookupID: ${JSON.stringify(idJson.error)}`)
  return idJson.result // e.g. "f01234"
}

export function useAllocationVerification(deal: DealProposal | undefined) {
  const publicClient = usePublicClient()
  const [contracts, abis] = useContracts()

  return useQuery({
    queryKey: ['allocationVerification', deal?.dealId?.toString(), contracts.CLIENT_CONTRACT],
    queryFn: async (): Promise<AllocationVerification> => {
      const rpcUrl = publicClient!.transport.url as string

      // 1. Contract: allocation IDs for this deal
      const contractIds = (await publicClient!.readContract({
        address: contracts.CLIENT_CONTRACT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abi: abis.ClientAbi as any,
        functionName: 'getClientAllocationIdsPerDeal',
        args: [deal!.dealId],
      })) as bigint[]

      // 2. Manifest: piece CIDs
      const pieces = await fetchManifest(deal!.manifestLocation)
      const manifestCids = new Set(pieces.map((p) => p.pieceCid))

      // 3. Filecoin state: all allocations for the Client contract actor
      const actorId = await ethAddressToActorId(rpcUrl, contracts.CLIENT_CONTRACT)
      const stateAllocations = await stateGetAllocations(rpcUrl, actorId)

      // Cross-reference: for each contract allocation ID, look up in state and check manifest
      const entries: AllocationEntry[] = contractIds.map((id) => {
        const stateEntry = stateAllocations[id.toString()]
        if (!stateEntry) {
          return { allocationId: id, pieceCid: null, matchStatus: 'missing-in-state' }
        }
        const cid = stateEntry.Data['/']
        const inManifest = manifestCids.has(cid)
        return {
          allocationId: id,
          pieceCid: cid,
          matchStatus: inManifest ? 'matched' : 'missing-in-manifest',
        }
      })

      return {
        contractCount: contractIds.length,
        manifestCount: pieces.length,
        stateCount: Object.keys(stateAllocations).length,
        matched: entries.filter((e) => e.matchStatus === 'matched').length,
        entries,
      }
    },
    enabled: !!publicClient && !!deal && !!deal.manifestLocation,
    retry: false,
  })
}
