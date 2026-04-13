'use client'

import { useCompletedDeals } from '@/hooks/useCompletedDeals'

export default function Home() {
  const { data: deals, isLoading, error } = useCompletedDeals()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold">PoRep Market</h1>
        <div className="w-full max-w-2xl">
          <h2 className="mb-2 text-xl font-semibold">Completed Deals</h2>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}
          {deals && deals.length === 0 && <p>No completed deals yet.</p>}
          {deals && deals.length > 0 && (
            <ul className="flex flex-col gap-2">
              {deals.map((deal) => (
                <li key={deal.dealId.toString()} className="rounded border p-3 font-mono text-sm">
                  <div>ID: {deal.dealId.toString()}</div>
                  <div>Client: {deal.client}</div>
                  <div>Provider: {deal.provider.toString()}</div>
                  <div>Manifest: {deal.manifestLocation || '—'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
