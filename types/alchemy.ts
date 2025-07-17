export interface AlchemyProfile {
  ens?: string
  lens?: string
  farcaster?: string
  avatar?: string
  coverImage?: string
  bio?: string
}

export interface AlchemyNFT {
  contract: {
    address: string
    name: string
    symbol: string
  }
  tokenId: string
  name?: string
  description?: string
  image?: string
  chain?: string
  floorPrice?: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

export interface AlchemyActivity {
  hash: string
  blockNum: string
  from: string
  to?: string
  value?: string
  category: "send" | "receive" | "vote" | "mint" | "burn" | "swap" | "stake" | "external"
  metadata: {
    blockTimestamp: number
  }
}

// Smart contract types
export interface ProfileData {
  owner: string
  createdAt: number
  metadataURI: string
  zkVerified: boolean
  walletCount: number
  socialCount: number
}

export interface LinkedWallet {
  address: string
  chainId: number
  linkedAt: number
}
