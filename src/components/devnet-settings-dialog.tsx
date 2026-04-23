'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useNetwork } from '@/contexts/network-context'
import { NETWORKS } from '@/lib/network-config'

const CONTRACT_FIELDS = [
  { key: 'POREP_MARKET', label: 'PoRep Market' },
  { key: 'SP_REGISTRY', label: 'SP Registry' },
  { key: 'CLIENT_CONTRACT', label: 'Client Contract' },
  { key: 'VALIDATOR_FACTORY', label: 'Validator Factory' },
  { key: 'SLI_ORACLE', label: 'SLI Oracle' },
  { key: 'SLI_SCORER', label: 'SLI Scorer' },
  { key: 'META_ALLOCATOR', label: 'Meta Allocator' },
  { key: 'FILECOIN_PAY', label: 'FileCoin Pay' },
  { key: 'USDC_TOKEN', label: 'USDC Token' },
] as const

export function DevnetSettingsDialog() {
  const { devnetSettings, saveDevnetOverrides, resetDevnetOverrides } = useNetwork()
  const [open, setOpen] = useState(false)
  const [rpcUrl, setRpcUrl] = useState(devnetSettings.rpcUrl)
  const [contracts, setContracts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(devnetSettings.contracts).filter((e): e is [string, string] => e[1] !== undefined)
    )
  )

  function handleOpen(val: boolean) {
    if (val) {
      setRpcUrl(devnetSettings.rpcUrl)
      setContracts(Object.fromEntries(
        Object.entries(devnetSettings.contracts).filter((e): e is [string, string] => e[1] !== undefined)
      ))
    }
    setOpen(val)
  }

  function handleSave() {
    saveDevnetOverrides({ rpcUrl, contracts })
    setOpen(false)
  }

  function handleReset() {
    resetDevnetOverrides()
    setOpen(false)
  }

  const defaults = NETWORKS.devnet.contracts

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>
        <button className="text-muted-foreground hover:text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors">
          <Settings className="size-4 shrink-0" />
          Devnet Settings
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Devnet Settings</DialogTitle>
          <DialogDescription>
            Override RPC URL and contract addresses for the local devnet. Leave blank to use
            defaults from environment variables. RPC changes require a page reload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>RPC URL</Label>
            <Input
              className="mt-1 font-mono text-xs"
              placeholder="/rpc/v1"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
          </div>

          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Contract Addresses
          </p>

          {CONTRACT_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                className="mt-1 font-mono text-xs"
                placeholder={defaults[key]}
                value={contracts[key] ?? ''}
                onChange={(e) => setContracts((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to defaults
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
