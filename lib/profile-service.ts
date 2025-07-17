import { alchemyRequest, ALCHEMY_CONFIG, type SupportedChain } from "./alchemy"
import { redis, CACHE_TTL } from "./redis"
import type { AlchemyProfile, AlchemyNFT, AlchemyActivity } from "@/types/alchemy"

export class ProfileService {
  // ENS Resolution with caching
  async resolveENS(address: string): Promise<{ name?: string; avatar?: string; bio?: string }> {
    const cacheKey = `ens:${address.toLowerCase()}`
    const cached = await redis.get<any>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      // Use direct API calls instead of SDK
      const ensName = await this.resolveENSName(address)
      let avatar: string | undefined
      let bio: string | undefined

      if (ensName) {
        try {
          avatar = await this.getENSAvatar(ensName)
        } catch (error) {
          console.warn("Failed to get ENS avatar:", error)
        }

        try {
          bio = await this.getENSTextRecord(ensName, "description")
        } catch (error) {
          console.warn("Failed to get ENS text records:", error)
        }
      }

      const result = { name: ensName || undefined, avatar, bio }
      await redis.set(cacheKey, result, CACHE_TTL.ENS_DATA)

      return result
    } catch (error) {
      console.error("ENS resolution error:", error)
      return {}
    }
  }

  private async resolveENSName(address: string): Promise<string | null> {
    try {
      const result = await alchemyRequest("ethereum", "alchemy_resolveAddress", [address])
      return result
    } catch (error) {
      console.error("ENS name resolution error:", error)
      return null
    }
  }

  private async getENSAvatar(ensName: string): Promise<string | undefined> {
    try {
      const result = await alchemyRequest("ethereum", "alchemy_getENSAvatar", [ensName])
      return result
    } catch (error) {
      console.error("ENS avatar error:", error)
      return undefined
    }
  }

  private async getENSTextRecord(ensName: string, key: string): Promise<string | undefined> {
    try {
      const result = await alchemyRequest("ethereum", "alchemy_getENSTextRecord", [ensName, key])
      return result
    } catch (error) {
      console.error("ENS text record error:", error)
      return undefined
    }
  }

  // Multi-chain NFT aggregation
  async aggregateNFTs(address: string): Promise<AlchemyNFT[]> {
    const cacheKey = `nfts:${address.toLowerCase()}`
    const cached = await redis.get<AlchemyNFT[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const nftPromises = Object.entries(ALCHEMY_CONFIG.networks).map(async ([chainName, config]) => {
        try {
          const result = await alchemyRequest(chainName as SupportedChain, "alchemy_getNFTs", [
            address,
            { excludeFilters: ["SPAM"], omitMetadata: false },
          ])

          return (result.ownedNfts || []).map((nft: any) => ({
            contract: {
              address: nft.contract.address,
              name: nft.contract.name || "Unknown",
              symbol: nft.contract.symbol || "UNKNOWN",
            },
            tokenId: nft.id.tokenId,
            name: nft.title || `#${nft.id.tokenId}`,
            description: nft.description,
            image: nft.media?.[0]?.gateway || nft.media?.[0]?.raw,
            chain: chainName as SupportedChain,
            attributes: nft.metadata?.attributes || [],
          }))
        } catch (error) {
          console.error(`Error fetching NFTs from ${chainName}:`, error)
          return []
        }
      })

      const results = await Promise.all(nftPromises)
      const allNFTs = results.flat()

      await redis.set(cacheKey, allNFTs, CACHE_TTL.NFT_DATA)
      return allNFTs
    } catch (error) {
      console.error("NFT aggregation error:", error)
      return []
    }
  }

  // Activity feed with smart categorization
  async getActivityFeed(address: string): Promise<AlchemyActivity[]> {
    const cacheKey = `activity:${address.toLowerCase()}`
    const cached = await redis.get<AlchemyActivity[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const result = await alchemyRequest("ethereum", "alchemy_getAssetTransfers", [
        {
          fromAddress: address,
          toAddress: address,
          category: ["external", "erc20", "erc721", "erc1155"],
          maxCount: 50,
          order: "desc",
        },
      ])

      const activities: AlchemyActivity[] = (result.transfers || []).map((transfer: any) => {
        // Smart categorization
        let category: AlchemyActivity["category"] = "external"

        if (transfer.category === "erc721" || transfer.category === "erc1155") {
          category = transfer.from?.toLowerCase() === address.toLowerCase() ? "send" : "receive"
        } else if (transfer.category === "erc20") {
          if (this.isSwapTransaction(transfer)) {
            category = "swap"
          } else if (this.isStakingTransaction(transfer)) {
            category = "stake"
          } else {
            category = transfer.from?.toLowerCase() === address.toLowerCase() ? "send" : "receive"
          }
        }

        return {
          hash: transfer.hash,
          blockNum: transfer.blockNum,
          from: transfer.from || "",
          to: transfer.to || "",
          value: transfer.value?.toString(),
          category,
          metadata: {
            blockTimestamp: Date.now() / 1000, // Simplified for demo
          },
        }
      })

      await redis.set(cacheKey, activities, CACHE_TTL.ACTIVITY_DATA)
      return activities
    } catch (error) {
      console.error("Activity feed error:", error)
      return []
    }
  }

  // Social profile resolution
  async resolveSocialProfiles(address: string): Promise<AlchemyProfile> {
    const cacheKey = `social:${address.toLowerCase()}`
    const cached = await redis.get<AlchemyProfile>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const ensData = await this.resolveENS(address)

      const profile: AlchemyProfile = {
        ens: ensData.name,
        avatar: ensData.avatar,
        bio: ensData.bio,
        lens: this.mockLensResolution(address),
        farcaster: this.mockFarcasterResolution(address),
      }

      await redis.set(cacheKey, profile, CACHE_TTL.SOCIAL_DATA)
      return profile
    } catch (error) {
      console.error("Social profile resolution error:", error)
      return {}
    }
  }

  // Helper methods
  private isSwapTransaction(transfer: any): boolean {
    const dexRouters = [
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2
      "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3
      "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f", // SushiSwap
    ]

    return dexRouters.some((router) => transfer.to?.toLowerCase() === router.toLowerCase())
  }

  private isStakingTransaction(transfer: any): boolean {
    const stakingContracts = [
      "0x00000000219ab540356cbb839cbe05303d7705fa", // ETH 2.0 Deposit
      "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb", // sETH
    ]

    return stakingContracts.some((contract) => transfer.to?.toLowerCase() === contract.toLowerCase())
  }

  private mockLensResolution(address: string): string | undefined {
    const knownAddresses: Record<string, string> = {
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "vitalik.lens",
      "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b": "vitalik.lens",
    }

    return knownAddresses[address.toLowerCase()]
  }

  private mockFarcasterResolution(address: string): string | undefined {
    const knownAddresses: Record<string, string> = {
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "vitalik",
      "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b": "vitalik",
    }

    return knownAddresses[address.toLowerCase()]
  }

  // Cache invalidation
  async invalidateUserCache(address: string): Promise<void> {
    const keys = [
      `ens:${address.toLowerCase()}`,
      `nfts:${address.toLowerCase()}`,
      `activity:${address.toLowerCase()}`,
      `social:${address.toLowerCase()}`,
      `profile:${address.toLowerCase()}`,
    ]

    await Promise.all(keys.map((key) => redis.del(key)))
  }
}

export const profileService = new ProfileService()
