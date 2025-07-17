import type { Nft, Activity } from "@/types/alchemy"
import { redis } from "@/lib/redis"

const NFT_CACHE_TTL = 60 * 5 // 5 minutes
const ACTIVITY_CACHE_TTL = 60 * 2 // 2 minutes

export const nftService = {
  async getNfts(address: string): Promise<Nft[]> {
    const cacheKey = `nfts:${address}`
    const cachedNfts = await redis.get<Nft[]>(cacheKey)
    if (cachedNfts) {
      console.log(`Cache hit for NFTs: ${address}`)
      return cachedNfts
    }

    console.log(`Cache miss for NFTs: ${address}, fetching...`)
    // Mock data for now, replace with actual Alchemy SDK calls
    const mockNfts: Nft[] = [
      {
        contractAddress: "0xabc123",
        tokenId: "1",
        name: "Cyberpunk Glitch",
        description: "A unique digital art piece from the Glitch series.",
        imageUrl: "/placeholder.jpg",
        collectionName: "Digital Glitches",
        tokenType: "ERC721",
        rarity: 0.05,
        attributes: [{ trait_type: "Background", value: "Neon City" }],
      },
      {
        contractAddress: "0xdef456",
        tokenId: "2",
        name: "Metaverse Explorer Pass",
        description: "Grants access to exclusive metaverse zones.",
        imageUrl: "/placeholder.jpg",
        collectionName: "Explorer Guild",
        tokenType: "ERC1155",
        rarity: 0.1,
        attributes: [{ trait_type: "Tier", value: "Gold" }],
      },
      {
        contractAddress: "0xghi789",
        tokenId: "3",
        name: "Pixelated Dream",
        description: "A nostalgic pixel art collectible.",
        imageUrl: "/placeholder.jpg",
        collectionName: "Retro Dreams",
        tokenType: "ERC721",
        rarity: 0.02,
        attributes: [{ trait_type: "Style", value: "8-bit" }],
      },
    ]

    await redis.setex(cacheKey, NFT_CACHE_TTL, mockNfts)
    return mockNfts
  },
}

export const activityService = {
  async getActivity(address: string): Promise<Activity[]> {
    const cacheKey = `activity:${address}`
    const cachedActivity = await redis.get<Activity[]>(cacheKey)
    if (cachedActivity) {
      console.log(`Cache hit for activity: ${address}`)
      return cachedActivity
    }

    console.log(`Cache miss for activity: ${address}, fetching...`)
    // Mock data for now, replace with actual Alchemy SDK calls
    const mockActivity: Activity[] = [
      {
        hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        from: "0xAbc123Def4567890Abc123Def4567890Abc123D",
        to: "0xRecipientAddress1",
        value: "0.5 ETH",
        timestamp: Date.now() - 3600000, // 1 hour ago
        type: "transfer",
        asset: "ETH",
        blockNum: "12345678",
        gasUsed: "21000",
        gasPrice: "20 Gwei",
      },
      {
        hash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
        from: "0xMintingContractAddress",
        to: "0xAbc123Def4567890Abc123Def4567890Abc123D",
        value: "1 NFT",
        timestamp: Date.now() - 7200000, // 2 hours ago
        type: "mint",
        asset: "Cyberpunk Glitch",
        blockNum: "12345600",
        gasUsed: "150000",
        gasPrice: "30 Gwei",
      },
      {
        hash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
        from: "0xAbc123Def4567890Abc123Def4567890Abc123D",
        to: "0xSwapContractAddress",
        value: "100 USDC",
        timestamp: Date.now() - 10800000, // 3 hours ago
        type: "swap",
        asset: "USDC",
        blockNum: "12345500",
        gasUsed: "80000",
        gasPrice: "25 Gwei",
      },
    ]

    await redis.setex(cacheKey, ACTIVITY_CACHE_TTL, mockActivity)
    return mockActivity
  },
}
