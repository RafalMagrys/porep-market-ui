import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { ledgerWallet } from '@rainbow-me/rainbowkit/wallets';
import { ledgerHardwareWallet } from './ledger-wallet'

export const filecoin = defineChain({
  id: 314,
  name: 'Filecoin',
  nativeCurrency: { name: 'Filecoin', symbol: 'FIL', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: { name: 'Filfox', url: 'https://filfox.info/en' },
  },
})

export const filecoinCalibration = defineChain({
  id: 314159,
  name: 'Filecoin Calibration',
  nativeCurrency: { name: 'Filecoin', symbol: 'tFIL', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: {
      name: 'Calibration Explorer',
      url: 'https://calibration.filfox.info/en',
    },
  },
  testnet: true,
})

export const localTestnet = defineChain({
  id: 31415926,
  name: 'Local Testnet',
  nativeCurrency: { name: 'Filecoin', symbol: 'tFIL', decimals: 18 },
  rpcUrls: {
    default: { http: ['/rpc/v1'] },
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://localhost:8080' },
  },
  testnet: true,
})

export function createWagmiConfig(devnetRpcUrl?: string) {
  const devnet = devnetRpcUrl
    ? defineChain({
        id: 31415926,
        name: 'Local Testnet',
        nativeCurrency: { name: 'Filecoin', symbol: 'tFIL', decimals: 18 },
        rpcUrls: { default: { http: [devnetRpcUrl] } },
        blockExplorers: { default: { name: 'Local', url: 'http://localhost:8080' } },
        testnet: true,
      })
    : localTestnet

  const { wallets: defaultWallets } = getDefaultWallets()

  return getDefaultConfig({
    appName: 'PoRep Market',
    projectId: '377898157ad3bfa57110511264772d65',
    chains: [devnet, filecoinCalibration, filecoin],
    wallets: [
      ...defaultWallets,
      { groupName: 'Hardware', wallets: [ledgerHardwareWallet, ledgerWallet] },
    ],
    ssr: true,
  })
}
