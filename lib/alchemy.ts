import { Alchemy, Network, Utils } from "@alch/alchemy-sdk"
import type { Nft, AssetTransfersResult } from "@alch/alchemy-sdk" // Import types from Alchemy SDK
import type { AlchemyNFT, AlchemyActivity, TokenBalance } from "@/types/alchemy"
import { redis } from "@/lib/redis"

// Configure Alchemy SDK
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Use server-side API key
  network: (process.env.NEXT_PUBLIC_ALCHEMY_NETWORK as Network) || Network.ETH_SEPOLIA, // Default to Sepolia
}

const alchemy = new Alchemy(settings)

const NFT_CACHE_TTL = 60 * 5 // 5 minutes
const ACTIVITY_CACHE_TTL = 60 * 2 // 2 minutes
const TOKEN_BALANCE_CACHE_TTL = 60 * 5 // 5 minutes

export const nftService = {
  async getNfts(address: string): Promise<AlchemyNFT[]> {
    if (!alchemy.config.apiKey) {
      console.warn("Alchemy API Key not configured. Using mock NFT data.")
      return [
        {
          contract: { address: "0xabc123", name: "Mock Collection", symbol: "MOCK" },
          tokenId: "1",
          name: "Mock NFT 1",
          description: "This is a mock NFT.",
          image: "/placeholder.jpg",
          collectionName: "Mock Collection",
          tokenType: "ERC721",
          rarity: 0.1,
          attributes: [{ trait_type: "Mock Trait", value: "Value 1" }],
          floorPrice: 0.01,
          chain: "Ethereum",
        },
      ]
    }

    const cacheKey = `nfts:${address}`
    const cachedNfts = await redis.get<AlchemyNFT[]>(cacheKey)
    if (cachedNfts) {
      console.log(`Cache hit for NFTs: ${address}`)
      return cachedNfts
    }

    console.log(`Cache miss for NFTs: ${address}, fetching from Alchemy...`)
    try {
      const nftsResponse = await alchemy.nft.getNftsForOwner(address)
      const nfts: AlchemyNFT[] = nftsResponse.ownedNfts.map((nft: Nft) => ({
        contract: {
          address: nft.contract.address,
          name: nft.contract.name || null,
          symbol: nft.contract.symbol || null,
        },
        tokenId: nft.tokenId,
        name: nft.title || null,
        description: nft.description || null,
        image: nft.media.length > 0 ? nft.media[0].gateway : null,
        collectionName: nft.contract.name || null,
        tokenType: nft.tokenType,
        rarity: undefined, // Alchemy SDK doesn't provide rarity directly
        floorPrice: undefined, // Alchemy SDK doesn't provide floor price directly
        attributes: (nft.rawMetadata?.attributes as { trait_type: string; value: string }[]) || [],
        chain: settings.network.split("_")[1] || "Ethereum", // Extract chain name from network
      }))

      await redis.setex(cacheKey, NFT_CACHE_TTL, nfts)
      return nfts
    } catch (error) {
      console.error("Error fetching NFTs from Alchemy:", error)
      // Fallback to mock data if Alchemy fails
      return [
        {
          contract: { address: "0xabc123", name: "Mock Collection", symbol: "MOCK" },
          tokenId: "1",
          name: "Mock NFT 1",
          description: "This is a mock NFT.",
          image: "/placeholder.jpg",
          collectionName: "Mock Collection",
          tokenType: "ERC721",
          rarity: 0.1,
          attributes: [{ trait_type: "Mock Trait", value: "Value 1" }],
          floorPrice: 0.01,
          chain: "Ethereum",
        },
      ]
    }
  },
}

export const activityService = {
  async getActivity(address: string): Promise<AlchemyActivity[]> {
    if (!alchemy.config.apiKey) {
      console.warn("Alchemy API Key not configured. Using mock activity data.")
      return [
        {
          hash: "0xmockhash1",
          from: "0xMockSender1",
          to: "0xMockRecipient1",
          value: "0.1 ETH",
          timestamp: Date.now() / 1000 - 3600,
          category: "external",
          asset: "ETH",
          blockNum: "12345678",
          gasUsed: null,
          gasPrice: null,
          metadata: { blockTimestamp: new Date(Date.now() - 3600000).toISOString() },
        },
      ]
    }

    const cacheKey = `activity:${address}`
    const cachedActivity = await redis.get<AlchemyActivity[]>(cacheKey)
    if (cachedActivity) {
      console.log(`Cache hit for activity: ${address}`)
      return cachedActivity
    }

    console.log(`Cache miss for activity: ${address}, fetching from Alchemy...`)
    try {
      const transfersResponse = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        toAddress: address, // Include transfers to the address as well
        excludeZeroValue: true,
        category: ["erc20", "erc721", "erc1155", "external", "internal"],
        withMetadata: true,
        maxCount: 50, // Fetch a reasonable number of activities
      })

      const activity: AlchemyActivity[] = transfersResponse.transfers.map((tx: AssetTransfersResult) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || null,
        value: tx.value ? `${tx.value} ${tx.asset}` : null, // Format value and asset
        timestamp: new Date(tx.metadata.blockTimestamp).getTime() / 1000, // Convert to Unix timestamp
        category: tx.category,
        asset: tx.asset || null,
        blockNum: Utils.hexToDecimal(tx.blockNum).toString(), // Convert hex block number to decimal string
        gasUsed: null, // Alchemy's getAssetTransfers doesn't directly provide gasUsed/gasPrice
        gasPrice: null, // These would require fetching transaction receipts
        metadata: {
          blockTimestamp: tx.metadata.blockTimestamp,
        },
      }))

      // Sort by timestamp descending
      activity.sort((a, b) => b.timestamp - a.timestamp)

      await redis.setex(cacheKey, ACTIVITY_CACHE_TTL, activity)
      return activity
    } catch (error) {
      console.error("Error fetching activity from Alchemy:", error)
      // Fallback to mock data if Alchemy fails
      return [
        {
          hash: "0xmockhash1",
          from: "0xMockSender1",
          to: "0xMockRecipient1",
          value: "0.1 ETH",
          timestamp: Date.now() / 1000 - 3600,
          category: "external",
          asset: "ETH",
          blockNum: "12345678",
          gasUsed: null,
          gasPrice: null,
          metadata: { blockTimestamp: new Date(Date.now() - 3600000).toISOString() },
        },
      ]
    }
  },
}

export const tokenService = {
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    if (!alchemy.config.apiKey) {
      console.warn("Alchemy API Key not configured. Using mock token balance data.")
      return [
        {
          contractAddress: "0xmocketh",
          symbol: "ETH",
          balance: "1.2345",
          decimals: 18,
          usdValue: 4500,
        },
        {
          contractAddress: "0xmockusdc",
          symbol: "USDC",
          balance: "500.00",
          decimals: 6,
          usdValue: 500,
        },
      ]
    }

    const cacheKey = `token_balances:${address}`
    const cachedBalances = await redis.get<TokenBalance[]>(cacheKey)
    if (cachedBalances) {
      console.log(`Cache hit for token balances: ${address}`)
      return cachedBalances
    }

    console.log(`Cache miss for token balances: ${address}, fetching from Alchemy...`)
    try {
      const balancesResponse = await alchemy.core.getTokenBalances(address)
      const tokenBalances: TokenBalance[] = []

      for (const token of balancesResponse.tokenBalances) {
        // Get metadata for each token to get symbol and decimals
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
        if (metadata.symbol && metadata.decimals !== null) {
          const balance = Utils.formatUnits(token.tokenBalance || "0", metadata.decimals)
          // For USD value, you'd need a separate price oracle (e.g., CoinGecko API)
          // For now, mock USD value
          const usdValue = Number.parseFloat(balance) * (Math.random() * 100 + 1) // Mock USD value

          tokenBalances.push({
            contractAddress: token.contractAddress,
            symbol: metadata.symbol,
            balance: balance,
            decimals: metadata.decimals,
            usdValue: usdValue,
          })
        }
      }

      await redis.setex(cacheKey, TOKEN_BALANCE_CACHE_TTL, tokenBalances)
      return tokenBalances
    } catch (error) {
      console.error("Error fetching token balances from Alchemy:", error)
      // Fallback to mock data if Alchemy fails
      return [
        {
          contractAddress: "0xmocketh",
          symbol: "ETH",
          balance: "1.2345",
          decimals: 18,
          usdValue: 4500,
        },
        {
          contractAddress: "0xmockusdc",
          symbol: "USDC",
          balance: "500.00",
          decimals: 6,
          usdValue: 500,
        },
      ]
    }
  },
}
