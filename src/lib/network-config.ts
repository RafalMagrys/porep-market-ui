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

export const NETWORKS: Record<
  NetworkKey,
  { label: string; chainId: number; contracts: ContractAddresses }
> = {
  devnet: {
    label: 'Local Devnet',
    chainId: 31415926,
    contracts: {
      POREP_MARKET: '0x888BB23F38d019E3Ef08E6b3Aed59f2a3E5792aB',
      SP_REGISTRY: '0xf261E14F75f1c40a57454254254394C3B158Ee85',
      CLIENT_CONTRACT: '0x0A27549D92Cc22b9710c8450e0976A08335B81AE',
      VALIDATOR_FACTORY: '0xECDB7986e2c8f3Af461e47D585d91541b3a38747',
      SLI_ORACLE: '0x52569e93e42f0EB14BF8B7Bc0DFf6E938EB3b13C',
      SLI_SCORER: '0xf4c4DBCdAA22034AA24CD89A60dDa5E4679F2E56',
      META_ALLOCATOR: '0xB7a4A5f347a6E7142798D0a801894A00B8a14790',
      FILECOIN_PAY: '0xaC3fa2dBA7AA202Eab134713fE3AAF11Ed717b97',
      USDC_TOKEN: '0xEfD8D9E92eA91Fa2B6088790A36bA67342E07F0A',
    },
  },
  calibnet: {
    label: 'Calibration',
    chainId: 314159,
    contracts: {
      POREP_MARKET: '0x0000000000000000000000000000000000000000',
      SP_REGISTRY: '0x0000000000000000000000000000000000000000',
      CLIENT_CONTRACT: '0x0000000000000000000000000000000000000000',
      VALIDATOR_FACTORY: '0x0000000000000000000000000000000000000000',
      SLI_ORACLE: '0x0000000000000000000000000000000000000000',
      SLI_SCORER: '0x0000000000000000000000000000000000000000',
      META_ALLOCATOR: '0x0000000000000000000000000000000000000000',
      FILECOIN_PAY: '0x0000000000000000000000000000000000000000',
      USDC_TOKEN: '0x0000000000000000000000000000000000000000',
    },
  },
  mainnet: {
    label: 'Mainnet',
    chainId: 314,
    contracts: {
      POREP_MARKET: '0xBD669aBd1188F52e82aF114E17aCE2842DCc0Eb4',
      SP_REGISTRY: '0x504cF6660109fBa811d7e928Cb9d2d87cBa799d9',
      CLIENT_CONTRACT: '0x4B099b9eCa7d3872Fa8F9B72b913119B4F08c5ED',
      VALIDATOR_FACTORY: '0x1814d77CDef6297e9E015667d912aE11ae6f68D8',
      SLI_ORACLE: '0x09c513F1C68d74b69a9550745BB779F346556577',
      SLI_SCORER: '0xAe15E4f7287C1ea29477f0A98C39ca67166fC192',
      META_ALLOCATOR: '0x1e15357F252FF44d2CebEA99FDB1E0858018cCE1',
      FILECOIN_PAY: '0x23b1e018F08BB982348b15a86ee926eEBf7F4DAa',
      USDC_TOKEN: '0x0000000000000000000000000000000000000000',
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
