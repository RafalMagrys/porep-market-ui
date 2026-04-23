'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle2, FileText, PlusCircle, Server, Settings, ShieldAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DevnetSettingsDialog } from '@/components/devnet-settings-dialog'
import { useNetwork } from '@/contexts/network-context'

const navGroups = [
  {
    label: 'Deals',
    items: [
      { label: 'Open Deals', href: '/', icon: FileText },
      { label: 'Completed Deals', href: '/deals/completed', icon: CheckCircle2 },
      { label: 'Propose Deal', href: '/deals/propose', icon: PlusCircle },
    ],
  },
  {
    label: 'Providers',
    items: [
      { label: 'Browse SPs', href: '/sps', icon: Server },
      { label: 'Manage My SP', href: '/sps/manage', icon: Settings },
    ],
  },
  {
    label: 'Admin',
    items: [{ label: 'Admin Panel', href: '/admin', icon: ShieldAlert }],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { activeNetwork } = useNetwork()

  return (
    <aside className="hidden w-56 shrink-0 border-r md:flex md:flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 px-3 py-4">
          {navGroups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-muted-foreground mb-1 px-2 text-xs font-semibold tracking-widest uppercase">
                {label}
              </p>
              <nav className="flex flex-col gap-1">
                {items.map(({ label: itemLabel, href, icon: Icon }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {itemLabel}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
        <Separator />
        {activeNetwork === 'devnet' && (
          <div className="px-3 py-3">
            <DevnetSettingsDialog />
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
