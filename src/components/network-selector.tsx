'use client'

import { useNetwork } from '@/contexts/network-context'

export function NetworkContractTable() {
  const { activeNetwork, contracts, networks } = useNetwork()
  const { label } = networks[activeNetwork]

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Active addresses — <span className="text-muted-foreground">{label}</span>
      </p>
      <div className="rounded-md border text-xs font-mono">
        {Object.entries(contracts).map(([name, addr]) => (
          <div key={name} className="flex items-center justify-between border-b px-3 py-2 last:border-0">
            <span className="text-muted-foreground w-40 shrink-0">{name}</span>
            <span className={addr === '0x0000000000000000000000000000000000000000' ? 'text-muted-foreground italic' : ''}>
              {addr === '0x0000000000000000000000000000000000000000' ? 'not deployed' : addr}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
