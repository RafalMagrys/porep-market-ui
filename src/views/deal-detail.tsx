'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { zeroAddress } from 'viem'

import { Button, buttonVariants } from '@/components/ui/button'
import { DealStateBadge } from '@/components/deal-state-badge'
import { DealDetailsCard } from '@/components/deal-details-card'
import { DealAttestationCard } from '@/components/deal-attestation-card'
import { TransferDatacapCard } from '@/components/transfer-datacap-card'
import { InitDealCard } from '@/components/init-deal-card'
import { AllocationVerificationCard } from '@/components/allocation-verification-card'
import { useDeal } from '@/hooks/useDeal'
import { useAcceptDeal } from '@/hooks/useAcceptDeal'
import { useDealTermination } from '@/hooks/useDealTermination'
import { DealState } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface DealDetailPageProps {
  dealId: bigint
}

export function DealDetailPage({ dealId }: DealDetailPageProps) {
  const { data: deal, isLoading, error } = useDeal(dealId)
  const { acceptDeal, isPending, isConfirming, isSuccess, onSuccess } = useAcceptDeal(dealId)
  const { data: termination } = useDealTermination(dealId)

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
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          {error ? `Failed to load deal: ${error.message}` : 'Deal not found.'}
        </div>
      </div>
    )
  }

  const canAccept = deal.state === DealState.Proposed
  const canAllocate = deal.state === DealState.Accepted
  const isCompleted = deal.state === DealState.Completed
  // init is complete when validator is deployed and rail is initialized
  const initComplete = deal.validator !== zeroAddress && deal.railId !== 0n

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

      <div className="columns-1 gap-4 lg:columns-2">
        <div className="mb-4 break-inside-avoid">
          <DealDetailsCard deal={deal} termination={termination} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <DealAttestationCard providerId={deal.provider} requirements={deal.requirements} />
        </div>
        {canAllocate && !initComplete && (
          <div className="mb-4 break-inside-avoid">
            <InitDealCard deal={deal} />
          </div>
        )}
        {canAllocate && initComplete && (
          <div className="mb-4 break-inside-avoid">
            <TransferDatacapCard deal={deal} />
          </div>
        )}
        {isCompleted && (
          <div className="mb-4 break-inside-avoid">
            <AllocationVerificationCard deal={deal} />
          </div>
        )}
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
