import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

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

export const wagmiConfig = getDefaultConfig({
  appName: 'PoRep Market',
  projectId: '191fc4fc-7f2c-4c4f-b434-c0e98f9f509b',
  chains: [localTestnet, filecoinCalibration, filecoin],
  ssr: true,
})
