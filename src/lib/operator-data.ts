import { CID } from 'multiformats/cid'

// Filecoin epoch constants
const EPOCHS_PER_DAY = 60 * 24 * 2 // 2880
const EPOCHS_PER_MONTH = EPOCHS_PER_DAY * 30 // 86400
const DATACAP_DECIMALS = 18

export const ALLOCATION_BATCH_SIZE = 10

// ── Minimal CBOR encoder ──────────────────────────────────────────────────────

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) {
    out.set(a, offset)
    offset += a.length
  }
  return out
}

function cborHead(major: number, value: number | bigint): Uint8Array {
  const v = BigInt(value)
  const base = major << 5
  if (v < 24n) return new Uint8Array([base | Number(v)])
  if (v < 0x100n) return new Uint8Array([base | 24, Number(v)])
  if (v < 0x10000n) return new Uint8Array([base | 25, Number(v >> 8n), Number(v & 0xffn)])
  if (v < 0x100000000n) {
    const n = Number(v)
    return new Uint8Array([
      base | 26,
      (n >>> 24) & 0xff,
      (n >>> 16) & 0xff,
      (n >>> 8) & 0xff,
      n & 0xff,
    ])
  }
  const b = new Uint8Array(9)
  b[0] = base | 27
  let n = v
  for (let i = 8; i >= 1; i--) {
    b[i] = Number(n & 0xffn)
    n >>= 8n
  }
  return b
}

const cborUint = (n: number | bigint) => cborHead(0, n)
const cborBytes = (data: Uint8Array) => concat(cborHead(2, data.length), data)
const cborArray = (items: Uint8Array[]) => concat(cborHead(4, items.length), ...items)
const cborTag42 = (data: Uint8Array) => concat(cborHead(6, 42), cborBytes(data))

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Piece {
  pieceCid: string
  pieceSize: number | string
  pieceType?: string
}

export interface ManifestEntry {
  pieces: Piece[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function batchPieces(pieces: Piece[]): Piece[][] {
  const batches: Piece[][] = []
  for (let i = 0; i < pieces.length; i += ALLOCATION_BATCH_SIZE)
    batches.push(pieces.slice(i, i + ALLOCATION_BATCH_SIZE))
  return batches
}

function bigintToMinimalBytes(n: bigint): Uint8Array {
  if (n === 0n) return new Uint8Array([0])
  const hex = n.toString(16)
  const padded = hex.length % 2 === 0 ? hex : '0' + hex
  const bytes = new Uint8Array(padded.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

function toHex(bytes: Uint8Array): `0x${string}` {
  return ('0x' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')) as `0x${string}`
}

// ── Mock constants (devnet sample CommP from ComputeTransferCalldata.s.sol) ───

const MOCK_PIECE_CID_HEX =
  '0181e203922020ab68b07850bae544b4e720ff59fdc7de709a8b5a8e83d6b7ab3ac2fa83e8461b'
const MOCK_TERM_MIN = 518400n // ~180 days
const MOCK_TERM_MAX = 5256000n // ~5 years
const MOCK_EXPIRATION = 100000n

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

// ── Operator data builder ─────────────────────────────────────────────────────

function buildEntry(
  providerId: bigint,
  cidBytes: Uint8Array,
  size: bigint,
  termMin: bigint,
  termMax: bigint,
  expiration: bigint
): Uint8Array {
  const cidWithPrefix = concat(new Uint8Array([0x00]), cidBytes)
  return cborArray([
    cborUint(providerId),
    cborTag42(cidWithPrefix),
    cborUint(size),
    cborUint(termMin),
    cborUint(termMax),
    cborUint(expiration),
  ])
}

export function buildOperatorData(
  providerId: bigint,
  batch: Piece[],
  dealDurationDays: number,
  currentBlock: bigint
): Uint8Array {
  const termMinMax = BigInt(dealDurationDays * EPOCHS_PER_DAY)
  const expiration = currentBlock + BigInt(EPOCHS_PER_MONTH)

  const entries = batch.map((piece) => {
    const cid = CID.parse(piece.pieceCid)
    return buildEntry(
      providerId,
      cid.bytes,
      BigInt(piece.pieceSize),
      termMinMax,
      termMinMax,
      expiration
    )
  })

  return cborArray([cborArray(entries), cborArray([])])
}

export function buildMockOperatorData(
  providerId: bigint,
  pieceSize: bigint,
  pieceCount: number
): Uint8Array {
  const cidBytes = hexToBytes(MOCK_PIECE_CID_HEX)
  const entries = Array.from({ length: pieceCount }, () =>
    buildEntry(providerId, cidBytes, pieceSize, MOCK_TERM_MIN, MOCK_TERM_MAX, MOCK_EXPIRATION)
  )
  return cborArray([cborArray(entries), cborArray([])])
}

/** Returns all mock batches (each up to ALLOCATION_BATCH_SIZE pieces). */
export function buildMockBatches(
  providerId: bigint,
  dealSizeBytes: bigint,
  totalPieces: number,
  dealId: bigint
): ReturnType<typeof makeArgs>[] {
  const pieceSize = dealSizeBytes / BigInt(totalPieces) || 1n
  const batches: ReturnType<typeof makeArgs>[] = []

  for (let i = 0; i < totalPieces; i += ALLOCATION_BATCH_SIZE) {
    const count = Math.min(ALLOCATION_BATCH_SIZE, totalPieces - i)
    const isLast = i + count >= totalPieces
    const operatorData = buildMockOperatorData(providerId, pieceSize, count)
    batches.push(makeArgs(operatorData, pieceSize * BigInt(count), dealId, isLast))
  }

  return batches
}

// ── Transfer params builder ───────────────────────────────────────────────────

function makeArgs(
  operatorData: Uint8Array,
  totalSize: bigint,
  dealId: bigint,
  isCompleted: boolean
) {
  const amountWei = totalSize * 10n ** BigInt(DATACAP_DECIMALS)
  return [
    {
      to: { data: '0x0006' as `0x${string}` },
      amount: { val: toHex(bigintToMinimalBytes(amountWei)), neg: false },
      operator_data: toHex(operatorData),
    },
    dealId,
    isCompleted,
  ] as const
}

export function buildTransferArgs(
  providerId: bigint,
  batch: Piece[],
  dealId: bigint,
  dealDurationDays: number,
  currentBlock: bigint,
  isCompleted: boolean
) {
  const totalSize = batch.reduce((sum, p) => sum + BigInt(p.pieceSize), 0n)
  return makeArgs(
    buildOperatorData(providerId, batch, dealDurationDays, currentBlock),
    totalSize,
    dealId,
    isCompleted
  )
}

export async function fetchManifest(url: string): Promise<Piece[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`)
  const data: ManifestEntry[] = await res.json()
  return data[0].pieces
}
