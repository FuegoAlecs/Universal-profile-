"use client"

import { useState, useEffect } from "react"
import { profileService } from "@/lib/profile-service"
import { webSocketService } from "@/lib/websocket-service"
import type { AlchemyProfile } from "@/types/alchemy"

export function useAlchemyProfile(address: string) {
  const [data, setData] = useState<AlchemyProfile | undefined>()
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProfile = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const profile = await profileService.resolveSocialProfiles(address)
      setData(profile)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [address])

  // Set up WebSocket subscription for real-time updates
  useEffect(() => {
    if (!address) return

    const handleUpdate = (data: any) => {
      // Invalidate cache and refetch on new activity
      profileService.invalidateUserCache(address)
      fetchProfile()
    }

    const subscriptionId = webSocketService.subscribeToAddress(address, handleUpdate)

    return () => {
      if (subscriptionId) {
        webSocketService.unsubscribe(subscriptionId.toString(), handleUpdate)
      }
    }
  }, [address])

  return {
    data,
    error,
    isLoading,
    mutate: fetchProfile,
  }
}
