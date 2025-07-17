export interface AlchemyProfile {
  address: string
  ensName: string | null
  ensAvatar: string | null
  zkVerified: boolean
  isSociallyVerified: boolean
  twitterHandle: string | null
  twitterFollowers: number | null
  lensFollowers: number | null
  farcasterFollowers: number | null
  linkedWallets: string[] // Addresses of wallets linked via ERC-6551 or other means
}

export interface Nft {
  contractAddress: string
  tokenId: string
  name: string
  description: string
  imageUrl: string
  collectionName: string
  tokenType: string
  rarity?: number
  attributes?: { trait_type: string; value: string }[]
}

export interface Activity {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  type: "transfer" | "mint" | "swap" | "stake" | "approve" | "other"
  asset: string // e.g., ETH, USDC, NFT name
  blockNum: string
  gasUsed: string
  gasPrice: string
}
