'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccount } from 'wagmi'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TxButton, TxSuccess, FieldError } from '@/components/tx-button'
import { formatBytes, formatFil } from '@/lib/format'
import { useMyProviders } from '@/hooks/useMyProviders'
import { useSpRegistryWrite } from '@/hooks/useContractWrite'
import {
  capabilitiesSchema,
  priceSchema,
  availableSpaceSchema,
  payeeSchema,
  dealDurationLimitsSchema,
  registerSPSchema,
  commitCapacitySchema,
  releaseCapacitySchema,
  type CapabilitiesFormValues,
  type RegisterSPFormValues,
  type CommitCapacityFormValues,
} from '@/validators/manageSP'
import type { ProviderInfo } from '@/types'

function SPSelector({
  providers,
  selectedId,
  onSelect,
}: {
  providers: { id: bigint; info: ProviderInfo }[]
  selectedId: bigint | null
  onSelect: (id: bigint) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Label>SP</Label>
      <Select value={selectedId?.toString() ?? ''} onValueChange={(v) => v && onSelect(BigInt(v))}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select SP…" />
        </SelectTrigger>
        <SelectContent>
          {providers.map(({ id, info }) => (
            <SelectItem key={id.toString()} value={id.toString()}>
              SP {id.toString()} {info.paused ? '(paused)' : info.blocked ? '(blocked)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CapabilitiesTab({ spId, info }: { spId: bigint; info: ProviderInfo }) {
  const {
    execute: setCapabilities,
    isPending,
    isConfirming,
    isSuccess,
  } = useSpRegistryWrite('setCapabilities')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CapabilitiesFormValues>({
    resolver: zodResolver(capabilitiesSchema),
    defaultValues: info.capabilities,
  })

  return (
    <form onSubmit={handleSubmit((v) => setCapabilities(spId, v))} className="space-y-4">
      <div>
        <Label>Retrievability (bps, 0–10000)</Label>
        <Input
          type="number"
          className="mt-1"
          {...register('retrievabilityBps', { valueAsNumber: true })}
        />
        <FieldError message={errors.retrievabilityBps?.message} />
      </div>
      <div>
        <Label>Bandwidth (Mbps)</Label>
        <Input
          type="number"
          className="mt-1"
          {...register('bandwidthMbps', { valueAsNumber: true })}
        />
        <FieldError message={errors.bandwidthMbps?.message} />
      </div>
      <div>
        <Label>Latency (ms)</Label>
        <Input type="number" className="mt-1" {...register('latencyMs', { valueAsNumber: true })} />
        <FieldError message={errors.latencyMs?.message} />
      </div>
      <div>
        <Label>Indexing (%)</Label>
        <Input
          type="number"
          className="mt-1"
          {...register('indexingPct', { valueAsNumber: true })}
        />
        <FieldError message={errors.indexingPct?.message} />
      </div>
      <div className="flex items-center gap-3">
        <TxButton
          type="submit"
          label="Update Capabilities"
          isPending={isPending}
          isConfirming={isConfirming}
        />
        {isSuccess && <TxSuccess message="Capabilities updated!" />}
      </div>
    </form>
  )
}

function PricingTab({ spId, info }: { spId: bigint; info: ProviderInfo }) {
  const {
    execute: setPrice,
    isPending: pricePending,
    isConfirming: priceConfirming,
    isSuccess: priceSuccess,
  } = useSpRegistryWrite('setPrice')
  const {
    execute: updateAvailableSpace,
    isPending: spacePending,
    isConfirming: spaceConfirming,
    isSuccess: spaceSuccess,
  } = useSpRegistryWrite('updateAvailableSpace')
  const {
    execute: setDealDurationLimits,
    isPending: durPending,
    isConfirming: durConfirming,
    isSuccess: durSuccess,
  } = useSpRegistryWrite('setDealDurationLimits')

  const priceForm = useForm({
    resolver: zodResolver(priceSchema),
    defaultValues: { priceAttoFil: info.pricePerSectorPerMonth.toString() },
  })
  const spaceForm = useForm({
    resolver: zodResolver(availableSpaceSchema),
    defaultValues: { bytes: info.availableBytes.toString() },
  })
  const durForm = useForm({
    resolver: zodResolver(dealDurationLimitsSchema),
    defaultValues: { minDays: info.minDealDurationDays, maxDays: info.maxDealDurationDays },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium">
          Current: {formatFil(info.pricePerSectorPerMonth)} / sector / month
        </p>
        <form
          onSubmit={priceForm.handleSubmit((v) => setPrice(spId, BigInt(v.priceAttoFil)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Price (attoFIL / sector / month)</Label>
            <Input className="mt-1" {...priceForm.register('priceAttoFil')} />
            <FieldError message={priceForm.formState.errors.priceAttoFil?.message} />
          </div>
          <TxButton
            type="submit"
            label="Set Price"
            isPending={pricePending}
            isConfirming={priceConfirming}
          />
          {priceSuccess && <TxSuccess message="Price updated!" />}
        </form>
      </div>

      <Separator />

      <div>
        <p className="mb-3 text-sm font-medium">Available: {formatBytes(info.availableBytes)}</p>
        <form
          onSubmit={spaceForm.handleSubmit((v) => updateAvailableSpace(spId, BigInt(v.bytes)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Available Space (bytes)</Label>
            <Input className="mt-1" {...spaceForm.register('bytes')} />
            <FieldError message={spaceForm.formState.errors.bytes?.message} />
          </div>
          <TxButton
            type="submit"
            label="Update"
            isPending={spacePending}
            isConfirming={spaceConfirming}
          />
          {spaceSuccess && <TxSuccess message="Space updated!" />}
        </form>
      </div>

      <Separator />

      <div>
        <p className="mb-3 text-sm font-medium">
          Duration: {info.minDealDurationDays}–{info.maxDealDurationDays} days
        </p>
        <form
          onSubmit={durForm.handleSubmit((v) => setDealDurationLimits(spId, v.minDays, v.maxDays))}
          className="space-y-3"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Min days</Label>
              <Input
                type="number"
                className="mt-1"
                {...durForm.register('minDays', { valueAsNumber: true })}
              />
              <FieldError message={durForm.formState.errors.minDays?.message} />
            </div>
            <div className="flex-1">
              <Label>Max days</Label>
              <Input
                type="number"
                className="mt-1"
                {...durForm.register('maxDays', { valueAsNumber: true })}
              />
              <FieldError message={durForm.formState.errors.maxDays?.message} />
            </div>
          </div>
          <FieldError message={durForm.formState.errors.maxDays?.message} />
          <div className="flex items-center gap-3">
            <TxButton
              type="submit"
              label="Set Duration Limits"
              isPending={durPending}
              isConfirming={durConfirming}
            />
            {durSuccess && <TxSuccess message="Duration limits updated!" />}
          </div>
        </form>
      </div>
    </div>
  )
}

function PayeeTab({ spId, info }: { spId: bigint; info: ProviderInfo }) {
  const { execute: setPayee, isPending, isConfirming, isSuccess } = useSpRegistryWrite('setPayee')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(payeeSchema), defaultValues: { payee: info.payee } })
  return (
    <form
      onSubmit={handleSubmit((v) => setPayee(spId, v.payee as `0x${string}`))}
      className="space-y-4"
    >
      <p className="text-muted-foreground text-sm">
        Current: <span className="font-mono">{info.payee}</span>
      </p>
      <div>
        <Label>New Payee Address</Label>
        <Input className="mt-1 font-mono" placeholder="0x…" {...register('payee')} />
        <FieldError message={errors.payee?.message} />
      </div>
      <div className="flex items-center gap-3">
        <TxButton
          type="submit"
          label="Set Payee"
          isPending={isPending}
          isConfirming={isConfirming}
        />
        {isSuccess && <TxSuccess message="Payee updated!" />}
      </div>
    </form>
  )
}

function CapacityTab({ spId, info }: { spId: bigint; info: ProviderInfo }) {
  const {
    execute: commitCapacity,
    isPending: cPending,
    isConfirming: cConfirming,
    isSuccess: cSuccess,
  } = useSpRegistryWrite('commitCapacity')
  const {
    execute: releaseCapacity,
    isPending: rPending,
    isConfirming: rConfirming,
    isSuccess: rSuccess,
  } = useSpRegistryWrite('releaseCapacity')

  const commitForm = useForm<CommitCapacityFormValues>({
    resolver: zodResolver(commitCapacitySchema),
  })
  const releaseForm = useForm({ resolver: zodResolver(releaseCapacitySchema) })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-muted-foreground">Committed</div>
        <div>{formatBytes(info.committedBytes)}</div>
        <div className="text-muted-foreground">Pending</div>
        <div>{formatBytes(info.pendingBytes)}</div>
        <div className="text-muted-foreground">Available</div>
        <div>{formatBytes(info.availableBytes)}</div>
      </div>

      <Separator />

      <form
        onSubmit={commitForm.handleSubmit((v) =>
          commitCapacity(spId, BigInt(v.bytes), BigInt(v.dealId))
        )}
        className="space-y-3"
      >
        <p className="text-sm font-medium">Commit Capacity</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Bytes</Label>
            <Input className="mt-1" placeholder="bytes" {...commitForm.register('bytes')} />
            <FieldError message={commitForm.formState.errors.bytes?.message} />
          </div>
          <div className="flex-1">
            <Label>Deal ID</Label>
            <Input className="mt-1" placeholder="deal ID" {...commitForm.register('dealId')} />
            <FieldError message={commitForm.formState.errors.dealId?.message} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TxButton type="submit" label="Commit" isPending={cPending} isConfirming={cConfirming} />
          {cSuccess && <TxSuccess message="Committed!" />}
        </div>
      </form>

      <Separator />

      <form
        onSubmit={releaseForm.handleSubmit((v) => releaseCapacity(spId, BigInt(v.bytes)))}
        className="space-y-3"
      >
        <p className="text-sm font-medium">Release Capacity</p>
        <div>
          <Label>Bytes</Label>
          <Input className="mt-1" placeholder="bytes" {...releaseForm.register('bytes')} />
          <FieldError message={releaseForm.formState.errors.bytes?.message as string} />
        </div>
        <div className="flex items-center gap-3">
          <TxButton
            type="submit"
            label="Release"
            isPending={rPending}
            isConfirming={rConfirming}
            variant="outline"
          />
          {rSuccess && <TxSuccess message="Released!" />}
        </div>
      </form>
    </div>
  )
}

function RegisterSPForm() {
  const {
    execute: registerProvider,
    isPending,
    isConfirming,
    isSuccess,
  } = useSpRegistryWrite('registerProviderFor')
  const { address } = useAccount()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSPFormValues>({
    resolver: zodResolver(registerSPSchema),
    defaultValues: {
      organization: address ?? '',
      payee: address ?? '',
      minDealDurationDays: 1,
      maxDealDurationDays: 540,
      retrievabilityBps: 9000,
      bandwidthMbps: 100,
      latencyMs: 500,
      indexingPct: 90,
    },
  })

  async function onSubmit(v: RegisterSPFormValues) {
    await registerProvider(
      BigInt(v.actorId),
      v.organization as `0x${string}`,
      {
        retrievabilityBps: v.retrievabilityBps,
        bandwidthMbps: v.bandwidthMbps,
        latencyMs: v.latencyMs,
        indexingPct: v.indexingPct,
      },
      BigInt(v.pricePerSectorPerMonth),
      BigInt(v.availableBytes),
      v.payee as `0x${string}`,
      v.minDealDurationDays,
      v.maxDealDurationDays
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Miner Actor ID</Label>
          <Input className="mt-1" placeholder="e.g. 1000" {...register('actorId')} />
          <FieldError message={errors.actorId?.message} />
        </div>
        <div>
          <Label>Organization Address</Label>
          <Input className="mt-1 font-mono" placeholder="0x…" {...register('organization')} />
          <FieldError message={errors.organization?.message} />
        </div>
        <div>
          <Label>Payee Address</Label>
          <Input className="mt-1 font-mono" placeholder="0x…" {...register('payee')} />
          <FieldError message={errors.payee?.message} />
        </div>
        <div>
          <Label>Price / sector / month (attoFIL)</Label>
          <Input className="mt-1" placeholder="0" {...register('pricePerSectorPerMonth')} />
          <FieldError message={errors.pricePerSectorPerMonth?.message} />
        </div>
        <div>
          <Label>Available Bytes</Label>
          <Input className="mt-1" placeholder="bytes" {...register('availableBytes')} />
          <FieldError message={errors.availableBytes?.message} />
        </div>
        <div>
          <Label>Min Deal Duration (days)</Label>
          <Input
            type="number"
            className="mt-1"
            {...register('minDealDurationDays', { valueAsNumber: true })}
          />
          <FieldError message={errors.minDealDurationDays?.message} />
        </div>
        <div>
          <Label>Max Deal Duration (days)</Label>
          <Input
            type="number"
            className="mt-1"
            {...register('maxDealDurationDays', { valueAsNumber: true })}
          />
          <FieldError message={errors.maxDealDurationDays?.message} />
        </div>
        <div>
          <Label>Retrievability (bps)</Label>
          <Input
            type="number"
            className="mt-1"
            {...register('retrievabilityBps', { valueAsNumber: true })}
          />
          <FieldError message={errors.retrievabilityBps?.message} />
        </div>
        <div>
          <Label>Bandwidth (Mbps)</Label>
          <Input
            type="number"
            className="mt-1"
            {...register('bandwidthMbps', { valueAsNumber: true })}
          />
          <FieldError message={errors.bandwidthMbps?.message} />
        </div>
        <div>
          <Label>Latency (ms)</Label>
          <Input
            type="number"
            className="mt-1"
            {...register('latencyMs', { valueAsNumber: true })}
          />
          <FieldError message={errors.latencyMs?.message} />
        </div>
        <div>
          <Label>Indexing (%)</Label>
          <Input
            type="number"
            className="mt-1"
            {...register('indexingPct', { valueAsNumber: true })}
          />
          <FieldError message={errors.indexingPct?.message} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TxButton
          type="submit"
          label="Register Provider"
          isPending={isPending}
          isConfirming={isConfirming}
        />
        {isSuccess && <TxSuccess message="Provider registered!" />}
      </div>
    </form>
  )
}

export function SPManagePage() {
  const { address, isConnected } = useAccount()
  const { providers, isLoading } = useMyProviders()
  const [selectedId, setSelectedId] = useState<bigint | null>(null)

  const selected =
    selectedId !== null
      ? (providers.find((p) => p.id === selectedId) ?? null)
      : (providers[0] ?? null)

  const activeId = selected?.id ?? null

  if (!isConnected) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p className="text-muted-foreground">
          Connect your wallet to manage your Storage Provider.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Storage Provider</h1>
        <p className="text-muted-foreground text-sm">
          Update your SP settings, capabilities, and capacity
        </p>
      </div>

      {isLoading && <Skeleton className="h-10 w-48" />}

      {!isLoading && providers.length > 0 && (
        <SPSelector providers={providers} selectedId={activeId} onSelect={setSelectedId} />
      )}

      <Tabs defaultValue="capabilities" className="w-full">
        <TabsList>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Space</TabsTrigger>
          <TabsTrigger value="payee">Payee</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="register">Register New SP</TabsTrigger>
        </TabsList>

        {selected && activeId !== null ? (
          <>
            <TabsContent value="capabilities">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SLI Capabilities</CardTitle>
                  <CardDescription>Minimum service levels this SP guarantees</CardDescription>
                </CardHeader>
                <CardContent>
                  <CapabilitiesTab spId={activeId} info={selected.info} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pricing & Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <PricingTab spId={activeId} info={selected.info} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payee">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payee</CardTitle>
                  <CardDescription>Address that receives deal payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <PayeeTab spId={activeId} info={selected.info} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capacity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Capacity Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CapacityTab spId={activeId} info={selected.info} />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <TabsContent value="capabilities">
            <p className="text-muted-foreground py-8 text-center text-sm">
              No SPs found for <span className="font-mono">{address}</span>. Register one below.
            </p>
          </TabsContent>
        )}

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Register New Storage Provider</CardTitle>
              <CardDescription>Requires MARKET_ROLE on the SP Registry</CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterSPForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
