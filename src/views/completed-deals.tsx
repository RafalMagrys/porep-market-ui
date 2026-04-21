'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DealCard } from '@/components/deal-card'
import { useCompletedDeals } from '@/hooks/useCompletedDeals'

export function CompletedDealsPage() {
  const { data: deals, isLoading, error } = useCompletedDeals()
  const [search, setSearch] = useState('')

  const filtered = deals?.filter((deal) => {
    const q = search.toLowerCase()
    return (
      deal.dealId.toString().includes(q) ||
      deal.client.toLowerCase().includes(q) ||
      deal.provider.toString().includes(q) ||
      deal.manifestLocation.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Completed Deals</h1>
        <p className="text-sm text-muted-foreground">
          All successfully completed storage deals
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by deal ID, client, provider, or manifest…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load deals: {error.message}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && filtered?.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          {search ? 'No completed deals match your search.' : 'No completed deals yet.'}
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deal) => (
            <DealCard key={deal.dealId.toString()} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
