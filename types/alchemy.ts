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
  tokenBalances: TokenBalance[]
  ensAvatar: string | null
  zkVerified: boolean
  isSociallyVerified: boolean
  twitterHandle: string | null
  twitterFollowers: number | null
  lensFollowers: number | null
  farcasterFollowers: number | null
  linkedWallets: string[] // Addresses of wallets linked via ERC-6551 or other means
}

// Simplified NFT type based on what we need from Alchemy's Nft object
export interface AlchemyNFT {
  contract: {
    address: string
  }
  tokenId: string
  tokenType: string
  name: string | null // Corresponds to Alchemy's 'title'
  description: string | null
  image: string // Gateway URL or IPFS URL
  collectionName: string | null // Corresponds to Alchemy's 'contract.name'
  // Add any other relevant fields from Alchemy's NFT object
}

// Simplified Activity type based on what we need from Alchemy's AssetTransfersResult
export interface AlchemyActivity {
  hash: string
  from: string
  to: string
  value: number | null
  asset: string | null // e.g., "ETH", "USDC"
  category: string // e.g., "erc721", "erc20", "external"
  blockNum: string // Hex string
  timestamp: number // Unix timestamp (seconds) - will need to be derived from blockNum
  // Add more fields as needed from Alchemy's AssetTransfer object
}

export interface TokenBalance {
  contractAddress: string
  tokenBalance: number // Formatted balance (e.g., in ETH, not wei)
  symbol: string | null
  logo: string | null
  name: string | null
  decimals: number | null
}
