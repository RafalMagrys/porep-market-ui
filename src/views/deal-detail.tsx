'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { DealStateBadge } from '@/components/deal-state-badge'
import { DealDetailsCard } from '@/components/deal-details-card'
import { DealAttestationCard } from '@/components/deal-attestation-card'
import { useDeal } from '@/hooks/useDeal'
import { useAcceptDeal } from '@/hooks/useAcceptDeal'
import { DealState } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

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
        <DealDetailsCard deal={deal} />
        <DealAttestationCard providerId={deal.provider} requirements={deal.requirements} />
      </div>

      {canAccept && (
        <div className="flex justify-end">
          <Button onClick={handleAccept} disabled={isPending || isConfirming}>
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
