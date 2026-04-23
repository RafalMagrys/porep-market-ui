import type { Address } from 'viem'

export interface DealRequirements {
  retrievabilityBps: number
  bandwidthMbps: number
  latencyMs: number
  indexingPct: number
}

export interface DealTerms {
  dealSizeBytes: bigint
  pricePerSectorPerMonth: bigint
  durationDays: number
}

export interface DealProposal {
  dealId: bigint
  client: Address
  provider: bigint
  requirements: DealRequirements
  terms: DealTerms
  validator: Address
  state: number
  railId: bigint
  proposedAtBlock: bigint
  manifestLocation: string
}

export interface DealTermination {
  terminator: Address
  endEpoch: bigint
}

export enum DealState {
  Proposed = 0,
  Accepted = 1,
  Completed = 2,
  Rejected = 3,
  Terminated = 4,
}

export const DEAL_STATE_LABELS: Record<DealState, string> = {
  [DealState.Proposed]: 'Proposed',
  [DealState.Accepted]: 'Accepted',
  [DealState.Completed]: 'Completed',
  [DealState.Rejected]: 'Rejected',
  [DealState.Terminated]: 'Terminated',
}

export interface SLIThresholds {
  retrievabilityBps: number
  bandwidthMbps: number
  latencyMs: number
  indexingPct: number
}

export interface Attestation {
  lastUpdate: bigint
  slis: SLIThresholds
}

export interface ProviderCapabilities {
  retrievabilityBps: number
  bandwidthMbps: number
  latencyMs: number
  indexingPct: number
}

export interface ProviderInfo {
  organization: Address
  payee: Address
  paused: boolean
  blocked: boolean
  capabilities: ProviderCapabilities
  availableBytes: bigint
  committedBytes: bigint
  pendingBytes: bigint
  pricePerSectorPerMonth: bigint
  minDealDurationDays: number
  maxDealDurationDays: number
}
