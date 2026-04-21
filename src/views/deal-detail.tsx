'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { DealStateBadge } from '@/components/deal-state-badge'
import { formatAddress, formatBytes, formatFil } from '@/lib/format'
import { useDeal } from '@/hooks/useDeal'
import { useAcceptDeal } from '@/hooks/useAcceptDeal'
import { DealState } from '@/types'

interface DealDetailPageProps {
  dealId: bigint
}

export function DealDetailPage({ dealId }: DealDetailPageProps) {
  const { data: deal, isLoading, error } = useDeal(dealId)
  const { acceptDeal, isPending, isConfirming, isSuccess, onSuccess } = useAcceptDeal(dealId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error ? `Failed to load deal: ${error.message}` : 'Deal not found.'}
        </div>
      </div>
    )
  }

  const canAccept = deal.state === DealState.Proposed

  async function handleAccept() {
    await acceptDeal()
    onSuccess()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Deal #{deal.dealId.toString()}</h1>
          <DealStateBadge state={deal.state} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Client</span>
              <span className="font-mono text-xs">{deal.client}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-mono">SP {deal.provider.toString()}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Validator</span>
              <span className="font-mono text-xs">
                {deal.validator === '0x0000000000000000000000000000000000000000'
                  ? '—'
                  : formatAddress(deal.validator)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rail ID</span>
              <span className="font-mono text-xs">
                {deal.railId === 0n ? '—' : deal.railId.toString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deal Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Size</span>
              <span>{formatBytes(deal.terms.dealSizeBytes)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price / sector / month</span>
              <span>{formatFil(deal.terms.pricePerSectorPerMonth)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span>{deal.terms.durationDays} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">SLI Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Retrievability</span>
              <span>{(deal.requirements.retrievabilityBps / 100).toFixed(1)}%</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bandwidth</span>
              <span>{deal.requirements.bandwidthMbps} Mbps</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Latency</span>
              <span>{deal.requirements.latencyMs} ms</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Indexing</span>
              <span>{deal.requirements.indexingPct}%</span>
            </div>
          </CardContent>
        </Card>

        {deal.manifestLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manifest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {deal.manifestLocation}
                </p>
                {deal.manifestLocation.startsWith('http') && (
                  <a
                    href={deal.manifestLocation}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <ExternalLink className="size-4 text-muted-foreground hover:text-foreground" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {canAccept && (
        <div className="flex justify-end">
          <Button
            onClick={handleAccept}
            disabled={isPending || isConfirming}
          >
            {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Accept Deal'}
          </Button>
        </div>
      )}

      {isSuccess && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400">
          Deal accepted successfully!
        </div>
      )}
    </div>
  )
}
