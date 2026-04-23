'use client'

import { ExternalLink } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAddress, formatBytes, formatFil } from '@/lib/format'
import { useDealAllocations } from '@/hooks/useDealAllocations'
import type { DealProposal, DealTermination } from '@/types'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="truncate text-right">{value}</span>
    </div>
  )
}

interface DealDetailsCardProps {
  deal: DealProposal
  termination?: DealTermination | null
}

export function DealDetailsCard({ deal, termination }: DealDetailsCardProps) {
  const { data: allocations, isLoading: allocLoading } = useDealAllocations(deal.dealId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Client" value={<span className="font-mono text-xs">{deal.client}</span>} />
        <Separator />
        <Row
          label="Provider"
          value={<span className="font-mono">SP {deal.provider.toString()}</span>}
        />
        <Separator />
        <Row
          label="Validator"
          value={
            <span className="font-mono text-xs">
              {deal.validator === '0x0000000000000000000000000000000000000000'
                ? '—'
                : formatAddress(deal.validator)}
            </span>
          }
        />
        <Separator />
        <Row
          label="Rail ID"
          value={
            <span className="font-mono text-xs">
              {deal.railId === 0n ? '—' : deal.railId.toString()}
            </span>
          }
        />
        <Separator />
        <Row
          label="Proposed at block"
          value={<span className="font-mono text-xs">{deal.proposedAtBlock.toString()}</span>}
        />
        <Separator />
        <Row label="Size" value={formatBytes(deal.terms.dealSizeBytes)} />
        <Separator />
        <Row label="Price / sector / month" value={formatFil(deal.terms.pricePerSectorPerMonth)} />
        <Separator />
        <Row label="Duration" value={`${deal.terms.durationDays} days`} />
        <Separator />
        <Row
          label="Retrievability"
          value={`${(deal.requirements.retrievabilityBps / 100).toFixed(1)}%`}
        />
        <Separator />
        <Row label="Bandwidth" value={`${deal.requirements.bandwidthMbps} Mbps`} />
        <Separator />
        <Row label="Latency" value={`${deal.requirements.latencyMs} ms`} />
        <Separator />
        <Row label="Indexing" value={`${deal.requirements.indexingPct}%`} />
        <Separator />
        <div className="flex items-start justify-between gap-2 text-sm">
          <span className="text-muted-foreground shrink-0">Allocations</span>
          {allocLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : allocations && allocations.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-1">
              {allocations.map(({ id, terminated }) => (
                <Badge
                  key={id.toString()}
                  variant={terminated ? 'destructive' : 'secondary'}
                  className="font-mono text-xs"
                  title={terminated ? 'Terminated early' : 'Active'}
                >
                  {id.toString()}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
        {termination && (
          <>
            <Separator />
            <Row
              label="Terminated by"
              value={
                <span className="font-mono text-xs">{formatAddress(termination.terminator)}</span>
              }
            />
            <Separator />
            <Row
              label="End epoch"
              value={<span className="font-mono text-xs">{termination.endEpoch.toString()}</span>}
            />
          </>
        )}
        {deal.manifestLocation && (
          <>
            <Separator />
            <div className="flex items-start justify-between gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">Manifest</span>
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-muted-foreground truncate font-mono text-xs">
                  {deal.manifestLocation}
                </span>
                {deal.manifestLocation.startsWith('http') && (
                  <a
                    href={deal.manifestLocation}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <ExternalLink className="text-muted-foreground hover:text-foreground size-3" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
