import DevnetPoRepMarketAbi from '@/abis/devnet/PoRepMarket.json'
import DevnetSPRegistryAbi from '@/abis/devnet/SPRegistry.json'
import DevnetSLIOracleAbi from '@/abis/devnet/SLIOracle.json'
import DevnetSLIScorerAbi from '@/abis/devnet/SLIScorer.json'
import DevnetClientAbi from '@/abis/devnet/Client.json'
import CalibnetPoRepMarketAbi from '@/abis/calibnet/PoRepMarket.json'
import CalibnetSPRegistryAbi from '@/abis/calibnet/SPRegistry.json'
import CalibnetSLIOracleAbi from '@/abis/calibnet/SLIOracle.json'
import CalibnetSLIScorerAbi from '@/abis/calibnet/SLIScorer.json'
import CalibnetClientAbi from '@/abis/calibnet/Client.json'
import MainnetPoRepMarketAbi from '@/abis/mainnet/PoRepMarket.json'
import MainnetSPRegistryAbi from '@/abis/mainnet/SPRegistry.json'
import MainnetSLIOracleAbi from '@/abis/mainnet/SLIOracle.json'
import MainnetSLIScorerAbi from '@/abis/mainnet/SLIScorer.json'
import MainnetClientAbi from '@/abis/mainnet/Client.json'
import { Address } from 'viem'

export type ContractAddresses = {
  POREP_MARKET: Address
  SP_REGISTRY: Address
  CLIENT_CONTRACT: Address
  VALIDATOR_FACTORY: Address
  SLI_ORACLE: Address
  SLI_SCORER: Address
  META_ALLOCATOR: Address
  FILECOIN_PAY: Address
  USDC_TOKEN: Address
}

export type NetworkKey = 'devnet' | 'calibnet' | 'mainnet'

const e = process.env
const zeroAddress = '0x0000000000000000000000000000000000000000' as Address

export const NETWORKS: Record<
  NetworkKey,
  { label: string; chainId: number; contracts: ContractAddresses }
> = {
  devnet: {
    label: 'Local Devnet',
    chainId: 31415926,
    contracts: {
      POREP_MARKET: (e.NEXT_PUBLIC_DEVNET_POREP_MARKET ?? zeroAddress) as Address,
      SP_REGISTRY: (e.NEXT_PUBLIC_DEVNET_SP_REGISTRY ?? zeroAddress) as Address,
      CLIENT_CONTRACT: (e.NEXT_PUBLIC_DEVNET_CLIENT_CONTRACT ?? zeroAddress) as Address,
      VALIDATOR_FACTORY: (e.NEXT_PUBLIC_DEVNET_VALIDATOR_FACTORY ?? zeroAddress) as Address,
      SLI_ORACLE: (e.NEXT_PUBLIC_DEVNET_SLI_ORACLE ?? zeroAddress) as Address,
      SLI_SCORER: (e.NEXT_PUBLIC_DEVNET_SLI_SCORER ?? zeroAddress) as Address,
      META_ALLOCATOR: (e.NEXT_PUBLIC_DEVNET_META_ALLOCATOR ?? zeroAddress) as Address,
      FILECOIN_PAY: (e.NEXT_PUBLIC_DEVNET_FILECOIN_PAY ?? zeroAddress) as Address,
      USDC_TOKEN: (e.NEXT_PUBLIC_DEVNET_USDC_TOKEN ?? zeroAddress) as Address,
    },
  },
  calibnet: {
    label: 'Calibration',
    chainId: 314159,
    contracts: {
      POREP_MARKET: (e.NEXT_PUBLIC_CALIBNET_POREP_MARKET ?? zeroAddress) as Address,
      SP_REGISTRY: (e.NEXT_PUBLIC_CALIBNET_SP_REGISTRY ?? zeroAddress) as Address,
      CLIENT_CONTRACT: (e.NEXT_PUBLIC_CALIBNET_CLIENT_CONTRACT ?? zeroAddress) as Address,
      VALIDATOR_FACTORY: (e.NEXT_PUBLIC_CALIBNET_VALIDATOR_FACTORY ?? zeroAddress) as Address,
      SLI_ORACLE: (e.NEXT_PUBLIC_CALIBNET_SLI_ORACLE ?? zeroAddress) as Address,
      SLI_SCORER: (e.NEXT_PUBLIC_CALIBNET_SLI_SCORER ?? zeroAddress) as Address,
      META_ALLOCATOR: (e.NEXT_PUBLIC_CALIBNET_META_ALLOCATOR ?? zeroAddress) as Address,
      FILECOIN_PAY: (e.NEXT_PUBLIC_CALIBNET_FILECOIN_PAY ?? zeroAddress) as Address,
      USDC_TOKEN: (e.NEXT_PUBLIC_CALIBNET_USDC_TOKEN ?? zeroAddress) as Address,
    },
  },
  mainnet: {
    label: 'Mainnet',
    chainId: 314,
    contracts: {
      POREP_MARKET: (e.NEXT_PUBLIC_MAINNET_POREP_MARKET ?? zeroAddress) as Address,
      SP_REGISTRY: (e.NEXT_PUBLIC_MAINNET_SP_REGISTRY ?? zeroAddress) as Address,
      CLIENT_CONTRACT: (e.NEXT_PUBLIC_MAINNET_CLIENT_CONTRACT ?? zeroAddress) as Address,
      VALIDATOR_FACTORY: (e.NEXT_PUBLIC_MAINNET_VALIDATOR_FACTORY ?? zeroAddress) as Address,
      SLI_ORACLE: (e.NEXT_PUBLIC_MAINNET_SLI_ORACLE ?? zeroAddress) as Address,
      SLI_SCORER: (e.NEXT_PUBLIC_MAINNET_SLI_SCORER ?? zeroAddress) as Address,
      META_ALLOCATOR: (e.NEXT_PUBLIC_MAINNET_META_ALLOCATOR ?? zeroAddress) as Address,
      FILECOIN_PAY: (e.NEXT_PUBLIC_MAINNET_FILECOIN_PAY ?? zeroAddress) as Address,
      USDC_TOKEN: (e.NEXT_PUBLIC_MAINNET_USDC_TOKEN ?? zeroAddress) as Address,
    },
  },
}

export type NetworkAbis = {
  PoRepMarketAbi: typeof DevnetPoRepMarketAbi
  SpRegistryAbi: typeof DevnetSPRegistryAbi
  SLIOracleAbi: typeof DevnetSLIOracleAbi
  SLIScorerAbi: typeof DevnetSLIScorerAbi
  ClientAbi: typeof DevnetClientAbi
}

export const ABIS: Record<NetworkKey, NetworkAbis> = {
  devnet: {
    PoRepMarketAbi: DevnetPoRepMarketAbi,
    SpRegistryAbi: DevnetSPRegistryAbi,
    SLIOracleAbi: DevnetSLIOracleAbi,
    SLIScorerAbi: DevnetSLIScorerAbi,
    ClientAbi: DevnetClientAbi,
  },
  calibnet: {
    PoRepMarketAbi: CalibnetPoRepMarketAbi,
    SpRegistryAbi: CalibnetSPRegistryAbi,
    SLIOracleAbi: CalibnetSLIOracleAbi,
    SLIScorerAbi: CalibnetSLIScorerAbi,
    ClientAbi: CalibnetClientAbi,
  },
  mainnet: {
    PoRepMarketAbi: MainnetPoRepMarketAbi,
    SpRegistryAbi: MainnetSPRegistryAbi,
    SLIOracleAbi: MainnetSLIOracleAbi,
    SLIScorerAbi: MainnetSLIScorerAbi,
    ClientAbi: MainnetClientAbi,
  },
}

export const CHAIN_ID_TO_NETWORK: Record<number, NetworkKey> = {
  31415926: 'devnet',
  314159: 'calibnet',
  314: 'mainnet',
}
