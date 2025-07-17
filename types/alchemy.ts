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

// Simplified NFT type based on what we need from Alchemy's Nft object
export interface AlchemyNFT {
  contract: {
    address: string
    name: string | null
    symbol: string | null
  }
  tokenId: string
  name: string | null // Corresponds to Alchemy's 'title'
  description: string | null
  image: string | null // Corresponds to Alchemy's 'media[0].gateway'
  collectionName: string | null // Corresponds to Alchemy's 'contract.name'
  tokenType: string // e.g., ERC721, ERC1155
  rarity?: number // Placeholder for rarity, might need external data
  attributes?: { trait_type: string; value: string }[] // From rawMetadata.attributes
  floorPrice?: number // Placeholder for floor price, might need external data
  chain?: string // e.g., "Ethereum", "Polygon"
}

// Simplified Activity type based on what we need from Alchemy's AssetTransfersResult
export interface AlchemyActivity {
  hash: string
  from: string
  to: string | null
  value: string | null // Value of the transfer, e.g., "0.5 ETH"
  timestamp: number // Unix timestamp
  category: string // e.g., "erc20", "erc721", "external"
  asset: string | null // e.g., "ETH", "USDC", NFT name
  blockNum: string
  gasUsed: string | null // Not directly from getAssetTransfers, would need tx receipt
  gasPrice: string | null // Not directly from getAssetTransfers, would need tx receipt
  metadata: {
    blockTimestamp: string // ISO string
  }
}

export interface TokenBalance {
  contractAddress: string
  symbol: string
  balance: string // Formatted balance string (e.g., "1.2345")
  decimals: number
  usdValue: number // Mocked USD value for now
}
