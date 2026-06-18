import TransportWebHID from '@ledgerhq/hw-transport-webhid'
// FilecoinApp wraps hw-app-eth internally and exposes EVM signing methods
// so users can use the Filecoin Ledger app instead of the Ethereum app.
import { FilecoinApp } from '@zondax/ledger-filecoin'
import { createConnector } from 'wagmi'
import { serializeTransaction, type Address, type Chain, type Hex } from 'viem'
import { promptAccountSelection, type LedgerAccount } from './ledger-account-selector'

// Two derivation families:
// - Ethereum (44'/60'/…): MetaMask-compatible, used by most EVM tools
// - Filecoin (44'/461'/…): native Filecoin paths, used by Glif and Ledger Live
const ETH_BASE = "44'/60'/0'/0"
const FIL_BASE = "44'/461'/0'/0"
const ACCOUNT_COUNT = 5

function ethPathAt(index: number) { return `${ETH_BASE}/${index}` }
function filPathAt(index: number) { return `${FIL_BASE}/${index}` }

function log(msg: string, ...args: unknown[]) {
  console.debug(`[Ledger] ${msg}`, ...args)
}

type TxRequest = {
  from?: string
  to?: string
  data?: string
  value?: string
  nonce?: string
  gas?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  gasPrice?: string
}

async function rpcFetch(url: string, method: string, params: unknown[]): Promise<unknown> {
  log(`rpc → ${method}`, params)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  const json = await res.json()
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`)
  log(`rpc ← ${method}`, json.result)
  return json.result
}

function buildProvider(
  chain: Chain,
  getState: () => { address: Address | null; transport: TransportWebHID | null; selectedPath: string },
) {
  const rpcUrl = chain.rpcUrls.default.http[0]
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

  return {
    async request({ method, params = [] as unknown[] }: { method: string; params?: unknown[] }): Promise<unknown> {
      const { address, transport, selectedPath } = getState()
      log(`provider.request ${method}`, { address, selectedPath })

      if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
        return address ? [address] : []
      }

      if (method === 'eth_chainId') {
        return `0x${chain.id.toString(16)}`
      }

      if (method === 'personal_sign') {
        if (!transport) throw new Error('Ledger not connected')
        const app = new FilecoinApp(transport)
        const [msgHex] = params as [string]
        const raw = msgHex.startsWith('0x') ? msgHex.slice(2) : msgHex
        log('personal_sign', { path: selectedPath, msgHex })
        const { v, r, s } = await app.signPersonalMessageEVM(selectedPath, raw)
        return `0x${r}${s}${v.padStart(2, '0')}`
      }

      if (method === 'eth_signTypedData_v4') {
        if (!transport) throw new Error('Ledger not connected')
        const app = new FilecoinApp(transport)
        const [, typedDataJson] = params as [string, string]
        const typedData = JSON.parse(typedDataJson)
        log('eth_signTypedData_v4', { path: selectedPath, typedData })

        try {
          // signEIP712Message is not yet public in FilecoinApp — access via the
          // internal eth instance. Filed: https://github.com/Zondax/ledger-filecoin
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { v, r, s } = await (app as any).eth.signEIP712Message(selectedPath, typedData)
          return `0x${r}${s}${v.toString(16).padStart(2, '0')}`
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          throw new Error(
            `EIP-712 signing failed. Ensure the Filecoin app is open and firmware is up to date. (${msg})`,
          )
        }
      }

      if (method === 'eth_sendTransaction') {
        if (!transport) throw new Error('Ledger not connected')
        if (!address) throw new Error('No account connected')
        const app = new FilecoinApp(transport)
        const [txReq] = params as [TxRequest]
        log('eth_sendTransaction', txReq)

        let nonce: number
        if (txReq.nonce !== undefined) {
          nonce = Number(BigInt(txReq.nonce))
        } else {
          // Filecoin returns "actor not found" for addresses that have never
          // transacted. Treat that as nonce 0 — the actor is created on first send.
          const rawNonce = await rpcFetch(rpcUrl, 'eth_getTransactionCount', [address, 'pending']).catch(
            (err: unknown) => {
              if (err instanceof Error && err.message.includes('actor not found')) {
                log('eth_getTransactionCount: actor not found, using nonce 0')
                return '0x0'
              }
              throw err
            },
          )
          nonce = Number(BigInt(rawNonce as string))
        }
        log('nonce', nonce)

        let gas: bigint
        if (txReq.gas !== undefined) {
          gas = BigInt(txReq.gas)
        } else {
          const estimated = BigInt((await rpcFetch(rpcUrl, 'eth_estimateGas', [txReq])) as string)
          gas = (estimated * 120n) / 100n
        }
        log('gas', gas.toString())

        const isEIP1559 = txReq.maxFeePerGas !== undefined || txReq.gasPrice === undefined

        let txParams: Parameters<typeof serializeTransaction>[0]

        if (isEIP1559) {
          let maxFeePerGas = txReq.maxFeePerGas ? BigInt(txReq.maxFeePerGas) : undefined
          let maxPriorityFeePerGas = txReq.maxPriorityFeePerGas ? BigInt(txReq.maxPriorityFeePerGas) : undefined

          if (!maxFeePerGas || !maxPriorityFeePerGas) {
            const feeHistory = (await rpcFetch(rpcUrl, 'eth_feeHistory', [1, 'latest', [50]])) as {
              baseFeePerGas: string[]
              reward: string[][]
            }
            const baseFee = BigInt(feeHistory.baseFeePerGas.at(-1) ?? '0')
            maxPriorityFeePerGas ??= feeHistory.reward?.[0]?.[0] ? BigInt(feeHistory.reward[0][0]) : 1_000_000_000n
            maxFeePerGas ??= baseFee * 2n + maxPriorityFeePerGas
          }
          log('eip1559 fees', { maxFeePerGas: maxFeePerGas.toString(), maxPriorityFeePerGas: maxPriorityFeePerGas.toString() })

          txParams = {
            type: 'eip1559',
            chainId: chain.id,
            nonce,
            maxFeePerGas,
            maxPriorityFeePerGas,
            gas,
            to: txReq.to as Address | undefined,
            value: txReq.value ? BigInt(txReq.value) : 0n,
            data: (txReq.data ?? '0x') as Hex,
          }
        } else {
          let gasPrice = txReq.gasPrice ? BigInt(txReq.gasPrice) : undefined
          if (!gasPrice) {
            gasPrice = BigInt((await rpcFetch(rpcUrl, 'eth_gasPrice', [])) as string)
          }
          log('legacy gasPrice', gasPrice.toString())

          txParams = {
            type: 'legacy',
            chainId: chain.id,
            nonce,
            gasPrice,
            gas,
            to: txReq.to as Address | undefined,
            value: txReq.value ? BigInt(txReq.value) : 0n,
            data: (txReq.data ?? '0x') as Hex,
          }
        }

        const unsigned = serializeTransaction(txParams)
        log('signing tx', { path: selectedPath, unsigned })
        // Strip 0x but keep the EIP-2718 type prefix byte for Ledger
        const { r, s, v } = await app.signETHTransaction(selectedPath, unsigned.slice(2), null)
        log('signature', { r, s, v })

        const signed = serializeTransaction(txParams, {
          r: `0x${r}` as Hex,
          s: `0x${s}` as Hex,
          v: BigInt(parseInt(v, 16)),
        })

        return rpcFetch(rpcUrl, 'eth_sendRawTransaction', [signed])
      }

      return rpcFetch(rpcUrl, method, params as unknown[])
    },

    on(event: string, listener: (...args: unknown[]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(listener)
    },

    removeListener(event: string, listener: (...args: unknown[]) => void) {
      listeners.get(event)?.delete(listener)
    },
  }
}

export function createLedgerConnector(walletDetails: Record<string, unknown> = {}) {
  let transport: TransportWebHID | null = null
  let address: Address | null = null
  let selectedPath = ethPathAt(0)
  const providerCache = new Map<number, ReturnType<typeof buildProvider>>()

  return createConnector<ReturnType<typeof buildProvider>>((config) => {
    const getState = () => ({ address, transport, selectedPath })

    function getProvider(chain: Chain) {
      if (!providerCache.has(chain.id)) {
        providerCache.set(chain.id, buildProvider(chain, getState))
      }
      return providerCache.get(chain.id)!
    }

    return {
      id: 'ledger-hardware',
      name: 'Ledger Hardware Wallet',
      type: 'ledger-hardware',

      async connect({ chainId: requestedChainId } = {}) {
        if (typeof window === 'undefined' || !('hid' in navigator)) {
          throw new Error('WebHID is not supported in this browser. Use Chrome or Edge.')
        }

        log('connect: opening WebHID device picker')
        transport = await TransportWebHID.request()
        log('connect: device opened')
        const app = new FilecoinApp(transport)

        // Derive addresses from both path families so Glif/Ledger Live accounts appear
        const accounts: LedgerAccount[] = []
        for (let i = 0; i < ACCOUNT_COUNT; i++) {
          const path = ethPathAt(i)
          log(`deriving ETH #${i}`, path)
          const result = await app.getETHAddress(path, false)
          log(`ETH #${i}`, result.address)
          accounts.push({ address: result.address as Address, path, index: i, group: 'Ethereum (MetaMask)' })
        }
        for (let i = 0; i < ACCOUNT_COUNT; i++) {
          const path = filPathAt(i)
          log(`deriving Filecoin #${i}`, path)
          const result = await app.getETHAddress(path, false)
          log(`Filecoin #${i}`, result.address)
          accounts.push({ address: result.address as Address, path, index: i, group: 'Filecoin (Glif / Ledger Live)' })
        }

        log('connect: showing account picker', accounts.length, 'accounts')
        const pickedIndex = await promptAccountSelection(accounts)
        selectedPath = accounts[pickedIndex].path
        address = accounts[pickedIndex].address
        log('connect: selected', { address, path: selectedPath })

        const chain = config.chains.find((c) => c.id === requestedChainId) ?? config.chains[0]

        const connectedAccounts = [address] as readonly Address[]
        config.emitter.emit('connect', { accounts: connectedAccounts, chainId: chain.id })
        // wagmi's connect<withCapabilities> conditional return type cannot be satisfied
        // structurally at the implementation site — any is the standard workaround.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { accounts: connectedAccounts as any, chainId: chain.id }
      },

      async disconnect() {
        log('disconnect')
        await transport?.close()
        transport = null
        address = null
        selectedPath = ethPathAt(0)
        config.emitter.emit('disconnect')
      },

      async getAccounts() {
        return address ? [address] : []
      },

      async getChainId() {
        return config.chains[0].id
      },

      async getProvider({ chainId } = {}) {
        const chain = config.chains.find((c) => c.id === chainId) ?? config.chains[0]
        return getProvider(chain)
      },

      async isAuthorized() {
        return false
      },

      async switchChain({ chainId }) {
        const chain = config.chains.find((c) => c.id === chainId)
        if (!chain) throw new Error(`Chain ${chainId} not configured`)
        config.emitter.emit('change', { chainId })
        return chain
      },

      onAccountsChanged() {},
      onChainChanged() {},
      onDisconnect() {
        log('onDisconnect')
        address = null
        transport = null
        selectedPath = ethPathAt(0)
      },

      // RainbowKit reads rkDetails from the connector object to identify it
      // and populate the wallet picker. Must be spread here.
      ...walletDetails,
    }
  })
}
