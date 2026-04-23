import { z } from 'zod/v3'

export const capabilitiesSchema = z.object({
  retrievabilityBps: z.number().int().min(0).max(10000, 'Max 10000 bps'),
  bandwidthMbps: z.number().int().min(0),
  latencyMs: z.number().int().min(0),
  indexingPct: z.number().int().min(0).max(100, 'Max 100%'),
})

export const priceSchema = z.object({
  priceAttoFil: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be >= 0'),
})

export const availableSpaceSchema = z.object({
  bytes: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
})

export const payeeSchema = z.object({
  payee: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid EVM address'),
})

export const dealDurationLimitsSchema = z
  .object({
    minDays: z.number().int().min(1),
    maxDays: z.number().int().min(1).max(1278, 'Max 1278 days (FIP-0052)'),
  })
  .refine((v) => v.maxDays >= v.minDays, { message: 'Max must be >= min', path: ['maxDays'] })

export const registerSPSchema = z.object({
  actorId: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a valid miner actor ID'),
  organization: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid EVM address'),
  payee: z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid EVM address'),
  pricePerSectorPerMonth: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be >= 0'),
  availableBytes: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  minDealDurationDays: z.number().int().min(1),
  maxDealDurationDays: z.number().int().min(1).max(1278),
  retrievabilityBps: z.number().int().min(0).max(10000),
  bandwidthMbps: z.number().int().min(0),
  latencyMs: z.number().int().min(0),
  indexingPct: z.number().int().min(0).max(100),
})

export const commitCapacitySchema = z.object({
  bytes: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  dealId: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid deal ID'),
})

export const releaseCapacitySchema = z.object({
  bytes: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
})

export type CapabilitiesFormValues = z.infer<typeof capabilitiesSchema>
export type RegisterSPFormValues = z.infer<typeof registerSPSchema>
export type CommitCapacityFormValues = z.infer<typeof commitCapacitySchema>
