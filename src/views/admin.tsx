'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccount } from 'wagmi'
import { ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { NetworkContractTable } from '@/components/network-selector'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useToleranceBps, useGrantRevokeRole } from '@/hooks/useAdminSP'
import { useSpRegistryWrite, usePoRepMarketWrite } from '@/hooks/useContractWrite'
import {
  terminateDealSchema,
  rejectDealSchema,
  updateRailIdSchema,
  updateManifestSchema,
  setClientContractSchema,
  spActionSchema,
  toleranceBpsSchema,
  grantRevokeRoleSchema,
  type TerminateDealFormValues,
  type UpdateRailIdFormValues,
  type UpdateManifestFormValues,
  type GrantRevokeRoleFormValues,
} from '@/validators/admin'

function SPAdminTab() {
  const {
    execute: pauseProvider,
    isPending: pausePending,
    isConfirming: pauseConfirming,
  } = useSpRegistryWrite('pauseProvider')
  const {
    execute: unpauseProvider,
    isPending: unpausePending,
    isConfirming: unpauseConfirming,
    isSuccess: unpauseSuccess,
  } = useSpRegistryWrite('unpauseProvider')
  const {
    execute: blockProvider,
    isPending: blockPending,
    isConfirming: blockConfirming,
  } = useSpRegistryWrite('blockProvider')
  const {
    execute: unblockProvider,
    isPending: unblockPending,
    isConfirming: unblockConfirming,
    isSuccess: unblockSuccess,
  } = useSpRegistryWrite('unblockProvider')
  const {
    execute: setToleranceBps,
    isPending: tolPending,
    isConfirming: tolConfirming,
    isSuccess: tolSuccess,
  } = useSpRegistryWrite('setToleranceBps')
  const {
    grantRole,
    revokeRole,
    isPending: rolePending,
    isConfirming: roleConfirming,
    isSuccess: roleSuccess,
  } = useGrantRevokeRole()
  const { data: toleranceBps } = useToleranceBps()

  const pauseForm = useForm({ resolver: zodResolver(spActionSchema) })
  const unpauseForm = useForm({ resolver: zodResolver(spActionSchema) })
  const blockForm = useForm({ resolver: zodResolver(spActionSchema) })
  const unblockForm = useForm({ resolver: zodResolver(spActionSchema) })
  const tolForm = useForm({
    resolver: zodResolver(toleranceBpsSchema),
    defaultValues: { bps: toleranceBps ? Number(toleranceBps) : 0 },
  })
  const roleForm = useForm<GrantRevokeRoleFormValues>({
    resolver: zodResolver(grantRevokeRoleSchema),
    defaultValues: { target: 'registry' },
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <form
          onSubmit={pauseForm.handleSubmit((v) => pauseProvider(BigInt(v.spId)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Pause SP</Label>
            <Input className="mt-1" placeholder="SP ID" {...pauseForm.register('spId')} />
            <FieldError message={pauseForm.formState.errors.spId?.message as string} />
          </div>
          <TxButton
            type="submit"
            label="Pause"
            isPending={pausePending}
            isConfirming={pauseConfirming}
            variant="outline"
          />
        </form>

        <form
          onSubmit={unpauseForm.handleSubmit((v) => unpauseProvider(BigInt(v.spId)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Unpause SP</Label>
            <Input className="mt-1" placeholder="SP ID" {...unpauseForm.register('spId')} />
          </div>
          <TxButton
            type="submit"
            label="Unpause"
            isPending={unpausePending}
            isConfirming={unpauseConfirming}
          />
          {unpauseSuccess && <TxSuccess />}
        </form>

        <form
          onSubmit={blockForm.handleSubmit((v) => blockProvider(BigInt(v.spId)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Block SP</Label>
            <Input className="mt-1" placeholder="SP ID" {...blockForm.register('spId')} />
          </div>
          <TxButton
            type="submit"
            label="Block"
            isPending={blockPending}
            isConfirming={blockConfirming}
            variant="destructive"
          />
        </form>

        <form
          onSubmit={unblockForm.handleSubmit((v) => unblockProvider(BigInt(v.spId)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Unblock SP</Label>
            <Input className="mt-1" placeholder="SP ID" {...unblockForm.register('spId')} />
          </div>
          <TxButton
            type="submit"
            label="Unblock"
            isPending={unblockPending}
            isConfirming={unblockConfirming}
          />
          {unblockSuccess && <TxSuccess />}
        </form>
      </div>

      <Separator />

      <form
        onSubmit={tolForm.handleSubmit((v) => setToleranceBps(BigInt(v.bps)))}
        className="flex items-end gap-3"
      >
        <div>
          <Label>
            Tolerance BPS{' '}
            {toleranceBps !== undefined && (
              <span className="text-muted-foreground">(current: {toleranceBps.toString()})</span>
            )}
          </Label>
          <Input
            type="number"
            className="mt-1 w-40"
            {...tolForm.register('bps', { valueAsNumber: true })}
          />
          <FieldError message={tolForm.formState.errors.bps?.message} />
        </div>
        <TxButton
          type="submit"
          label="Set Tolerance"
          isPending={tolPending}
          isConfirming={tolConfirming}
        />
        {tolSuccess && <TxSuccess message="Tolerance updated!" />}
      </form>

      <Separator />

      <form
        onSubmit={roleForm.handleSubmit((v) =>
          grantRole(v.target, v.role as `0x${string}`, v.account as `0x${string}`)
        )}
        className="space-y-3"
      >
        <p className="text-sm font-medium">Grant / Revoke Role</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Contract</Label>
            <Select
              defaultValue="registry"
              onValueChange={(v) => roleForm.setValue('target', v as 'registry' | 'market')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registry">SP Registry</SelectItem>
                <SelectItem value="market">PoRep Market</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Role (bytes32)</Label>
            <Input className="mt-1 font-mono" placeholder="0x…" {...roleForm.register('role')} />
            <FieldError message={roleForm.formState.errors.role?.message} />
          </div>
          <div className="sm:col-span-3">
            <Label>Account</Label>
            <Input className="mt-1 font-mono" placeholder="0x…" {...roleForm.register('account')} />
            <FieldError message={roleForm.formState.errors.account?.message} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TxButton
            type="submit"
            label="Grant Role"
            isPending={rolePending}
            isConfirming={roleConfirming}
          />
          <Button
            type="button"
            variant="destructive"
            disabled={rolePending || roleConfirming}
            onClick={roleForm.handleSubmit((v) =>
              revokeRole(v.target, v.role as `0x${string}`, v.account as `0x${string}`)
            )}
          >
            Revoke Role
          </Button>
          {roleSuccess && <TxSuccess />}
        </div>
      </form>
    </div>
  )
}

function DealAdminTab() {
  const {
    execute: rejectDeal,
    isPending: rejPending,
    isConfirming: rejConfirming,
    isSuccess: rejSuccess,
  } = usePoRepMarketWrite('rejectDeal')
  const {
    execute: terminateDeal,
    isPending: termPending,
    isConfirming: termConfirming,
    isSuccess: termSuccess,
  } = usePoRepMarketWrite('terminateDeal')
  const {
    execute: updateValidator,
    isPending: valPending,
    isConfirming: valConfirming,
    isSuccess: valSuccess,
  } = usePoRepMarketWrite('updateValidator')
  const {
    execute: updateRailId,
    isPending: railPending,
    isConfirming: railConfirming,
    isSuccess: railSuccess,
  } = usePoRepMarketWrite('updateRailId')
  const {
    execute: updateManifestLocation,
    isPending: manPending,
    isConfirming: manConfirming,
    isSuccess: manSuccess,
  } = usePoRepMarketWrite('updateManifestLocation')
  const {
    execute: setClientContract,
    isPending: ccPending,
    isConfirming: ccConfirming,
    isSuccess: ccSuccess,
  } = usePoRepMarketWrite('setClientSmartContract')

  const rejectForm = useForm({ resolver: zodResolver(rejectDealSchema) })
  const termForm = useForm<TerminateDealFormValues>({ resolver: zodResolver(terminateDealSchema) })
  const valForm = useForm({ resolver: zodResolver(rejectDealSchema) }) // same shape
  const railForm = useForm<UpdateRailIdFormValues>({ resolver: zodResolver(updateRailIdSchema) })
  const manForm = useForm<UpdateManifestFormValues>({ resolver: zodResolver(updateManifestSchema) })
  const ccForm = useForm({ resolver: zodResolver(setClientContractSchema) })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <form
          onSubmit={rejectForm.handleSubmit((v) => rejectDeal(BigInt(v.dealId)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Reject Deal</Label>
            <Input className="mt-1" placeholder="Deal ID" {...rejectForm.register('dealId')} />
            <FieldError message={rejectForm.formState.errors.dealId?.message as string} />
          </div>
          <TxButton
            type="submit"
            label="Reject"
            isPending={rejPending}
            isConfirming={rejConfirming}
            variant="destructive"
          />
          {rejSuccess && <TxSuccess />}
        </form>

        <form
          onSubmit={valForm.handleSubmit((v) => updateValidator(BigInt(v.dealId)))}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Label>Update Validator</Label>
            <Input className="mt-1" placeholder="Deal ID" {...valForm.register('dealId')} />
          </div>
          <TxButton
            type="submit"
            label="Update"
            isPending={valPending}
            isConfirming={valConfirming}
          />
          {valSuccess && <TxSuccess />}
        </form>
      </div>

      <Separator />

      <form
        onSubmit={termForm.handleSubmit((v) =>
          terminateDeal(BigInt(v.dealId), v.terminator as `0x${string}`, BigInt(v.endEpoch))
        )}
        className="space-y-3"
      >
        <p className="text-sm font-medium">Terminate Deal</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Deal ID</Label>
            <Input className="mt-1" placeholder="ID" {...termForm.register('dealId')} />
            <FieldError message={termForm.formState.errors.dealId?.message} />
          </div>
          <div>
            <Label>Terminator</Label>
            <Input
              className="mt-1 font-mono"
              placeholder="0x…"
              {...termForm.register('terminator')}
            />
            <FieldError message={termForm.formState.errors.terminator?.message} />
          </div>
          <div>
            <Label>End Epoch</Label>
            <Input className="mt-1" placeholder="epoch" {...termForm.register('endEpoch')} />
            <FieldError message={termForm.formState.errors.endEpoch?.message} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TxButton
            type="submit"
            label="Terminate"
            isPending={termPending}
            isConfirming={termConfirming}
            variant="destructive"
          />
          {termSuccess && <TxSuccess />}
        </div>
      </form>

      <Separator />

      <form
        onSubmit={railForm.handleSubmit((v) => updateRailId(BigInt(v.dealId), BigInt(v.railId)))}
        className="flex items-end gap-3"
      >
        <div>
          <Label>Deal ID</Label>
          <Input className="mt-1 w-32" placeholder="ID" {...railForm.register('dealId')} />
          <FieldError message={railForm.formState.errors.dealId?.message} />
        </div>
        <div>
          <Label>Rail ID</Label>
          <Input className="mt-1 w-40" placeholder="rail ID" {...railForm.register('railId')} />
          <FieldError message={railForm.formState.errors.railId?.message} />
        </div>
        <TxButton
          type="submit"
          label="Update Rail ID"
          isPending={railPending}
          isConfirming={railConfirming}
        />
        {railSuccess && <TxSuccess />}
      </form>

      <Separator />

      <form
        onSubmit={manForm.handleSubmit((v) =>
          updateManifestLocation(BigInt(v.dealId), v.manifestLocation)
        )}
        className="flex items-end gap-3"
      >
        <div>
          <Label>Deal ID</Label>
          <Input className="mt-1 w-32" placeholder="ID" {...manForm.register('dealId')} />
          <FieldError message={manForm.formState.errors.dealId?.message} />
        </div>
        <div className="flex-1">
          <Label>New Manifest Location</Label>
          <Input
            className="mt-1"
            placeholder="ipfs://…"
            {...manForm.register('manifestLocation')}
          />
          <FieldError message={manForm.formState.errors.manifestLocation?.message} />
        </div>
        <TxButton
          type="submit"
          label="Update Manifest"
          isPending={manPending}
          isConfirming={manConfirming}
        />
        {manSuccess && <TxSuccess />}
      </form>

      <Separator />

      <form
        onSubmit={ccForm.handleSubmit((v) => setClientContract(v.address as `0x${string}`))}
        className="flex items-end gap-3"
      >
        <div className="flex-1">
          <Label>Set Client Smart Contract</Label>
          <Input className="mt-1 font-mono" placeholder="0x…" {...ccForm.register('address')} />
          <FieldError message={ccForm.formState.errors.address?.message as string} />
        </div>
        <TxButton type="submit" label="Set" isPending={ccPending} isConfirming={ccConfirming} />
        {ccSuccess && <TxSuccess />}
      </form>
    </div>
  )
}

export function AdminPage() {
  const { isConnected } = useAccount()
  const { isAnyAdmin, isAdminOnRegistry, isOperatorOnRegistry, isAdminOnMarket, isLoading } =
    useIsAdmin()

  if (!isConnected) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p className="text-muted-foreground">Connect your wallet to access the admin panel.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="text-primary size-6" />
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            Privileged operations for PoRep Market contracts
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-64" />
      ) : (
        <div className="flex flex-wrap gap-2 text-xs">
          {isAdminOnRegistry && (
            <span className="bg-primary/10 text-primary rounded px-2 py-1">
              Admin — SP Registry
            </span>
          )}
          {isOperatorOnRegistry && (
            <span className="bg-primary/10 text-primary rounded px-2 py-1">
              Operator — SP Registry
            </span>
          )}
          {isAdminOnMarket && (
            <span className="bg-primary/10 text-primary rounded px-2 py-1">
              Admin — PoRep Market
            </span>
          )}
          {!isAnyAdmin && (
            <span className="bg-destructive/10 text-destructive rounded px-2 py-1">
              No admin roles detected
            </span>
          )}
        </div>
      )}

      {!isAnyAdmin && !isLoading && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Your wallet does not hold any admin or operator roles on these contracts. Transactions
          will likely revert.
        </div>
      )}

      <Tabs defaultValue="network">
        <TabsList>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="sp">SP Registry</TabsTrigger>
          <TabsTrigger value="deals">Deal Market</TabsTrigger>
        </TabsList>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network Configuration</CardTitle>
              <CardDescription>
                Switch contract addresses between devnet, calibnet, and mainnet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkContractTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sp">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SP Registry Admin</CardTitle>
              <CardDescription>Pause, block, and manage roles on the SP Registry</CardDescription>
            </CardHeader>
            <CardContent>
              <SPAdminTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deal Market Admin</CardTitle>
              <CardDescription>Reject, terminate, and configure the PoRep Market</CardDescription>
            </CardHeader>
            <CardContent>
              <DealAdminTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
