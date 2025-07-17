import { Redis } from "@upstash/redis"

class RedisCache {
  private client: Redis
  private isEnabled: boolean

  constructor() {
    // Use Upstash Redis which is serverless-friendly
    this.isEnabled = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

    if (this.isEnabled) {
      this.client = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      })
    } else {
      console.warn("Redis not configured, using in-memory fallback")
      // Fallback to in-memory cache for development
      this.client = new InMemoryCache() as any
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled) {
      return (this.client as any).get(key)
    }

    try {
      const data = await this.client.get(key)
      return data as T
    } catch (error) {
      console.error("Redis get error:", error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isEnabled) {
      return (this.client as any).set(key, value, ttlSeconds)
    }

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, JSON.stringify(value))
      } else {
        await this.client.set(key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error("Redis set error:", error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isEnabled) {
      return (this.client as any).del(key)
    }

    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error("Redis del error:", error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isEnabled) {
      return (this.client as any).invalidatePattern(pattern)
    }

    try {
      // Upstash doesn't support KEYS command, so we'll use a different approach
      // For now, we'll just delete specific known keys
      console.warn("Pattern invalidation not fully supported with Upstash, consider manual cache keys")
    } catch (error) {
      console.error("Redis invalidate pattern error:", error)
    }
  }
}

// In-memory fallback cache for development
class InMemoryCache {
  private cache = new Map<string, { value: any; expires?: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null

    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return typeof item.value === "string" ? JSON.parse(item.value) : item.value
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    this.cache.set(key, {
      value: typeof value === "object" ? JSON.stringify(value) : value,
      expires,
    })
    return true
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

// Initialize Upstash Redis client
// Environment variables are automatically provided by Vercel for Upstash integration
const redisClient = new Redis({
  url: process.env.KV_REST_API_URL || "http://localhost:8079", // Fallback for local dev
  token: process.env.KV_REST_API_TOKEN || "local_token", // Fallback for local dev
})

export const redis = new RedisCache()

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  ENS_DATA: 15 * 60, // 15 minutes
  NFT_DATA: 5 * 60, // 5 minutes
  PROFILE_DATA: 10 * 60, // 10 minutes
  ACTIVITY_DATA: 2 * 60, // 2 minutes
  SOCIAL_DATA: 30 * 60, // 30 minutes
} as const

// You can add more Redis-related utility functions here if needed
// For example, a function to clear cache for a specific key pattern
export async function clearCache(pattern: string) {
  const keys = await redisClient.keys(pattern)
  if (keys.length > 0) {
    await redisClient.del(...keys)
    console.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`)
  }
}
