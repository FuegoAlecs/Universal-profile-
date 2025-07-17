export interface AlchemyProfile {
  address: string
  ensName: string | null
  profileImageUri: string | null
  bio: string | null
  socialLinks: {
    twitter?: string
    github?: string
    // Add more social links as needed
  }
  tokenBalances: AlchemyTokenBalance[]
  ensAvatar: string | null
  zkVerified: boolean
  isSociallyVerified: boolean
  twitterHandle: string | null
  twitterFollowers: number | null
  lensFollowers: number | null
  farcasterFollowers: number | null
  linkedWallets: string[] // Addresses of wallets linked via ERC-6551 or other means
  avatar: string | null // Added from updates
}

// Simplified NFT type based on what we need from Alchemy's Nft object
export interface AlchemyNFT {
  contract: {
    address: string
    name?: string
    symbol?: string
    totalSupply?: string
    tokenType?: string
    contractDeployer?: string
    deployedBlockNumber?: number
    openSeaMetadata?: {
      floorPrice?: number
      collectionName?: string
      safelistRequestStatus?: string
      imageUrl?: string
      description?: string
      externalUrl?: string
      lastIngestedAt?: string
    }
  }
  tokenId: string
  tokenType: string
  name?: string
  description?: string
  imageUrl?: string
  raw: {
    tokenUri?: string
    metadata?: any
    error?: string
  }
  tokenUri?: {
    gateway?: string
    raw?: string
  }
  media?: {
    gateway?: string
    raw?: string
    thumbnail?: string
    format?: string
  }[]
  spamInfo?: {
    isSpam: boolean
    classifications: string[]
  }
  timeLastUpdated: string
  error?: string
}

// Simplified Activity type based on what we need from Alchemy's AssetTransfersResult
export interface AlchemyActivity {
  blockNum: string
  hash: string
  from: string
  to: string | null
  value: number | null
  erc721TokenId: string | null
  erc1155Metadata: any | null
  asset: string | null
  category: string
  rawContract: {
    value: string | null
    address: string | null
    decimal: string | null
  }
}

export interface AlchemyTokenBalance {
  contractAddress: string
  tokenBalance: string // Hex string
  error?: string
  symbol?: string
  name?: string
  logo?: string
  thumbnail?: string
  decimals?: number
}

export interface AlchemyTokenMetadata {
  name: string
  symbol: string
  decimals: number
  logo: string | null
}
