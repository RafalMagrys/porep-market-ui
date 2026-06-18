import type { Address } from 'viem'

export type LedgerAccount = {
  address: Address
  path: string
  index: number
  /** Human-readable group shown in the account picker */
  group: string
}

type Pending = {
  accounts: LedgerAccount[]
  resolve: (index: number) => void
  reject: (err: Error) => void
}

let pending: Pending | null = null
const subscribers = new Set<() => void>()
const NO_ACCOUNTS: LedgerAccount[] = []

function notify() {
  subscribers.forEach((fn) => fn())
}

export function isLedgerSelectorOpen(): boolean {
  return pending !== null
}

export function getLedgerPendingAccounts(): LedgerAccount[] {
  return pending?.accounts ?? NO_ACCOUNTS
}

export function subscribeLedgerSelector(fn: () => void): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

export function promptAccountSelection(accounts: LedgerAccount[]): Promise<number> {
  return new Promise((resolve, reject) => {
    pending = { accounts, resolve, reject }
    notify()
  })
}

export function confirmAccount(index: number): void {
  const p = pending
  pending = null
  notify()
  p?.resolve(index)
}

export function cancelSelection(): void {
  const p = pending
  pending = null
  notify()
  p?.reject(new Error('Account selection cancelled'))
}
