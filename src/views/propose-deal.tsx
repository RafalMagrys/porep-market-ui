'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useProposeDeal } from '@/hooks/useProposeDeal'
import { proposeDealSchema, type ProposeDealFormValues } from '@/validators/proposeDeal'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export function ProposeDealPage() {
  const router = useRouter()
  const { proposeDeal, isPending, isConfirming, isSuccess, onSuccess } = useProposeDeal()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposeDealFormValues>({
    resolver: zodResolver(proposeDealSchema),
    defaultValues: {
      retrievabilityBps: 9000,
      bandwidthMbps: 100,
      latencyMs: 500,
      indexingPct: 90,
      durationDays: 180,
    },
  })

  async function onSubmit(values: ProposeDealFormValues) {
    await proposeDeal(
      {
        retrievabilityBps: values.retrievabilityBps,
        bandwidthMbps: values.bandwidthMbps,
        latencyMs: values.latencyMs,
        indexingPct: values.indexingPct,
      },
      {
        dealSizeBytes: BigInt(values.dealSizeBytes),
        pricePerSectorPerMonth: BigInt(values.pricePerSectorPerMonth),
        durationDays: values.durationDays,
      },
      values.manifestLocation,
    )
    onSuccess()
    router.push('/')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Propose New Deal</h1>
        <p className="text-sm text-muted-foreground">
          Submit a new storage deal proposal to the PoRep Market
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manifest</CardTitle>
            <CardDescription>Location where the data manifest can be retrieved</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="manifestLocation">Manifest Location</Label>
            <Input
              id="manifestLocation"
              placeholder="ipfs://... or https://..."
              className="mt-1"
              {...register('manifestLocation')}
            />
            <FieldError message={errors.manifestLocation?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deal Terms</CardTitle>
            <CardDescription>Storage parameters and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dealSizeBytes">Deal Size (bytes)</Label>
              <Input
                id="dealSizeBytes"
                placeholder="e.g. 34359738368 (32 GiB)"
                className="mt-1"
                {...register('dealSizeBytes')}
              />
              <FieldError message={errors.dealSizeBytes?.message} />
            </div>
            <Separator />
            <div>
              <Label htmlFor="pricePerSectorPerMonth">Price per Sector per Month (attoFIL)</Label>
              <Input
                id="pricePerSectorPerMonth"
                placeholder="e.g. 0"
                className="mt-1"
                {...register('pricePerSectorPerMonth')}
              />
              <FieldError message={errors.pricePerSectorPerMonth?.message} />
            </div>
            <Separator />
            <div>
              <Label htmlFor="durationDays">Duration (days, max 1278)</Label>
              <Input
                id="durationDays"
                type="number"
                placeholder="180"
                className="mt-1"
                {...register('durationDays', { valueAsNumber: true })}
              />
              <FieldError message={errors.durationDays?.message} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">SLI Requirements</CardTitle>
            <CardDescription>Minimum service level indicators the provider must meet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="retrievabilityBps">Retrievability (basis points, 0–10000)</Label>
              <Input
                id="retrievabilityBps"
                type="number"
                placeholder="9000"
                className="mt-1"
                {...register('retrievabilityBps', { valueAsNumber: true })}
              />
              <FieldError message={errors.retrievabilityBps?.message} />
            </div>
            <Separator />
            <div>
              <Label htmlFor="bandwidthMbps">Min Bandwidth (Mbps)</Label>
              <Input
                id="bandwidthMbps"
                type="number"
                placeholder="100"
                className="mt-1"
                {...register('bandwidthMbps', { valueAsNumber: true })}
              />
              <FieldError message={errors.bandwidthMbps?.message} />
            </div>
            <Separator />
            <div>
              <Label htmlFor="latencyMs">Max Latency (ms)</Label>
              <Input
                id="latencyMs"
                type="number"
                placeholder="500"
                className="mt-1"
                {...register('latencyMs', { valueAsNumber: true })}
              />
              <FieldError message={errors.latencyMs?.message} />
            </div>
            <Separator />
            <div>
              <Label htmlFor="indexingPct">Min Indexing (%, 0–100)</Label>
              <Input
                id="indexingPct"
                type="number"
                placeholder="90"
                className="mt-1"
                {...register('indexingPct', { valueAsNumber: true })}
              />
              <FieldError message={errors.indexingPct?.message} />
            </div>
          </CardContent>
        </Card>

        {isSuccess && (
          <div className="rounded-md border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400">
            Deal proposed successfully! Redirecting…
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending || isConfirming}>
          {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming transaction…' : 'Propose Deal'}
        </Button>
      </form>
    </div>
  )
}
