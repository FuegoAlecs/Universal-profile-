import type { AlchemyProfile } from "@/types/alchemy"
import { redis } from "@/lib/redis"
import { Alchemy, Network } from "@alch/alchemy-sdk" // Import Alchemy SDK

// Configure Alchemy SDK (same as in lib/alchemy.ts, ensure consistency or pass instance)
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: (process.env.NEXT_PUBLIC_ALCHEMY_NETWORK as Network) || Network.ETH_SEPOLIA,
}
const alchemy = new Alchemy(settings)

const PROFILE_CACHE_TTL = 60 * 15 // 15 minutes
const SOCIAL_PROFILE_CACHE_TTL = 60 * 60 * 24 // 24 hours

export const profileService = {
  async getProfile(address: string): Promise<AlchemyProfile | null> {
    const cacheKey = `profile:${address}`
    const cachedProfile = await redis.get<AlchemyProfile>(cacheKey)
    if (cachedProfile) {
      console.log(`Cache hit for profile: ${address}`)
      return cachedProfile
    }

    console.log(`Cache miss for profile: ${address}, fetching...`)

    // Fetch ENS data using Alchemy SDK
    let ensName: string | null = null
    const ensAvatar: string | null = null
    if (alchemy.config.apiKey) {
      try {
        ensName = await alchemy.core.lookupEnsByAddress(address)
        if (ensName) {
          // Alchemy SDK's lookupEnsByAddress doesn't directly provide ENS avatar.
          // You might need to fetch the ENS NFT metadata for the avatar.
          // For simplicity, we'll keep it null for now or use a placeholder.
          // Example (requires ENS contract address and token ID for the name):
          // const ensNft = await alchemy.nft.getNftMetadata("0x57f1887a8bf19b14fc0df6fd9b2acc9af147aa99", "123");
          // ensAvatar = ensNft.media?.[0]?.gateway || null;
        }
      } catch (e) {
        console.error("Error fetching ENS data from Alchemy:", e)
      }
    } else {
      console.warn("Alchemy API Key not configured. Using mock ENS data.")
      const ensNames = {
        "0x1234567890abcdef1234567890abcdef12345678": "vitalik.eth",
        "0xabcdef1234567890abcdef1234567890abcdef12": "satoshi.eth",
        "0xAbc123Def4567890Abc123Def4567890Abc123D": "testuser.eth",
      }
      ensName = (ensNames as any)[address] || null
    }

    const profile: AlchemyProfile = {
      address,
      ensName: ensName,
      ensAvatar: ensAvatar, // Still placeholder for now
      zkVerified: Math.random() > 0.5, // Mock ZK verification
      isSociallyVerified: false, // Will be set by resolveSocialProfiles
      linkedWallets: [address, "0xAbc123Def4567890Abc123Def4567890Abc123D"], // Mock linked wallets
      twitterHandle: null,
      twitterFollowers: null,
      lensFollowers: null,
      farcasterFollowers: null,
    }

    // Enrich with social profiles (still mock for now)
    const socialData = await this.resolveSocialProfiles(address)
    profile.twitterHandle = socialData.twitterHandle
    profile.twitterFollowers = socialData.twitterFollowers
    profile.lensFollowers = socialData.lensFollowers
    profile.farcasterFollowers = socialData.farcasterFollowers
    profile.isSociallyVerified = socialData.isSociallyVerified

    await redis.setex(cacheKey, PROFILE_CACHE_TTL, profile)
    return profile
  },

  async resolveEns(address: string): Promise<string | null> {
    // This function is now redundant as ENS resolution is handled directly in getProfile
    // Keeping it for compatibility if other parts of the code still call it.
    if (alchemy.config.apiKey) {
      try {
        return await alchemy.core.lookupEnsByAddress(address)
      } catch (e) {
        console.error("Error resolving ENS in resolveEns:", e)
        return null
      }
    } else {
      const ensNames = {
        "0x1234567890abcdef1234567890abcdef12345678": "vitalik.eth",
        "0xabcdef1234567890abcdef1234567890abcdef12": "satoshi.eth",
        "0xAbc123Def4567890Abc123Def4567890Abc123D": "testuser.eth",
      }
      return (ensNames as any)[address] || null
    }
  },

  async resolveSocialProfiles(address: string): Promise<{
    twitterHandle: string | null
    twitterFollowers: number | null
    lensFollowers: number | null
    farcasterFollowers: number | null
    isSociallyVerified: boolean
  }> {
    const cacheKey = `social_profile:${address}`
    const cachedSocialData = await redis.get<{
      twitterHandle: string | null
      twitterFollowers: number | null
      lensFollowers: number | null
      farcasterFollowers: number | null
      isSociallyVerified: boolean
    }>(cacheKey)

    if (cachedSocialData) {
      console.log(`Cache hit for social profile: ${address}`)
      return cachedSocialData
    }

    console.log(`Cache miss for social profile: ${address}, fetching...`)

    // Mock social data
    const twitter = await this.mockTwitterResolution(address)
    const lens = await this.mockLensResolution(address)
    const farcaster = await this.mockFarcasterResolution(address)

    // Simple mock for social verification: true if at least two social accounts are linked
    const linkedSocialAccounts = [twitter.handle, lens.handle, farcaster.handle].filter(Boolean).length
    const isSociallyVerified = linkedSocialAccounts >= 2

    const socialData = {
      twitterHandle: twitter.handle,
      twitterFollowers: twitter.followers,
      lensFollowers: lens.followers,
      farcasterFollowers: farcaster.followers,
      isSociallyVerified,
    }

    await redis.setex(cacheKey, SOCIAL_PROFILE_CACHE_TTL, socialData)
    return socialData
  },

  async mockTwitterResolution(address: string): Promise<{ handle: string | null; followers: number | null }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))
    const twitterHandles: { [key: string]: { handle: string; followers: number } } = {
      "0x1234567890abcdef1234567890abcdef12345678": { handle: "vitalik_eth", followers: 1200000 },
      "0xAbc123Def4567890Abc123Def4567890Abc123D": { handle: "cyber_punk_dev", followers: 50000 },
    }
    return twitterHandles[address] || { handle: null, followers: null }
  },

  async mockLensResolution(address: string): Promise<{ handle: string | null; followers: number | null }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))
    const lensHandles: { [key: string]: { handle: string; followers: number } } = {
      "0x1234567890abcdef1234567890abcdef12345678": { handle: "vitalik.lens", followers: 800000 },
      "0xAbc123Def4567890Abc123Def4567890Abc123D": { handle: "metaverse_explorer.lens", followers: 30000 },
    }
    return lensHandles[address] || { handle: null, followers: null }
  },

  async mockFarcasterResolution(address: string): Promise<{ handle: string | null; followers: number | null }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))
    const farcasterHandles: { [key: string]: { handle: string; followers: number } } = {
      "0x1234567890abcdef1234567890abcdef12345678": { handle: "vitalik", followers: 600000 },
      "0xAbc123Def4567890Abc123Def4567890Abc123D": { handle: "web3_innovator", followers: 25000 },
    }
    return farcasterHandles[address] || { handle: null, followers: null }
  },
}
