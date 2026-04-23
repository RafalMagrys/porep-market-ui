import { z } from 'zod/v3'

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid EVM address')
const dealId = z
  .string()
  .min(1)
  .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid deal ID')
const spId = z
  .string()
  .min(1)
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a valid SP ID')

export const terminateDealSchema = z.object({
  dealId,
  terminator: address,
  endEpoch: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be >= 0'),
})

export const rejectDealSchema = z.object({ dealId })

export const updateValidatorSchema = z.object({ dealId })

export const updateRailIdSchema = z.object({
  dealId,
  railId: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be >= 0'),
})

export const updateManifestSchema = z.object({
  dealId,
  manifestLocation: z.string().min(1, 'Required'),
})

export const setClientContractSchema = z.object({ address })

export const spActionSchema = z.object({ spId })

export const toleranceBpsSchema = z.object({
  bps: z.number().int().min(0).max(10000, 'Max 10000 bps'),
})

export const grantRevokeRoleSchema = z.object({
  target: z.enum(['registry', 'market']),
  role: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Must be a bytes32 role hash'),
  account: address,
})

export type TerminateDealFormValues = z.infer<typeof terminateDealSchema>
export type UpdateRailIdFormValues = z.infer<typeof updateRailIdSchema>
export type UpdateManifestFormValues = z.infer<typeof updateManifestSchema>
export type GrantRevokeRoleFormValues = z.infer<typeof grantRevokeRoleSchema>
