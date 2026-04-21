export function formatBytes(bytes: bigint | number): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(n) / Math.log(1024))
  return `${(n / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatFil(attoFil: bigint): string {
  const fil = Number(attoFil) / 1e18
  if (fil === 0) return '0 FIL'
  if (fil < 0.0001) return '<0.0001 FIL'
  return `${fil.toFixed(4)} FIL`
}
