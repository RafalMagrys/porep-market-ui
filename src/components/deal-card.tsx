import Link from 'next/link'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { DealStateBadge } from '@/components/deal-state-badge'
import { formatBytes, formatAddress } from '@/lib/format'
import type { DealProposal } from '@/types'

export function DealCard({ deal }: { deal: DealProposal }) {
  return (
    <Link href={`/deals/${deal.dealId}`}>
      <Card className="hover:border-primary/50 cursor-pointer transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-muted-foreground">#{deal.dealId.toString()}</span>
            <DealStateBadge state={deal.state} />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 pb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Client</span>
            <span className="font-mono text-xs">{formatAddress(deal.client)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-mono text-xs">SP {deal.provider.toString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Size</span>
            <span className="text-xs">{formatBytes(deal.terms.dealSizeBytes)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="text-xs">{deal.terms.durationDays} days</span>
          </div>
        </CardContent>
        {deal.manifestLocation && (
          <CardFooter>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {deal.manifestLocation}
            </p>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
