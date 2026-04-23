'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, PlusCircle } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DealCard } from '@/components/deal-card'
import { cn } from '@/lib/utils'
import { useDeals } from '@/hooks/useDeals'

export function HomePage() {
  const { data: deals, isLoading, error } = useDeals()
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Open Deals</h1>
          <p className="text-muted-foreground text-sm">
            Browse all active deal proposals on the PoRep Market
          </p>
        </div>
        <Link href="/deals/propose" className={buttonVariants()}>
          <PlusCircle className="mr-2 size-4" />
          Propose New Deal
        </Link>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by deal ID, client, provider, or manifest…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
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
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground">
            {search ? 'No deals match your search.' : 'No open deals yet.'}
          </p>
          {!search && (
            <Link href="/deals/propose" className={cn(buttonVariants({ variant: 'outline' }))}>
              <PlusCircle className="mr-2 size-4" />
              Propose the first deal
            </Link>
          )}
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
