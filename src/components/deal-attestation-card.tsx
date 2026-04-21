'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAttestation } from '@/hooks/useAttestation'
import { useSPScore } from '@/hooks/useSPScore'
import type { DealRequirements } from '@/types'

function ScoreBar({ score }: { score: bigint }) {
  const pct = Math.min(Number(score), 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Score</span>
        <span className="font-semibold tabular-nums">{pct.toFixed(2)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SLIRow({ label, deal, attested, higherIsBetter = true }: {
  label: string
  deal: number
  attested: number
  higherIsBetter?: boolean
}) {
  const meets = higherIsBetter ? attested >= deal : attested <= deal
  return (
    <div className="grid grid-cols-3 items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-center tabular-nums">{deal}</span>
      <span className={`text-right tabular-nums font-medium ${meets ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
        {attested}
      </span>
    </div>
  )
}

interface DealAttestationCardProps {
  providerId: bigint
  requirements: DealRequirements
}

export function DealAttestationCard({ providerId, requirements }: DealAttestationCardProps) {
  const { data: attestation, isLoading: attLoading } = useAttestation(providerId)
  const { data: score, isLoading: scoreLoading } = useSPScore(providerId, requirements)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SP Score</CardTitle>
        </CardHeader>
        <CardContent>
          {scoreLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : score !== undefined ? (
            <ScoreBar score={score} />
          ) : (
            <p className="text-sm text-muted-foreground">Score unavailable</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLI Attestation</CardTitle>
        </CardHeader>
        <CardContent>
          {attLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : attestation ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated block</span>
                <span className="font-mono">{attestation.lastUpdate.toString()}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                <span />
                <span className="text-center">Deal</span>
                <span className="text-right">SP</span>
              </div>
              <SLIRow
                label="Retrievability"
                deal={requirements.retrievabilityBps}
                attested={attestation.slis.retrievabilityBps}
              />
              <SLIRow
                label="Bandwidth (Mbps)"
                deal={requirements.bandwidthMbps}
                attested={attestation.slis.bandwidthMbps}
              />
              <SLIRow
                label="Latency (ms)"
                deal={requirements.latencyMs}
                attested={attestation.slis.latencyMs}
                higherIsBetter={false}
              />
              <SLIRow
                label="Indexing (%)"
                deal={requirements.indexingPct}
                attested={attestation.slis.indexingPct}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attestation available for this SP</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
