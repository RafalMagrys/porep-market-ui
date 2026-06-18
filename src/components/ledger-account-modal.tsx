'use client'

import { useSyncExternalStore } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  cancelSelection,
  confirmAccount,
  getLedgerPendingAccounts,
  isLedgerSelectorOpen,
  subscribeLedgerSelector,
  type LedgerAccount,
} from '@/lib/ledger-account-selector'

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(item)
  }
  return map
}

export function LedgerAccountModal() {
  const open = useSyncExternalStore(subscribeLedgerSelector, isLedgerSelectorOpen, () => false)
  const accounts = useSyncExternalStore(subscribeLedgerSelector, getLedgerPendingAccounts, () => [] as LedgerAccount[])

  const groups = groupBy(accounts, (a) => a.group)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) cancelSelection() }}>
      <DialogContent className="z-[2147483647] max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Ledger Account</DialogTitle>
          <DialogDescription>
            Choose which account to connect. Filecoin paths match Glif / Ledger Live accounts.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[28rem]">
          <div className="flex flex-col gap-4 pr-3">
            {Array.from(groups.entries()).map(([group, accs]) => (
              <div key={group}>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group}
                </p>
                <div className="flex flex-col gap-1">
                  {accs.map((acc) => (
                    <Button
                      key={acc.path}
                      variant="outline"
                      className="h-auto justify-start gap-3 py-3 font-mono text-sm"
                      onClick={() => confirmAccount(accounts.indexOf(acc))}
                    >
                      <span className="w-5 shrink-0 text-right text-muted-foreground">{acc.index}</span>
                      <span className="truncate">{acc.address}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
