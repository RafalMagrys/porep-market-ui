export interface DevnetSettings {
  rpcUrl: string
  contracts: Partial<Record<string, string>>
}

const KEY = 'devnet-settings'
const DEFAULT: DevnetSettings = { rpcUrl: '', contracts: {} }

export function loadDevnetSettings(): DevnetSettings {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
  } catch {
    return DEFAULT
  }
}

export function saveDevnetSettings(settings: DevnetSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

export function clearDevnetSettings(): void {
  localStorage.removeItem(KEY)
}
