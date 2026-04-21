import { ExternalLink } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatAddress, formatBytes, formatFil } from '@/lib/format'
import type { DealProposal } from '@/types'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate text-right">{value}</span>
    </div>
  )
}

export function DealDetailsCard({ deal }: { deal: DealProposal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Client" value={<span className="font-mono text-xs">{deal.client}</span>} />
        <Separator />
        <Row label="Provider" value={<span className="font-mono">SP {deal.provider.toString()}</span>} />
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
          value={<span className="font-mono text-xs">{deal.railId === 0n ? '—' : deal.railId.toString()}</span>}
        />
        <Separator />
        <Row label="Size" value={formatBytes(deal.terms.dealSizeBytes)} />
        <Separator />
        <Row label="Price / sector / month" value={formatFil(deal.terms.pricePerSectorPerMonth)} />
        <Separator />
        <Row label="Duration" value={`${deal.terms.durationDays} days`} />
        <Separator />
        <Row label="Retrievability" value={`${(deal.requirements.retrievabilityBps / 100).toFixed(1)}%`} />
        <Separator />
        <Row label="Bandwidth" value={`${deal.requirements.bandwidthMbps} Mbps`} />
        <Separator />
        <Row label="Latency" value={`${deal.requirements.latencyMs} ms`} />
        <Separator />
        <Row label="Indexing" value={`${deal.requirements.indexingPct}%`} />
        {deal.manifestLocation && (
          <>
            <Separator />
            <div className="flex items-start justify-between gap-2 text-sm">
              <span className="shrink-0 text-muted-foreground">Manifest</span>
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {deal.manifestLocation}
                </span>
                {deal.manifestLocation.startsWith('http') && (
                  <a href={deal.manifestLocation} target="_blank" rel="noreferrer" className="shrink-0">
                    <ExternalLink className="size-3 text-muted-foreground hover:text-foreground" />
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
