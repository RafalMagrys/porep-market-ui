'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, ChevronDown } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAllocationVerification, type MatchStatus } from '@/hooks/useAllocationVerification'
import type { DealProposal } from '@/types'

interface Props {
  deal: DealProposal
}

const STATUS_ICON: Record<MatchStatus, React.ReactNode> = {
  matched: <CheckCircle2 className="size-4 shrink-0 text-green-500" />,
  'missing-in-state': <XCircle className="size-4 shrink-0 text-destructive" />,
  'missing-in-manifest': <AlertCircle className="size-4 shrink-0 text-yellow-500" />,
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  matched: 'Matched',
  'missing-in-state': 'Not in Filecoin state',
  'missing-in-manifest': 'Not in manifest',
}

export function AllocationVerificationCard({ deal }: Props) {
  const { data, isLoading, error, refetch, isFetching } = useAllocationVerification(deal)
  const [expanded, setExpanded] = useState(false)

  const hasIssues = data && data.matched < data.contractCount

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Allocation Verification</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="size-7">
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Fetching allocations from contract, manifest, and Filecoin state…
          </div>
        )}

        {error && (
          <div className="border-destructive/50 bg-destructive/10 flex items-start gap-2 rounded-md border p-3">
            <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
            <p className="text-destructive text-xs break-words">{(error as Error).message}</p>
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Contract', value: data.contractCount },
                { label: 'Manifest', value: data.manifestCount },
                { label: 'Matched', value: data.matched, highlight: data.matched === data.contractCount && data.matched > 0 },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="bg-muted rounded-md p-2">
                  <p className={`text-lg font-bold tabular-nums ${highlight ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {value}
                  </p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
              ))}
            </div>

            {data.contractCount === 0 ? (
              <p className="text-muted-foreground text-sm">No allocations found for this deal yet.</p>
            ) : data.matched === data.contractCount ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-4 shrink-0" />
                All {data.matched} allocation{data.matched !== 1 ? 's' : ''} verified
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="size-4 shrink-0" />
                {data.matched} of {data.contractCount} allocation{data.contractCount !== 1 ? 's' : ''} matched
              </div>
            )}

            {data.entries.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                >
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  />
                  {expanded ? 'Hide' : 'Show'} {data.entries.length} allocation{data.entries.length !== 1 ? 's' : ''}
                  {hasIssues && (
                    <span className="ml-1 text-yellow-600 dark:text-yellow-400">
                      · {data.contractCount - data.matched} issue{data.contractCount - data.matched !== 1 ? 's' : ''}
                    </span>
                  )}
                </button>

                {expanded && (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-muted-foreground pb-1 text-left font-medium">Alloc ID</th>
                          <th className="text-muted-foreground pb-1 text-left font-medium">Piece CID</th>
                          <th className="text-muted-foreground pb-1 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {data.entries.map((entry) => (
                          <tr key={entry.allocationId.toString()} className="hover:bg-muted/50">
                            <td className="py-1.5 pr-3 font-mono tabular-nums">{entry.allocationId.toString()}</td>
                            <td className="py-1.5 pr-3 font-mono">
                              {entry.pieceCid ? (
                                <span className="block max-w-[180px] truncate" title={entry.pieceCid}>
                                  {entry.pieceCid.slice(0, 12)}…{entry.pieceCid.slice(-6)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="py-1.5">
                              <span className="flex items-center gap-1">
                                {STATUS_ICON[entry.matchStatus]}
                                {STATUS_LABEL[entry.matchStatus]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
