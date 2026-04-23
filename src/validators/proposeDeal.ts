import { z } from 'zod/v3'

export const proposeDealSchema = z.object({
  manifestLocation: z.string().min(1, 'Manifest location is required'),
  dealSizeBytes: z
    .string()
    .min(1, 'Deal size is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  pricePerSectorPerMonth: z
    .string()
    .min(1, 'Price is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a non-negative number'),
  durationDays: z.number().int().min(1, 'Minimum 1 day').max(1278, 'Maximum 1278 days (FIP-0052)'),
  retrievabilityBps: z.number().int().min(0).max(10000, 'Max 10000 bps'),
  bandwidthMbps: z.number().int().min(0),
  latencyMs: z.number().int().min(0),
  indexingPct: z.number().int().min(0).max(100, 'Max 100%'),
})

export type ProposeDealFormValues = z.infer<typeof proposeDealSchema>
