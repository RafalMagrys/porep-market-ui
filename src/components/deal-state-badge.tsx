import { Badge } from '@/components/ui/badge'
import { DealState, DEAL_STATE_LABELS } from '@/types'

const variantMap: Record<DealState, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [DealState.Proposed]: 'outline',
  [DealState.Accepted]: 'default',
  [DealState.Completed]: 'secondary',
  [DealState.Rejected]: 'destructive',
  [DealState.Terminated]: 'destructive',
}

export function DealStateBadge({ state }: { state: number }) {
  const dealState = state as DealState
  return (
    <Badge variant={variantMap[dealState] ?? 'outline'}>
      {DEAL_STATE_LABELS[dealState] ?? 'Unknown'}
    </Badge>
  )
}
