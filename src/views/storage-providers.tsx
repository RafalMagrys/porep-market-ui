'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { SPCard } from '@/components/sp-card'
import { useSPs } from '@/hooks/useSPs'
import { formatAddress } from '@/lib/format'
import type { ProviderInfo } from '@/types'
import type { Address } from 'viem'

type SPEntry = { id: bigint; info: ProviderInfo }

function SPGrid({ sps }: { sps: SPEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sps.map(({ id, info }) => (
        <SPCard key={id.toString()} id={id} info={info} />
      ))}
    </div>
  )
}

export function StorageProvidersPage() {
  const { providers, isLoading, error } = useSPs()
  const [search, setSearch] = useState('')

  const filtered = providers.filter(({ id, info }) => {
    const q = search.toLowerCase()
    return (
      id.toString().includes(q) ||
      info.organization.toLowerCase().includes(q) ||
      info.payee.toLowerCase().includes(q)
    )
  })

  // Group by organization address
  const orgMap = new Map<string, SPEntry[]>()
  for (const sp of filtered) {
    const org = sp.info.organization.toLowerCase()
    if (!orgMap.has(org)) orgMap.set(org, [])
    orgMap.get(org)!.push(sp)
  }

  const orgGroups = [...orgMap.entries()]
    .filter(([, sps]) => sps.length > 1)
    .map(([org, sps]) => ({ org: org as Address, sps }))

  const soloSPs = [...orgMap.entries()]
    .filter(([, sps]) => sps.length === 1)
    .flatMap(([, sps]) => sps)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Storage Providers</h1>
        <p className="text-muted-foreground text-sm">
          Registered providers and their capabilities on the PoRep Market
        </p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by SP ID or organization address…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Failed to load providers: {(error as Error).message}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">
          {search ? 'No providers match your search.' : 'No storage providers registered yet.'}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-8">
          {orgGroups.map(({ org, sps }) => (
            <div key={org} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-mono text-xs">{formatAddress(org)}</span>
                <Badge variant="secondary">{sps.length} SPs</Badge>
                <div className="bg-border h-px flex-1" />
              </div>
              <SPGrid sps={sps} />
            </div>
          ))}

          {soloSPs.length > 0 && (
            <div className="flex flex-col gap-3">
              {orgGroups.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">Independent</span>
                  <div className="bg-border h-px flex-1" />
                </div>
              )}
              <SPGrid sps={soloSPs} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
