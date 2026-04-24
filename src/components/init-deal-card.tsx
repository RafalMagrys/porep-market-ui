'use client'

import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useInitDeal, calculateDepositAmount } from '@/hooks/useInitDeal'
import type { InitStep } from '@/hooks/useInitDeal'
import type { DealProposal } from '@/types'

interface InitDealCardProps {
  deal: DealProposal
}

const STEP_ORDER: InitStep[] = ['deploy-validator', 'deposit-approve', 'init-rail']

const STEP_LABELS: Record<InitStep, { title: string; description: string }> = {
  'deploy-validator': {
    title: 'Deploy Validator',
    description: 'Deploy a per-deal validator contract that will manage payment validation.',
  },
  'deposit-approve': {
    title: 'Deposit USDC & Approve',
    description: 'Sign a permit for USDC, deposit funds into FileCoinPay, and authorize the validator as operator.',
  },
  'init-rail': {
    title: 'Initialize Payment Rail',
    description: 'Create the FileCoinPay payment rail on the validator contract.',
  },
}

function formatUsdc(amount: bigint, decimals = 6): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const frac = amount % divisor
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '')
  return fracStr ? `${whole}.${fracStr}` : whole.toString()
}

function StepIcon({
  step,
  nextStep,
  isActive,
}: {
  step: InitStep
  nextStep: InitStep | 'complete'
  isActive: boolean
}) {
  const stepIdx = STEP_ORDER.indexOf(step)
  const nextIdx = nextStep === 'complete' ? STEP_ORDER.length : STEP_ORDER.indexOf(nextStep as InitStep)
  const done = stepIdx < nextIdx

  if (done) return <CheckCircle2 className="size-5 shrink-0 text-green-500" />
  if (isActive) return <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
  return <Circle className="text-muted-foreground size-5 shrink-0" />
}

export function InitDealCard({ deal }: InitDealCardProps) {
  const { phase, nextStep, depositAmount, usdcBalance, execute } = useInitDeal(deal)

  const isIdle = phase.type === 'idle'
  const isBusy = phase.type === 'running' || phase.type === 'confirming' || phase.type === 'signing'
  const activeStep = isBusy || phase.type === 'error' ? (phase as { step: InitStep }).step : null

  const hasInsufficientBalance =
    nextStep === 'deposit-approve' && usdcBalance !== undefined && usdcBalance < depositAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Initialize Deal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Complete 3 setup steps to enable DataCap allocation and payments.
        </p>

        <ol className="space-y-4">
          {STEP_ORDER.map((step, idx) => {
            const stepIdx = STEP_ORDER.indexOf(step)
            const nextIdx = nextStep === 'complete' ? STEP_ORDER.length : STEP_ORDER.indexOf(nextStep as InitStep)
            const isDone = stepIdx < nextIdx
            const isCurrent = step === nextStep
            const isRunning = activeStep === step

            return (
              <li key={step} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon step={step} nextStep={nextStep} isActive={isRunning} />
                  {idx < STEP_ORDER.length - 1 && (
                    <div className={`mt-1 w-px flex-1 ${isDone ? 'bg-green-500' : 'bg-border'}`} style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="min-w-0 pb-2">
                  <p className={`text-sm font-medium ${isDone ? 'text-muted-foreground line-through' : ''}`}>
                    {idx + 1}. {STEP_LABELS[step].title}
                  </p>
                  {!isDone && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{STEP_LABELS[step].description}</p>
                  )}
                  {step === 'deposit-approve' && isCurrent && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Deposit required:{' '}
                      <span className="font-mono">{formatUsdc(depositAmount)} USDC</span>
                      {usdcBalance !== undefined && (
                        <>
                          {' '}· Balance:{' '}
                          <span className={`font-mono ${hasInsufficientBalance ? 'text-destructive' : ''}`}>
                            {formatUsdc(usdcBalance)} USDC
                          </span>
                        </>
                      )}
                    </p>
                  )}
                  {isRunning && (
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <Loader2 className="size-3 animate-spin" />
                      {phase.type === 'signing'
                        ? 'Sign the USDC permit in your wallet…'
                        : phase.type === 'confirming'
                          ? `Confirming… ${(phase as { txHash: string }).txHash.slice(0, 10)}…`
                          : 'Sending transaction…'}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        {phase.type === 'error' && (
          <div className="border-destructive/50 bg-destructive/10 flex items-start gap-2 rounded-md border p-3">
            <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-destructive text-sm font-medium">
                Step failed: {STEP_LABELS[phase.step].title}
              </p>
              <p className="text-muted-foreground text-xs break-words">{phase.message}</p>
            </div>
          </div>
        )}

        {nextStep !== 'complete' && (
          <Button
            onClick={execute}
            disabled={isBusy || hasInsufficientBalance}
            size="sm"
          >
            {isBusy
              ? phase.type === 'signing'
                ? 'Waiting for signature…'
                : 'Processing…'
              : phase.type === 'error'
                ? `Retry: ${STEP_LABELS[nextStep].title}`
                : STEP_LABELS[nextStep].title}
          </Button>
        )}

        {nextStep === 'complete' && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-4 shrink-0" />
            All steps complete — ready for DataCap allocation
          </div>
        )}
      </CardContent>
    </Card>
  )
}
