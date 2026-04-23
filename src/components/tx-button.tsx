'use client'

import { Button } from '@/components/ui/button'

interface TxButtonProps {
  isPending: boolean
  isConfirming: boolean
  isSuccess?: boolean
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
}

export function TxButton({
  isPending,
  isConfirming,
  label,
  onClick,
  type = 'button',
  variant = 'default',
  className,
}: TxButtonProps) {
  const busy = isPending || isConfirming
  return (
    <Button type={type} variant={variant} disabled={busy} onClick={onClick} className={className}>
      {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : label}
    </Button>
  )
}

export function TxSuccess({ message = 'Transaction confirmed!' }: { message?: string }) {
  return <p className="text-sm text-green-500">{message}</p>
}

export function TxError({ error }: { error: Error | null | unknown }) {
  if (!error) return null
  const msg = error instanceof Error ? error.message : String(error)
  return <p className="text-destructive text-sm">{msg}</p>
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive mt-1 text-xs">{message}</p>
}
