import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatBytes, formatAddress } from '@/lib/format'
import type { ProviderInfo } from '@/types'

interface SPCardProps {
  id: bigint
  info: ProviderInfo
}

export function SPCard({ id, info }: SPCardProps) {
  const isActive = !info.paused && !info.blocked

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">SP {id.toString()}</CardTitle>
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {info.blocked ? 'Blocked' : info.paused ? 'Paused' : 'Active'}
          </Badge>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{formatAddress(info.organization)}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="text-muted-foreground">Available</div>
        <div className="text-right">{formatBytes(info.availableBytes)}</div>

        <div className="text-muted-foreground">Committed</div>
        <div className="text-right">{formatBytes(info.committedBytes)}</div>

        <div className="text-muted-foreground">Retrievability</div>
        <div className="text-right">{(info.capabilities.retrievabilityBps / 100).toFixed(1)}%</div>

        <div className="text-muted-foreground">Bandwidth</div>
        <div className="text-right">{info.capabilities.bandwidthMbps} Mbps</div>

        <div className="text-muted-foreground">Latency</div>
        <div className="text-right">{info.capabilities.latencyMs} ms</div>

        <div className="text-muted-foreground">Duration</div>
        <div className="text-right">
          {info.minDealDurationDays}–{info.maxDealDurationDays} days
        </div>
      </CardContent>
    </Card>
  )
}
