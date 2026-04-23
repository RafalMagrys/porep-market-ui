'use client'

import { useState } from 'react'
import { CheckCircle2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTransferDatacap } from '@/hooks/useTransferDatacap'
import type { DealProposal } from '@/types'

interface TransferDatacapCardProps {
  deal: DealProposal
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>
          Batch {value} / {max}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function TransferDatacapCard({ deal }: TransferDatacapCardProps) {
  const [mocked, setMocked] = useState(false)
  const [mockPieceCount, setMockPieceCount] = useState(1)

  const { status, start, retry } = useTransferDatacap({
    dealId: deal.dealId,
    providerId: deal.provider,
    durationDays: deal.terms.durationDays,
    dealSizeBytes: deal.terms.dealSizeBytes,
    manifestLocation: deal.manifestLocation,
    mocked,
    mockPieceCount,
  })

  const isRunning =
    status.phase === 'running' ||
    status.phase === 'confirming' ||
    status.phase === 'loading-manifest'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">DataCap Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.phase === 'idle' && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Transfer DataCap to the Filecoin verified registry for each piece in the deal
              manifest. Pieces are processed in batches of 10.
            </p>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="border-input accent-primary size-4 rounded"
                checked={mocked}
                onChange={(e) => setMocked(e.target.checked)}
              />
              <Label className="cursor-pointer font-normal">
                Mock allocation
                <span className="text-muted-foreground ml-1 text-xs">
                  (devnet testing — uses hardcoded sample CommP)
                </span>
              </Label>
            </label>

            {mocked && (
              <div className="flex items-center gap-2">
                <Label htmlFor="mock-piece-count" className="shrink-0 text-sm">
                  Pieces
                </Label>
                <input
                  id="mock-piece-count"
                  type="number"
                  min={1}
                  max={10000}
                  value={mockPieceCount}
                  onChange={(e) => setMockPieceCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border-input bg-background w-24 rounded-md border px-2 py-1 text-sm tabular-nums"
                />
                <span className="text-muted-foreground text-xs">
                  → {Math.ceil(mockPieceCount / 10)}{' '}
                  {Math.ceil(mockPieceCount / 10) === 1 ? 'batch' : 'batches'}
                </span>
              </div>
            )}

            <Button onClick={start} disabled={!mocked && !deal.manifestLocation}>
              Start Allocation
            </Button>
          </div>
        )}

        {status.phase === 'loading-manifest' && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Fetching manifest…
          </div>
        )}

        {(status.phase === 'running' || status.phase === 'confirming') && (
          <div className="space-y-3">
            <ProgressBar value={status.batchIndex} max={status.totalBatches} />
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              {status.phase === 'running'
                ? status.retryAttempt > 0
                  ? `Sending batch ${status.batchIndex + 1}… (retry ${status.retryAttempt}/3)`
                  : `Sending batch ${status.batchIndex + 1}…`
                : `Confirming batch ${status.batchIndex + 1}…`}
            </div>
            {status.phase === 'confirming' && (
              <p className="text-muted-foreground truncate font-mono text-xs">{status.txHash}</p>
            )}
          </div>
        )}

        {status.phase === 'done' && (
          <div className="space-y-3">
            <ProgressBar value={status.totalBatches} max={status.totalBatches} />
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="size-4 shrink-0" />
              All {status.totalBatches} {status.totalBatches === 1 ? 'batch' : 'batches'} completed
            </div>
          </div>
        )}

        {status.phase === 'error' && (
          <div className="space-y-3">
            {status.totalBatches > 0 && (
              <ProgressBar value={status.batchIndex} max={status.totalBatches} />
            )}
            <div className="border-destructive/50 bg-destructive/10 flex items-start gap-2 rounded-md border p-3">
              <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 space-y-1">
                <p className="text-destructive text-sm font-medium">
                  {status.totalBatches > 0
                    ? `Failed on batch ${status.batchIndex + 1} of ${status.totalBatches}`
                    : 'Failed'}
                </p>
                <p className="text-muted-foreground text-xs break-words">{status.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={retry} disabled={isRunning}>
                <RefreshCw className="mr-2 size-4" />
                Retry{status.totalBatches > 0 ? ` from batch ${status.batchIndex + 1}` : ''}
              </Button>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="border-input accent-primary size-4 rounded"
                  checked={mocked}
                  onChange={(e) => setMocked(e.target.checked)}
                  disabled={isRunning}
                />
                <span className="text-muted-foreground">Mock</span>
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
